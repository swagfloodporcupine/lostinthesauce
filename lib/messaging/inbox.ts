import { adminClient } from "@/lib/supabase/admin";

export type ConversationRow = {
  id: string;
  planner_id: string;
  vendor_id: string;
  listing_id: string | null;
  event_id: string | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type ConversationSummary = ConversationRow & {
  otherParty: { id: string; name: string } | null;
  lastMessage: { body: string; created_at: string; sender_id: string } | null;
  unread: number;
};

export type MessageWithSender = MessageRow & { sender_name: string };

function otherPartyId(conversation: ConversationRow, profileId: string): string {
  return conversation.planner_id === profileId ? conversation.vendor_id : conversation.planner_id;
}

export async function getConversations(
  profileId: string,
): Promise<ConversationSummary[]> {
  const { data, error } = await adminClient
    .from("conversations")
    .select("id, planner_id, vendor_id, listing_id, event_id, created_at")
    .or(`planner_id.eq.${profileId},vendor_id.eq.${profileId}`)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const otherIds = [...new Set(data.map((c) => otherPartyId(c, profileId)))];
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, display_name")
    .in("id", otherIds);
  const nameMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.display_name?.trim() || "Someone"]),
  );

  const convIds = data.map((c) => c.id);
  const { data: messages } = await adminClient
    .from("messages")
    .select("conversation_id, body, created_at, sender_id, read_at")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false });

  const lastMap = new Map<
    string,
    { body: string; created_at: string; sender_id: string }
  >();
  const unreadMap = new Map<string, number>();
  for (const m of messages ?? []) {
    if (!lastMap.has(m.conversation_id)) {
      lastMap.set(m.conversation_id, {
        body: m.body,
        created_at: m.created_at,
        sender_id: m.sender_id,
      });
    }
    if (m.sender_id !== profileId && !m.read_at) {
      unreadMap.set(
        m.conversation_id,
        (unreadMap.get(m.conversation_id) ?? 0) + 1,
      );
    }
  }

  return data.map((c) => {
    const otherId = otherPartyId(c, profileId);
    return {
      ...c,
      otherParty: { id: otherId, name: nameMap.get(otherId) ?? "Someone" },
      lastMessage: lastMap.get(c.id) ?? null,
      unread: unreadMap.get(c.id) ?? 0,
    };
  });
}

export async function getMessages(
  conversationId: string,
): Promise<MessageWithSender[]> {
  const { data, error } = await adminClient
    .from("messages")
    .select(
      "id, conversation_id, sender_id, body, read_at, created_at, profiles!sender_id(display_name)",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as Array<MessageRow & { profiles: { display_name: string | null } | null }>).map(
    (m) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      body: m.body,
      read_at: m.read_at,
      created_at: m.created_at,
      sender_name: m.profiles?.display_name?.trim() || "Someone",
    }),
  );
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<MessageRow | null> {
  const text = body.trim();
  if (!text || text.length > 5000) return null;

  // The service-role client bypasses RLS, so enforce participant authorization
  // in code: a sender may only post into a conversation they belong to.
  const { data: conversation, error: convErr } = await adminClient
    .from("conversations")
    .select("id, planner_id, vendor_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (convErr || !conversation) return null;
  if (conversation.planner_id !== senderId && conversation.vendor_id !== senderId) {
    console.error("[messaging/inbox] sendMessage rejected: sender not a participant", {
      conversationId,
      senderId,
    });
    return null;
  }

  const { data, error } = await adminClient
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, body: text })
    .select()
    .single();
  if (error) {
    console.error("[messaging/inbox] sendMessage failed", error);
    return null;
  }
  return data;
}

export async function markRead(
  conversationId: string,
  profileId: string,
): Promise<void> {
  await adminClient
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", profileId)
    .is("read_at", null);
}

export type Recipient = {
  id: string;
  name: string;
  role: "planner" | "vendor";
};

// Candidate counterparties for starting a new conversation: everyone of the
// opposite role (vendors for a planner, planners for a vendor), excluding self.
export async function getRecipients(
  profileId: string,
  role: "planner" | "vendor",
): Promise<Recipient[]> {
  const targetRole = role === "planner" ? "vendor" : "planner";
  const { data, error } = await adminClient
    .from("profiles")
    .select("id, display_name, account_type")
    .eq("account_type", targetRole)
    .neq("id", profileId)
    .order("display_name", { ascending: true });
  if (error) {
    console.error("[messaging/inbox] getRecipients failed", error);
    return [];
  }
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.display_name?.trim() || "Someone",
    role: (p.account_type === "planner" ? "planner" : "vendor") as Recipient["role"],
  }));
}

export async function ensureConversation(
  plannerId: string,
  vendorId: string,
): Promise<string | null> {
  const { data: existing } = await adminClient
    .from("conversations")
    .select("id")
    .eq("planner_id", plannerId)
    .eq("vendor_id", vendorId)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data, error } = await adminClient
    .from("conversations")
    .insert({ planner_id: plannerId, vendor_id: vendorId })
    .select("id")
    .single();
  if (error) {
    console.error("[messaging/inbox] ensureConversation failed", error);
    return null;
  }
  return data.id;
}
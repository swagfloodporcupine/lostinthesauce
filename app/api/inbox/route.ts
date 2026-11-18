import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/messaging/identity";
import {
  ensureConversation,
  getConversations,
  getMessages,
  getRecipients,
  markRead,
  sendMessage,
} from "@/lib/messaging/inbox";

export async function GET(request: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversation");

  if (conversationId) {
    const messages = await getMessages(conversationId);
    await markRead(conversationId, user.profileId);
    return NextResponse.json({ messages });
  }

  const [conversations, recipients] = await Promise.all([
    getConversations(user.profileId),
    getRecipients(user.profileId, user.role),
  ]);
  return NextResponse.json({
    me: { id: user.profileId, name: user.name, role: user.role },
    conversations,
    recipients,
  });
}

export async function POST(request: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: "send" | "open";
    conversationId?: string;
    otherPartyId?: string;
    message?: string;
  };

  if (body.action === "open" && body.otherPartyId) {
    // ensureConversation expects (plannerId, vendorId). Order depends on who is calling.
    const conversationId =
      user.role === "planner"
        ? await ensureConversation(user.profileId, body.otherPartyId)
        : await ensureConversation(body.otherPartyId, user.profileId);
    if (!conversationId) {
      return NextResponse.json({ error: "could not open conversation" }, { status: 500 });
    }
    return NextResponse.json({ conversationId });
  }

  if (body.action === "send" && body.conversationId && body.message) {
    const message = await sendMessage(body.conversationId, user.profileId, body.message);
    if (!message) return NextResponse.json({ error: "invalid message" }, { status: 400 });
    return NextResponse.json({ message });
  }

  return NextResponse.json({ error: "invalid request" }, { status: 400 });
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, MessageSquareText, PenSquare, Send, SquarePen } from "lucide-react";

type Me = { id: string; name: string; role: "planner" | "vendor" };
type Recipient = { id: string; name: string; role: "planner" | "vendor" };
type Conversation = {
  id: string;
  otherParty: { id: string; name: string } | null;
  lastMessage: { body: string; created_at: string; sender_id: string } | null;
  unread: number;
  created_at: string;
};
type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
  sender_name: string;
};

type Load = {
  me: Me;
  conversations: Conversation[];
  recipients: Recipient[];
};

function timeLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

export function InboxPanel() {
  const [data, setData] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientFilter, setRecipientFilter] = useState("");

  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/inbox", { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 401) {
        setError("Sign in to view your inbox.");
      } else {
        setError("Could not load your inbox. Please try again.");
      }
      setLoading(false);
      return;
    }
    const body = (await res.json()) as Load;
    setData(body);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh the conversation list (and message thread if open) every 6s so new
  // replies and unread badges stay current without a manual reload.
  useEffect(() => {
    const interval = setInterval(() => {
      load();
    }, 6000);
    return () => clearInterval(interval);
  }, [load]);

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function openConversation(conversationId: string) {
    setActiveId(conversationId);
    setComposeOpen(false);
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/inbox?conversation=${encodeURIComponent(conversationId)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const body = (await res.json()) as { messages: Message[] };
      setMessages(body.messages);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
      load();
    }
  }

  async function startConversation(recipientId: string) {
    const res = await fetch("/api/inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "open", otherPartyId: recipientId }),
    });
    if (!res.ok) return;
    const body = (await res.json()) as { conversationId: string };
    setComposeOpen(false);
    setRecipientFilter("");
    await load();
    await openConversation(body.conversationId);
  }

  async function send() {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", conversationId: activeId, message: text }),
      });
      if (res.ok) {
        setDraft("");
        await openConversation(activeId);
      }
    } finally {
      setSending(false);
    }
  }

  const activeConversation = data?.conversations.find((c) => c.id === activeId) ?? null;
  const totalUnread = data?.conversations.reduce((sum, c) => sum + c.unread, 0) ?? 0;
  const visibleRecipients = (data?.recipients ?? []).filter((r) =>
    r.name.toLowerCase().includes(recipientFilter.toLowerCase()),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
      {/* Conversation list */}
      <section aria-label="Conversations" className="rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 p-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><MessageSquareText size={18} className="text-cyan-300" aria-hidden="true" />Inbox</h2>
            <p className="mt-0.5 text-[11px] text-neutral-500">{totalUnread > 0 ? `${totalUnread} unread ${totalUnread === 1 ? "message" : "messages"}` : "You're all caught up"}</p>
          </div>
          <button type="button" onClick={() => setComposeOpen((current) => !current)} className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold transition ${composeOpen ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-neutral-700 text-neutral-300 hover:border-cyan-300/40 hover:text-white"}`}><PenSquare size={14} aria-hidden="true" />New</button>
        </div>

        {composeOpen && (
          <div className="border-b border-neutral-800 p-3">
            <label className="grid gap-1.5 text-[10px] font-medium text-neutral-400">Start a conversation
              <input value={recipientFilter} onChange={(event) => setRecipientFilter(event.target.value)} placeholder="Search people…" className="market-filter-control min-h-9 bg-neutral-950 text-sm" />
            </label>
            <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
              {visibleRecipients.map((recipient) => (
                <button key={recipient.id} type="button" onClick={() => startConversation(recipient.id)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-neutral-300 transition hover:bg-neutral-800 hover:text-white">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-neutral-700 text-[10px] font-bold text-white">{recipient.name.split(/\s+/).slice(0, 2).map((p) => p[0] ?? "").join("").toUpperCase()}</span>
                  <span className="min-w-0 truncate">{recipient.name}</span>
                  <span className="ml-auto shrink-0 text-[9px] uppercase tracking-wider text-neutral-600">{recipient.role}</span>
                </button>
              ))}
              {!visibleRecipients.length && <p className="px-2 py-3 text-center text-[11px] text-neutral-600">No one to message yet.</p>}
            </div>
          </div>
        )}

        <div className="max-h-[560px] divide-y divide-neutral-800/70 overflow-y-auto">
          {loading && <div className="flex items-center justify-center gap-2 py-10 text-xs text-neutral-500"><Loader2 size={15} className="animate-spin" aria-hidden="true" />Loading conversations…</div>}
          {!loading && error && <p className="px-4 py-10 text-center text-xs text-rose-300">{error}</p>}
          {!loading && !error && data && data.conversations.length === 0 && (
            <p className="px-4 py-10 text-center text-xs text-neutral-500">No conversations yet. Use “New” to message someone.</p>
          )}
          {data?.conversations.map((conversation) => (
            <button key={conversation.id} type="button" onClick={() => openConversation(conversation.id)} className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${activeId === conversation.id ? "bg-neutral-800/70" : "hover:bg-neutral-900"}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-700 text-xs font-bold text-white">{conversation.otherParty?.name.split(/\s+/).slice(0, 2).map((p) => p[0] ?? "").join("").toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-white">{conversation.otherParty?.name ?? "Someone"}</span>
                  {conversation.lastMessage && <span className="shrink-0 text-[10px] text-neutral-500">{timeLabel(conversation.lastMessage.created_at)}</span>}
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-neutral-400">{conversation.lastMessage?.body ?? "No messages yet"}</span>
                  {conversation.unread > 0 && <span className="grid size-5 shrink-0 place-items-center rounded-full bg-cyan-300 text-[10px] font-bold text-neutral-950">{conversation.unread}</span>}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Thread */}
      <section aria-label="Message thread" className="flex min-h-[420px] flex-col rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
        {!activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="grid size-14 place-items-center rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-600"><MessageSquareText size={24} aria-hidden="true" /></span>
            <p className="text-sm font-medium text-neutral-300">Select a conversation</p>
            <p className="max-w-xs text-xs text-neutral-500">Messages with your event contacts appear here. Use “New” to reach someone you haven't spoken to yet.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-neutral-800 p-4">
              <button type="button" aria-label="Back to conversations" onClick={() => setActiveId(null)} className="grid size-8 place-items-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white lg:hidden"><ArrowLeft size={16} aria-hidden="true" /></button>
              <span className="grid size-9 place-items-center rounded-full bg-neutral-700 text-xs font-bold text-white">{activeConversation?.otherParty?.name.split(/\s+/).slice(0, 2).map((p) => p[0] ?? "").join("").toUpperCase()}</span>
              <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-white">{activeConversation?.otherParty?.name ?? "Conversation"}</h3><p className="text-[10px] text-neutral-500">Conversation with {activeConversation?.otherParty?.name ?? "your contact"}</p></div>
            </div>

            <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto p-4" aria-live="polite">
              {messagesLoading && <div className="flex items-center justify-center gap-2 py-8 text-xs text-neutral-500"><Loader2 size={15} className="animate-spin" aria-hidden="true" />Loading messages…</div>}
              {!messagesLoading && messages.length === 0 && <p className="py-8 text-center text-xs text-neutral-500">No messages yet. Say hi 👋</p>}
              {messages.map((message) => {
                const mine = message.sender_id === data?.me.id;
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${mine ? "rounded-br-md bg-cyan-300 text-neutral-950" : "rounded-bl-md border border-neutral-800 bg-neutral-950/70 text-neutral-100"}`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
                      <p className={`mt-1 text-right text-[9px] ${mine ? "text-neutral-900/70" : "text-neutral-600"}`}>{timeLabel(message.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-neutral-800 p-3">
              <form
                className="flex items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  send();
                }}
              >
                <label className="sr-only" htmlFor="inbox-message">Message</label>
                <textarea
                  id="inbox-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      send();
                    }
                  }}
                  placeholder={`Message ${activeConversation?.otherParty?.name ?? ""}…`}
                  rows={1}
                  maxLength={5000}
                  className="market-filter-control min-h-10 flex-1 resize-none bg-neutral-950 py-2.5 text-sm"
                />
                <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message" className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan-300 text-neutral-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">
                  {sending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
                </button>
              </form>
              <p className="mt-1.5 text-[9px] text-neutral-600"><span className="inline-flex items-center gap-1"><SquarePen size={9} aria-hidden="true" />Enter to send · Shift+Enter for a new line</span></p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

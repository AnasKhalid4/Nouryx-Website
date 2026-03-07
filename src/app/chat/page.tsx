"use client";

import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, Trash2, Loader2, Send, ImagePlus, ArrowLeft } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useConversations, useDeleteConversation, useChatMessages, useSendMessage } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { uploadChatImage } from "@/lib/firebase/storage";
import type { ConversationModel } from "@/types/conversation";

function timeAgo(date: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function ConversationPanel({
  conv,
  uid,
  isActive,
  onClick,
  onDelete,
}: {
  conv: ConversationModel;
  uid: string | null;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const isUnread = conv.lastSenderId && conv.lastSenderId !== uid;
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group border-b border-border/30 ${isActive ? "bg-[#F5EDE6]" : "hover:bg-[#FAFAF8]"
        }`}
    >
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0 relative overflow-hidden">
        {conv.otherImage ? (
          <Image src={conv.otherImage} alt="" fill className="object-cover" sizes="48px" />
        ) : (
          <span className="text-[#C9AA8B] font-bold text-sm">
            {conv.otherName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm truncate ${isUnread ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
            {conv.otherName}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {isUnread && (
              <span className="h-2.5 w-2.5 rounded-full bg-[#25D366] shrink-0" />
            )}
            <span className="text-[10px] text-muted-foreground">
              {timeAgo(conv.lastMessageAt)}
            </span>
          </div>
        </div>
        <p className={`text-xs truncate mt-0.5 ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
          {conv.lastMessage || "No messages yet"}
        </p>
      </div>
      <button
        className="h-8 w-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all shrink-0"
        onClick={(e) => onDelete(conv.conversationId, e)}
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </button>
    </div>
  );
}

function ChatThread({ conversationId, uid }: { conversationId: string; uid: string | null }) {
  const { t } = useLocale();
  const { data: messages, isLoading } = useChatMessages(conversationId);
  const sendMessage = useSendMessage();
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherImage, setOtherImage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!conversationId || !uid) return;
    (async () => {
      const convDoc = await getDoc(doc(db, "conversations", conversationId));
      if (!convDoc.exists()) return;
      const data = convDoc.data();
      const parts = (data.participants as string[]) || [];
      const otherId = parts.find((p) => p !== uid) || "";
      const userInfo = (data.userInfo as Record<string, { name?: string; image?: string }>) || {};
      const info = userInfo[otherId] || {};
      setOtherName(info.name || "Unknown");
      setOtherImage(info.image || "");
    })();
  }, [conversationId, uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !uid || isSending) return;
    setIsSending(true);
    setMessageText("");
    try {
      await sendMessage.mutateAsync({ conversationId, text });
    } catch {
      setMessageText(text);
    } finally {
      setIsSending(false);
    }
  }, [messageText, uid, isSending, conversationId, sendMessage]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid || isUploading) return;
    setIsUploading(true);
    try {
      const imageUrl = await uploadChatImage(file);
      await sendMessage.mutateAsync({ conversationId, text: "", imageUrl });
    } catch {
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [uid, isUploading, conversationId, sendMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#F0F2F5] border-b border-border shrink-0">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0 relative overflow-hidden">
          {otherImage ? (
            <Image src={otherImage} alt="" fill className="object-cover" sizes="40px" />
          ) : (
            <span className="text-[#C9AA8B] font-bold text-sm">
              {otherName.charAt(0).toUpperCase() || "?"}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{otherName || "Loading..."}</h2>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
        ref={scrollRef}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e8d5c0' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", backgroundColor: "#EDE9E1" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#C9AA8B]" />
          </div>
        ) : (messages || []).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Start the conversation!
          </p>
        ) : (
          (messages || []).map((msg) => {
            const isMe = msg.senderId === uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[65%] px-3 py-2 rounded-lg text-sm shadow-sm ${isMe
                      ? "bg-[#D9FDD3] text-[#111B21] rounded-tr-none"
                      : "bg-white text-[#111B21] rounded-tl-none"
                    }`}
                >
                  {msg.imageUrl ? (
                    <div className="w-48 h-48 rounded-lg overflow-hidden relative">
                      <Image src={msg.imageUrl} alt="Shared image" fill className="object-cover" sizes="192px" />
                    </div>
                  ) : (
                    <p className="leading-relaxed">{msg.text}</p>
                  )}
                  <p className="text-[10px] mt-1 text-right text-muted-foreground">
                    {msg.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input bar */}
      <div className="bg-[#F0F2F5] border-t border-border px-4 py-2 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            type="button"
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground shrink-0"
            aria-label="Attach image"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          </button>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={t.chat.placeholder}
            className="flex-1 h-10 rounded-full bg-white border-border/50"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!messageText.trim() || isSending}
            className="h-10 w-10 rounded-full bg-[#00A884] hover:bg-[#008f6f] text-white disabled:opacity-50 shrink-0"
            aria-label="Send message"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { t } = useLocale();
  const { uid } = useAuth();
  const { data: conversations, isLoading } = useConversations();
  const deleteConversation = useDeleteConversation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  const filtered = (conversations || []).filter((c) =>
    c.otherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    deleteConversation.mutate(conversationId, {
      onSuccess: () => {
        toast.success("Conversation deleted");
        if (activeConvId === conversationId) setActiveConvId(null);
      },
    });
  };

  const activeConv = filtered.find((c) => c.conversationId === activeConvId) || null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* ── Mobile layout (< lg): redirect-style list → separate thread page ── */}
      <div className="lg:hidden flex-1 flex flex-col">
        {activeConvId ? (
          /* Mobile thread view */
          <div className="flex flex-col flex-1" style={{ height: "calc(100vh - 64px)" }}>
            {/* Mobile thread header with back button */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F0F2F5] border-b border-border shrink-0">
              <button
                onClick={() => setActiveConvId(null)}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold truncate">{activeConv?.otherName || ""}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatThread conversationId={activeConvId} uid={uid} />
            </div>
          </div>
        ) : (
          /* Mobile conversation list */
          <div className="flex-1 px-4 py-6">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-xl font-bold text-foreground">{t.chat.title}</h1>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 h-10 rounded-lg bg-[#FAFAF8] border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[#C9AA8B]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((conv) => (
                  <ConversationPanel
                    key={conv.conversationId}
                    conv={conv}
                    uid={uid}
                    isActive={conv.conversationId === activeConvId}
                    onClick={() => setActiveConvId(conv.conversationId)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Desktop layout (lg+): WhatsApp-style split panel ── */}
      <div className="hidden lg:flex flex-1" style={{ height: "calc(100vh - 64px)" }}>
        {/* Left panel: Conversation list */}
        <div className="w-[360px] xl:w-[400px] flex flex-col border-r border-border bg-white shrink-0">
          {/* Left header */}
          <div className="px-4 pt-4 pb-3 bg-[#F0F2F5] border-b border-border shrink-0">
            <h1 className="text-xl font-bold text-foreground mb-3">{t.chat.title}</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search or start new chat"
                className="pl-10 h-9 rounded-lg bg-white border-border/50 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[#C9AA8B]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
              </div>
            ) : (
              filtered.map((conv) => (
                <ConversationPanel
                  key={conv.conversationId}
                  conv={conv}
                  uid={uid}
                  isActive={conv.conversationId === activeConvId}
                  onClick={() => setActiveConvId(conv.conversationId)}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel: Active chat thread or placeholder */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeConvId ? (
            <ChatThread conversationId={activeConvId} uid={uid} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#EDE9E1]">
              <div className="h-24 w-24 rounded-full bg-white/50 flex items-center justify-center mb-5">
                <MessageSquare className="h-12 w-12 text-[#C9AA8B]" />
              </div>
              <h2 className="text-2xl font-light text-[#41525D] mb-2">Nouryx Web</h2>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Send and receive messages without keeping your phone online.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

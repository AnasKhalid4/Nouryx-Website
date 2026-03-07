"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, ImagePlus, Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useChatMessages, useSendMessage } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { uploadChatImage } from "@/lib/firebase/storage";
import { toast } from "sonner";

export default function ChatThreadPage() {
  const { t } = useLocale();
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const { uid } = useAuth();

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
    } catch (err) {
      console.error("Send failed:", err);
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
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [uid, isUploading, conversationId, sendMessage]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Chat Header */}
      <div className="bg-[#F0F2F5] border-b border-border sticky top-16 z-30">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/chat"
            className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Back to chat list"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0 relative overflow-hidden">
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
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
        ref={scrollRef}
        style={{ backgroundColor: "#EDE9E1" }}
      >
        <div className="mx-auto max-w-2xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#C9AA8B]" />
            </div>
          ) : (messages || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Start the conversation!
            </p>
          ) : (
            <div className="space-y-2">
              {(messages || []).map((msg) => {
                const isMe = msg.senderId === uid;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm ${
                        isMe
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
              })}
            </div>
          )}
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-[#F0F2F5] border-t border-border sticky bottom-0">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-2">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
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
              className="h-10 w-10 rounded-full bg-[#00A884] hover:bg-[#008f6f] text-white disabled:opacity-50"
              aria-label="Send message"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, ImagePlus } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockMessages, mockConversations } from "@/data/mock-salons";
import { useState } from "react";
import Link from "next/link";

export default function ChatThreadPage() {
  const { t } = useLocale();
  const [message, setMessage] = useState("");
  const conv = mockConversations[0];
  const currentUserId = "u1";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Chat Header */}
      <div className="bg-white border-b border-border sticky top-16 z-30">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link href="/chat" className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0">
            <span className="text-[#C9AA8B] font-bold text-sm">
              {conv.otherParty.name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{conv.otherParty.name}</h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 space-y-3">
          {mockMessages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? "bg-[#C9AA8B] text-white rounded-br-md"
                      : "bg-white border border-border/50 text-foreground rounded-bl-md"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-border sticky bottom-0">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-3">
          <form
            onSubmit={(e) => { e.preventDefault(); setMessage(""); }}
            className="flex items-center gap-2"
          >
            <button type="button" className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
              <ImagePlus className="h-5 w-5" />
            </button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.chat.placeholder}
              className="flex-1 h-10 rounded-full bg-[#FAFAF8] border-border/50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim()}
              className="h-10 w-10 rounded-full bg-[#C9AA8B] hover:bg-[#B8956F] text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

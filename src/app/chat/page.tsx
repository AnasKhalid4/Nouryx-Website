"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, ImagePlus, Search } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockConversations, mockMessages } from "@/data/mock-salons";
import { useState } from "react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ChatPage() {
  const { t } = useLocale();
  const [activeConv, setActiveConv] = useState<string | null>(
    mockConversations.length > 0 ? mockConversations[0].conversationId : null
  );
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const currentUserId = "u1";

  const activeConvData = mockConversations.find((c) => c.conversationId === activeConv);

  const filteredConversations = mockConversations.filter((c) =>
    !searchQuery || c.otherParty.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden border-t border-border">
        {/* Left Sidebar — Conversations */}
        <div className="w-full max-w-95 bg-white border-r border-border flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-bold text-foreground mb-3">{t.chat.title}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.common.search}
                className="pl-9 h-9 rounded-lg bg-[#FAFAF8] text-sm"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => {
              const isActive = activeConv === conv.conversationId;
              return (
                <button
                  key={conv.conversationId}
                  onClick={() => setActiveConv(conv.conversationId)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-border/30 ${
                    isActive ? "bg-[#C9AA8B]/8" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0">
                    <span className="text-[#C9AA8B] font-bold">
                      {conv.otherParty.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm truncate ${isActive ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                        {conv.otherParty.name}
                      </h3>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {timeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel — Chat Thread */}
        <div className="flex-1 flex flex-col bg-[#FAFAF8]">
          {activeConvData ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-border/50 px-6 py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0">
                  <span className="text-[#C9AA8B] font-bold text-sm">
                    {activeConvData.otherParty.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{activeConvData.otherParty.name}</h3>
                  <p className="text-xs text-emerald-600">Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-3 max-w-3xl mx-auto">
                  {mockMessages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
                            isMe
                              ? "bg-[#C9AA8B] text-white rounded-br-md"
                              : "bg-white text-foreground rounded-bl-md"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Input */}
              <div className="bg-white border-t border-border/50 px-6 py-3">
                <form
                  onSubmit={(e) => { e.preventDefault(); setMessage(""); }}
                  className="flex items-center gap-3 max-w-3xl mx-auto"
                >
                  <button type="button" className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground shrink-0">
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
                    className="h-10 w-10 rounded-full bg-[#C9AA8B] hover:bg-[#B8956F] text-white disabled:opacity-50 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">{t.chat.empty}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

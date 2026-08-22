"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/lib/app-context";
import { generateConsultantResponse } from "@/lib/consultant-fallback";
import { Send, Bot, User, Sparkles } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "What should I buy for a 2-week swing trade?",
  "Should I sell my tech holdings before earnings?",
  "Compare NVDA vs AMD for mid-term growth",
  "What's the best sector rotation play right now?",
  "Help me build a balanced mid-term portfolio",
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ConsultantPage() {
  const { portfolio, riskProfile, watchlist } = useApp();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function send(text: string) {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const response = generateConsultantResponse(
        text,
        portfolio,
        riskProfile,
        watchlist.map((w) => w.symbol)
      );
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: "assistant", content: response },
      ]);
      setIsLoading(false);
    }, 400);
  }

  return (
    <div className="p-4 md:p-8 flex flex-col min-h-[calc(100dvh-3.5rem)] md:min-h-screen md:h-[calc(100vh)]">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
          AI Trading Consultant
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Personalized buy/sell advice based on your portfolio and risk profile
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-0">
        <Card className="lg:col-span-3 border-border/60 flex flex-col min-h-0">
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ScrollArea className="flex-1 p-4 md:p-6">
              {messages.length === 0 ? (
                <div className="space-y-4 md:space-y-6">
                  <div className="text-center py-6 md:py-8">
                    <Bot className="h-10 w-10 md:h-12 md:w-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm max-w-md mx-auto px-2">
                      I analyze technical indicators, your portfolio, and risk tolerance to give
                      actionable short and mid-term trading advice.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => send(prompt)}
                        className="text-left text-sm p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-emerald-400" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2.5 max-w-[90%] md:max-w-[80%] text-sm ${
                          message.role === "user"
                            ? "bg-emerald-600 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <span className="whitespace-pre-wrap">{message.content}</span>
                      </div>
                      {message.role === "user" && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-emerald-400 animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-2.5 text-sm text-muted-foreground">
                        Analyzing market data...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-border p-3 md:p-4 flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a stock, sector, or strategy..."
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="hidden lg:block space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground">
              <p>
                Risk: <span className="text-foreground capitalize">{riskProfile.tolerance}</span>
              </p>
              <p>
                Horizon:{" "}
                <span className="text-foreground">
                  {riskProfile.preferredHorizon === "short" ? "Short-term" : "Mid-term"}
                </span>
              </p>
              <p>
                Max position:{" "}
                <span className="text-foreground">{riskProfile.maxPositionSize}%</span>
              </p>
              <p>
                Positions: <span className="text-foreground">{portfolio.length}</span>
              </p>
              <p>
                Watchlist: <span className="text-foreground">{watchlist.length}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

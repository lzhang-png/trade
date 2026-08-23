"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PageHeader } from "@/components/layout/page-header";
import { LiveDataBadge } from "@/components/trading/live-data-badge";
import { useApp } from "@/lib/app-context";
import { useMarketData } from "@/lib/market-data-context";
import { generateConsultantResponse } from "@/lib/consultant-fallback";
import {
  SendIcon,
  BotIcon,
  UserIcon,
  SparklesIcon,
  Loader2Icon,
} from "lucide-react";

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
  const { stocks } = useMarketData();
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
        watchlist.map((w) => w.symbol),
        stocks
      );
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: "assistant", content: response },
      ]);
      setIsLoading(false);
    }, 400);
  }

  return (
    <div className="page-container min-h-[calc(100dvh-4rem)]">
      <PageHeader
        icon={SparklesIcon}
        title="AI Trading Consultant"
        description="Ask for personalized buy/sell advice based on your portfolio and risk profile"
        action={<LiveDataBadge />}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-4">
        <Card className="flex min-h-[520px] flex-col shadow-sm lg:col-span-3 lg:min-h-0">
          <CardContent className="flex flex-1 flex-col p-0">
            <ScrollArea className="flex-1 p-6 md:p-8">
              {messages.length === 0 ? (
                <div className="flex flex-col gap-4 md:gap-6">
                  <div className="py-6 text-center md:py-8">
                    <BotIcon className="mx-auto mb-4 text-primary" />
                    <p className="mx-auto max-w-md px-2 text-base text-muted-foreground">
                      I analyze technical indicators, your portfolio, and risk tolerance to give
                      actionable short and mid-term trading advice.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        className="h-auto justify-start whitespace-normal py-4 text-left text-base font-normal"
                        onClick={() => send(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                          <BotIcon className="text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[90%] rounded-lg px-5 py-3 text-base md:max-w-[80%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <span className="whitespace-pre-wrap">{message.content}</span>
                      </div>
                      {message.role === "user" && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <UserIcon />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/15">
                        <Loader2Icon className="animate-spin text-primary" />
                      </div>
                      <div className="rounded-lg bg-muted px-5 py-3 text-base text-muted-foreground">
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
              className="border-t p-4 md:p-6"
            >
              <InputGroup>
                <InputGroupInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a stock, sector, or strategy..."
                  disabled={isLoading}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    variant="default"
                  >
                    <SendIcon />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </CardContent>
        </Card>

        <div className="hidden flex-col gap-6 lg:flex">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Risk</span>
                <Badge variant="outline" className="capitalize">
                  {riskProfile.tolerance}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Horizon</span>
                <Badge variant="outline">
                  {riskProfile.preferredHorizon === "short" ? "Short-term" : "Mid-term"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Max position</span>
                <Badge variant="outline">{riskProfile.maxPositionSize}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Positions</span>
                <Badge variant="secondary">{portfolio.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Watchlist</span>
                <Badge variant="secondary">{watchlist.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

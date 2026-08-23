"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { getApiKeyForClient } from "@/lib/market-data";
import { searchUsSymbols } from "@/lib/finnhub-client";
import { useWatchlist } from "@/lib/watchlist-context";
import { useMarketData } from "@/lib/market-data-context";
import type { SymbolSearchResult } from "@/lib/types";
import { Loader2Icon, PlusIcon, SearchIcon, StarIcon } from "lucide-react";

export function StockSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const { add, isWatching } = useWatchlist();
  const { loadSymbol } = useMarketData();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    const key = getApiKeyForClient();
    if (!key || q.trim().length < 1) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const hits = await searchUsSymbols(q, key);
      setResults(hits);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void runSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleAdd(result: SymbolSearchResult) {
    if (isWatching(result.symbol)) {
      toast.info(`${result.symbol} is already on your watchlist`);
      return;
    }
    add({
      symbol: result.symbol,
      name: result.description,
      type: result.type,
    });
    toast.success(`Added ${result.symbol} to watchlist`);
    setQuery("");
    setOpen(false);
    void loadSymbol(result.symbol, result.description, result.type);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <InputGroup>
        <InputGroupAddon>
          {searching ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <SearchIcon />
          )}
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search US stocks & ETFs — e.g. AAPL, Tesla, SPY…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Search US stocks and ETFs"
          aria-expanded={open}
          autoComplete="off"
        />
      </InputGroup>

      {open && results.length > 0 && (
        <ul
          className="absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-md"
          role="listbox"
        >
          {results.map((r) => {
            const watching = isWatching(r.symbol);
            return (
              <li
                key={r.symbol}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/60"
                role="option"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.displaySymbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {r.type}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{r.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={watching ? "secondary" : "default"}
                  disabled={watching}
                  onClick={() => void handleAdd(r)}
                >
                  {watching ? (
                    <>
                      <StarIcon data-icon="inline-start" className="fill-current" />
                      Watching
                    </>
                  ) : (
                    <>
                      <PlusIcon data-icon="inline-start" />
                      Add
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {open && query.length > 0 && !searching && results.length === 0 && (
        <p className="absolute z-50 mt-2 w-full rounded-lg border bg-popover px-4 py-3 text-sm text-muted-foreground shadow-md">
          No US stocks or ETFs found for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/lib/app-context";
import type { Sector, TimeHorizon } from "@/lib/types";

const ALL_SECTORS: Sector[] = [
  "Technology",
  "Healthcare",
  "Finance",
  "Energy",
  "Consumer",
  "Industrial",
  "ETF",
];

export default function SettingsPage() {
  const { riskProfile, updateRiskProfile } = useApp();

  function toggleSector(sector: Sector) {
    const current = riskProfile.sectors;
    const updated = current.includes(sector)
      ? current.filter((s) => s !== sector)
      : [...current, sector];
    updateRiskProfile({ sectors: updated });
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure your risk profile to personalize recommendations
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Risk Tolerance</CardTitle>
          <CardDescription>How much volatility can you handle?</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={riskProfile.tolerance}
            onValueChange={(v) =>
              updateRiskProfile({ tolerance: v as "conservative" | "moderate" | "aggressive" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative — capital preservation</SelectItem>
              <SelectItem value="moderate">Moderate — balanced growth</SelectItem>
              <SelectItem value="aggressive">Aggressive — max growth, higher risk</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Investment Horizon</CardTitle>
          <CardDescription>Default time frame for recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={riskProfile.preferredHorizon}
            onValueChange={(v) => updateRiskProfile({ preferredHorizon: v as TimeHorizon })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short-term (1–4 weeks)</SelectItem>
              <SelectItem value="mid">Mid-term (1–6 months)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Max Position Size</CardTitle>
          <CardDescription>
            Maximum % of portfolio in a single position: {riskProfile.maxPositionSize}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Slider
            value={[riskProfile.maxPositionSize]}
            onValueChange={([v]) => updateRiskProfile({ maxPositionSize: v })}
            min={5}
            max={25}
            step={1}
          />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Max Drawdown Tolerance</CardTitle>
          <CardDescription>
            Maximum acceptable loss before rebalancing: {riskProfile.maxDrawdown}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Slider
            value={[riskProfile.maxDrawdown]}
            onValueChange={([v]) => updateRiskProfile({ maxDrawdown: v })}
            min={5}
            max={30}
            step={1}
          />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Preferred Sectors</CardTitle>
          <CardDescription>Recommendations will favor these sectors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ALL_SECTORS.map((sector) => (
            <div key={sector} className="flex items-center justify-between">
              <Label htmlFor={sector}>{sector}</Label>
              <Switch
                id={sector}
                checked={riskProfile.sectors.includes(sector)}
                onCheckedChange={() => toggleSector(sector)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { PageHeader } from "@/components/layout/page-header";
import { useApp } from "@/lib/app-context";
import type { Sector, TimeHorizon } from "@/lib/types";
import { SettingsIcon } from "lucide-react";

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
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Configure your risk profile to personalize recommendations"
      />

      <div className="flex max-w-2xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Tolerance</CardTitle>
            <CardDescription>How much volatility can you handle?</CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel>Risk level</FieldLabel>
              <Select
                value={riskProfile.tolerance}
                onValueChange={(v) =>
                  updateRiskProfile({
                    tolerance: v as "conservative" | "moderate" | "aggressive",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="conservative">
                      Conservative — capital preservation
                    </SelectItem>
                    <SelectItem value="moderate">Moderate — balanced growth</SelectItem>
                    <SelectItem value="aggressive">
                      Aggressive — max growth, higher risk
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investment Horizon</CardTitle>
            <CardDescription>Default time frame for recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel>Horizon</FieldLabel>
              <Select
                value={riskProfile.preferredHorizon}
                onValueChange={(v) =>
                  updateRiskProfile({ preferredHorizon: v as TimeHorizon })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="short">Short-term (1–4 weeks)</SelectItem>
                    <SelectItem value="mid">Mid-term (1–6 months)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Max Position Size</CardTitle>
            <CardDescription>
              Maximum % of portfolio in a single position: {riskProfile.maxPositionSize}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel className="sr-only">Max position size</FieldLabel>
              <Slider
                value={[riskProfile.maxPositionSize]}
                onValueChange={([v]) => updateRiskProfile({ maxPositionSize: v })}
                min={5}
                max={25}
                step={1}
              />
              <FieldDescription>5% conservative · 25% aggressive</FieldDescription>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Max Drawdown Tolerance</CardTitle>
            <CardDescription>
              Maximum acceptable loss before rebalancing: {riskProfile.maxDrawdown}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel className="sr-only">Max drawdown</FieldLabel>
              <Slider
                value={[riskProfile.maxDrawdown]}
                onValueChange={([v]) => updateRiskProfile({ maxDrawdown: v })}
                min={5}
                max={30}
                step={1}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferred Sectors</CardTitle>
            <CardDescription>Recommendations will favor these sectors</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldLegend variant="label" className="sr-only">
                Preferred sectors
              </FieldLegend>
              <FieldGroup>
                {ALL_SECTORS.map((sector) => (
                  <Field key={sector} orientation="horizontal">
                    <FieldLabel htmlFor={sector}>{sector}</FieldLabel>
                    <Switch
                      id={sector}
                      checked={riskProfile.sectors.includes(sector)}
                      onCheckedChange={() => toggleSector(sector)}
                    />
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

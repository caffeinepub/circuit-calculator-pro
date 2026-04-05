import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Radio } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useRLCResonance } from "../hooks/useCalculations";
import { ResultsPanel } from "./ResultsPanel";
import { UnitPills } from "./UnitPills";

const INDUCTANCE_UNITS = ["H", "mH", "µH"];
const CAPACITANCE_UNITS = ["F", "µF", "nF"];

export function RLCResonanceCalc() {
  const { actor } = useActor();
  const [l, setL] = useState("");
  const [lUnit, setLUnit] = useState("mH");
  const [c, setC] = useState("");
  const [cUnit, setCUnit] = useState("µF");

  const { result, steps, error, isLoading, calculate } = useRLCResonance(actor);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card className="bg-card border-circuit-card-border shadow-card-dark">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
              <Radio className="h-4 w-4 text-circuit-accent" />
            </div>
            <div>
              <CardTitle className="text-base">
                RLC Resonant Frequency
              </CardTitle>
              <CardDescription className="text-xs">
                f = 1 / (2π√(LC))
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Inductance{" "}
              <span className="text-circuit-muted font-normal">(L)</span>
            </Label>
            <input
              type="number"
              value={l}
              onChange={(e) => setL(e.target.value)}
              placeholder="e.g. 10"
              data-ocid="rlc.inductance.input"
              className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent focus:border-transparent transition-all"
            />
            <UnitPills
              units={INDUCTANCE_UNITS}
              selected={lUnit}
              onChange={setLUnit}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Capacitance{" "}
              <span className="text-circuit-muted font-normal">(C)</span>
            </Label>
            <input
              type="number"
              value={c}
              onChange={(e) => setC(e.target.value)}
              placeholder="e.g. 100"
              data-ocid="rlc.capacitance.input"
              className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent focus:border-transparent transition-all"
            />
            <UnitPills
              units={CAPACITANCE_UNITS}
              selected={cUnit}
              onChange={setCUnit}
            />
          </div>

          <div className="rounded-lg bg-circuit-input border border-circuit-card-border px-4 py-3">
            <p className="text-xs text-circuit-muted mb-1">Formula</p>
            <p className="font-mono text-sm text-circuit-accent">
              f₀ = 1 / (2π√(L × C))
            </p>
            <p className="text-xs text-circuit-muted mt-1">
              Resonance occurs when capacitive and inductive reactances are
              equal
            </p>
          </div>

          <Button
            onClick={() => calculate(l, lUnit, c, cUnit)}
            disabled={isLoading || !actor}
            data-ocid="rlc.submit_button"
            className="w-full bg-circuit-accent hover:opacity-90 text-white font-semibold accent-glow-sm transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...
              </>
            ) : (
              "Calculate"
            )}
          </Button>
        </CardContent>
      </Card>
      <ResultsPanel
        result={result}
        steps={steps}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
}

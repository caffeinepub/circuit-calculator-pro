import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Timer } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useRCTimeConstant } from "../hooks/useCalculations";
import { ResultsPanel } from "./ResultsPanel";
import { UnitPills } from "./UnitPills";

const RESISTANCE_UNITS = ["Ω", "kΩ", "MΩ"];
const CAPACITANCE_UNITS = ["F", "µF", "nF", "pF"];

export function RCTimeConstantCalc() {
  const { actor } = useActor();
  const [r, setR] = useState("");
  const [rUnit, setRUnit] = useState("kΩ");
  const [c, setC] = useState("");
  const [cUnit, setCUnit] = useState("µF");

  const { result, steps, error, isLoading, calculate } =
    useRCTimeConstant(actor);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card className="bg-card border-circuit-card-border shadow-card-dark">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
              <Timer className="h-4 w-4 text-circuit-accent" />
            </div>
            <div>
              <CardTitle className="text-base">RC Time Constant</CardTitle>
              <CardDescription className="text-xs">τ = R × C</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Resistance{" "}
              <span className="text-circuit-muted font-normal">(R)</span>
            </Label>
            <input
              type="number"
              value={r}
              onChange={(e) => setR(e.target.value)}
              placeholder="e.g. 10"
              data-ocid="rc.resistance.input"
              className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent focus:border-transparent transition-all"
            />
            <UnitPills
              units={RESISTANCE_UNITS}
              selected={rUnit}
              onChange={setRUnit}
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
              data-ocid="rc.capacitance.input"
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
              τ (tau) = R × C
            </p>
            <p className="text-xs text-circuit-muted mt-1">
              τ represents the time to charge to ~63.2% of full voltage
            </p>
          </div>

          <Button
            onClick={() => calculate(r, rUnit, c, cUnit)}
            disabled={isLoading || !actor}
            data-ocid="rc.submit_button"
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

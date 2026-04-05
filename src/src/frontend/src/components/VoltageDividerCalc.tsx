import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Divide, Loader2 } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useVoltageDivider } from "../hooks/useCalculations";
import { ResultsPanel } from "./ResultsPanel";
import { UnitPills } from "./UnitPills";

const VOLTAGE_UNITS = ["V", "mV"];
const RESISTANCE_UNITS = ["Ω", "kΩ", "MΩ"];

export function VoltageDividerCalc() {
  const { actor } = useActor();
  const [vin, setVin] = useState("");
  const [vinUnit, setVinUnit] = useState("V");
  const [r1, setR1] = useState("");
  const [r1Unit, setR1Unit] = useState("kΩ");
  const [r2, setR2] = useState("");
  const [r2Unit, setR2Unit] = useState("kΩ");

  const { result, steps, error, isLoading, calculate } =
    useVoltageDivider(actor);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card className="bg-card border-circuit-card-border shadow-card-dark">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
              <Divide className="h-4 w-4 text-circuit-accent" />
            </div>
            <div>
              <CardTitle className="text-base">Voltage Divider</CardTitle>
              <CardDescription className="text-xs">
                Vout = Vin × R2 / (R1 + R2)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Input Voltage{" "}
              <span className="text-circuit-muted font-normal">(Vin)</span>
            </Label>
            <input
              type="number"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              placeholder="e.g. 12"
              data-ocid="vdiv.vin.input"
              className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent focus:border-transparent transition-all"
            />
            <UnitPills
              units={VOLTAGE_UNITS}
              selected={vinUnit}
              onChange={setVinUnit}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Resistor 1{" "}
              <span className="text-circuit-muted font-normal">(R1)</span>
            </Label>
            <input
              type="number"
              value={r1}
              onChange={(e) => setR1(e.target.value)}
              placeholder="e.g. 10"
              data-ocid="vdiv.r1.input"
              className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent focus:border-transparent transition-all"
            />
            <UnitPills
              units={RESISTANCE_UNITS}
              selected={r1Unit}
              onChange={setR1Unit}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Resistor 2{" "}
              <span className="text-circuit-muted font-normal">(R2)</span>
            </Label>
            <input
              type="number"
              value={r2}
              onChange={(e) => setR2(e.target.value)}
              placeholder="e.g. 10"
              data-ocid="vdiv.r2.input"
              className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent focus:border-transparent transition-all"
            />
            <UnitPills
              units={RESISTANCE_UNITS}
              selected={r2Unit}
              onChange={setR2Unit}
            />
          </div>

          <div className="rounded-lg bg-circuit-input border border-circuit-card-border px-4 py-3">
            <p className="text-xs text-circuit-muted mb-1">Formula</p>
            <p className="font-mono text-sm text-circuit-accent">
              Vout = Vin × R2 / (R1 + R2)
            </p>
          </div>

          <Button
            onClick={() => calculate(vin, vinUnit, r1, r1Unit, r2, r2Unit)}
            disabled={isLoading || !actor}
            data-ocid="vdiv.submit_button"
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

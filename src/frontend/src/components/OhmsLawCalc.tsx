import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useOhmsLaw } from "../hooks/useCalculations";
import { ResultsPanel } from "./ResultsPanel";
import { UnitPills } from "./UnitPills";

const VOLTAGE_UNITS = ["V", "mV", "kV"];
const CURRENT_UNITS = ["A", "mA", "µA"];
const RESISTANCE_UNITS = ["Ω", "kΩ", "MΩ"];

export function OhmsLawCalc() {
  const { actor } = useActor();
  const [voltage, setVoltage] = useState("");
  const [voltageUnit, setVoltageUnit] = useState("V");
  const [current, setCurrent] = useState("");
  const [currentUnit, setCurrentUnit] = useState("mA");
  const [resistance, setResistance] = useState("");
  const [resistanceUnit, setResistanceUnit] = useState("Ω");

  const { result, steps, error, isLoading, calculate } = useOhmsLaw(actor);

  const handleCalculate = () => {
    calculate(
      voltage,
      voltageUnit,
      current,
      currentUnit,
      resistance,
      resistanceUnit,
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Input Card */}
      <Card className="bg-card border-circuit-card-border shadow-card-dark">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
              <Zap className="h-4 w-4 text-circuit-accent" />
            </div>
            <div>
              <CardTitle className="text-base">Ohm&apos;s Law</CardTitle>
              <CardDescription className="text-xs">
                Enter any 2 values — solve for the 3rd
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Voltage Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Voltage{" "}
              <span className="text-circuit-muted font-normal">(V)</span>
            </Label>
            <input
              type="number"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              placeholder="Leave blank to solve"
              data-ocid="ohms.voltage.input"
              className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent focus:border-transparent transition-all"
            />
            <UnitPills
              units={VOLTAGE_UNITS}
              selected={voltageUnit}
              onChange={setVoltageUnit}
            />
          </div>

          {/* Current Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Current{" "}
              <span className="text-circuit-muted font-normal">(I)</span>
            </Label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Leave blank to solve"
              data-ocid="ohms.current.input"
              className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent focus:border-transparent transition-all"
            />
            <UnitPills
              units={CURRENT_UNITS}
              selected={currentUnit}
              onChange={setCurrentUnit}
            />
          </div>

          {/* Resistance Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Resistance{" "}
              <span className="text-circuit-muted font-normal">(R)</span>
            </Label>
            <input
              type="number"
              value={resistance}
              onChange={(e) => setResistance(e.target.value)}
              placeholder="Leave blank to solve"
              data-ocid="ohms.resistance.input"
              className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent focus:border-transparent transition-all"
            />
            <UnitPills
              units={RESISTANCE_UNITS}
              selected={resistanceUnit}
              onChange={setResistanceUnit}
            />
          </div>

          {/* Formula preview */}
          <div className="rounded-lg bg-circuit-input border border-circuit-card-border px-4 py-3">
            <p className="text-xs text-circuit-muted mb-1">Ohm&apos;s Law</p>
            <p className="font-mono text-sm text-circuit-accent">V = I × R</p>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={isLoading || !actor}
            data-ocid="ohms.submit_button"
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

      {/* Results */}
      <ResultsPanel
        result={result}
        steps={steps}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
}

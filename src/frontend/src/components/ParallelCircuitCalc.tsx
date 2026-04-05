import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, GitBranch, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  type CircuitComponent,
  Complex,
  type ComponentType,
  formatImpedance,
  formatSI,
  getDefaultUnit,
  getImpedance,
  getUnitOptions,
  parallelImpedance,
  toSI,
} from "../utils/complexMath";
import { UnitPills } from "./UnitPills";

interface ComponentRow extends CircuitComponent {
  valueStr: string;
  unit: string;
}

interface BranchResult {
  id: string;
  label: string;
  type: string;
  current: string;
  power: string;
  powerQ: string;
  powerS: string;
}

interface ParallelResults {
  totalImpedance: string;
  totalCurrent: string;
  totalP: string;
  totalQ: string;
  totalS: string;
  branches: BranchResult[];
}

let branchCounter = 100;

function makeBranch(type: ComponentType = "R"): ComponentRow {
  branchCounter++;
  return {
    id: `branch-${branchCounter}`,
    type,
    value: 0,
    label: `${type}${branchCounter - 100}`,
    valueStr: "",
    unit: getDefaultUnit(type),
  };
}

export function ParallelCircuitCalc() {
  const [rows, setRows] = useState<ComponentRow[]>([
    {
      id: "p-r1",
      type: "R",
      value: 1000,
      label: "R1",
      valueStr: "1",
      unit: "k\u03a9",
    },
    {
      id: "p-r2",
      type: "R",
      value: 2200,
      label: "R2",
      valueStr: "2.2",
      unit: "k\u03a9",
    },
    {
      id: "p-c1",
      type: "C",
      value: 47e-9,
      label: "C1",
      valueStr: "47",
      unit: "nF",
    },
  ]);
  const [vsStr, setVsStr] = useState("12");
  const [vsUnit, setVsUnit] = useState("V");
  const [freqStr, setFreqStr] = useState("1");
  const [freqUnit, setFreqUnit] = useState("kHz");
  const [results, setResults] = useState<ParallelResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addRow = () => setRows((prev) => [...prev, makeBranch("R")]);
  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (id: string, patch: Partial<ComponentRow>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...patch };
        if (patch.valueStr !== undefined || patch.unit !== undefined) {
          updated.value = toSI(updated.valueStr, updated.unit) ?? 0;
        }
        if (patch.type !== undefined && patch.unit === undefined) {
          updated.unit = getDefaultUnit(updated.type);
          updated.value = toSI(updated.valueStr, updated.unit) ?? 0;
        }
        return updated;
      }),
    );
  };

  const calculate = () => {
    setError(null);
    const vs = toSI(vsStr, vsUnit);
    const freq = toSI(freqStr, freqUnit);
    if (vs === null || freq === null) {
      setError("Enter valid source voltage and frequency.");
      return;
    }
    if (rows.length === 0) {
      setError("Add at least one branch.");
      return;
    }
    for (const r of rows) {
      if (!r.valueStr || r.value <= 0) {
        setError(`Branch ${r.label} has an invalid value.`);
        return;
      }
    }
    const omega = 2 * Math.PI * freq;
    const Vs = new Complex(vs, 0);
    const comps: CircuitComponent[] = rows.map((r) => ({
      id: r.id,
      type: r.type,
      value: r.value,
      label: r.label,
    }));
    const Zeq = parallelImpedance(comps, omega);
    const Itotal = Vs.div(Zeq);

    const branchResults: BranchResult[] = comps.map((comp) => {
      const Zi = getImpedance(comp, omega);
      const Ii = Vs.div(Zi);
      const Si = Vs.mul(new Complex(Ii.re, -Ii.im));
      const Ifmt = formatSI(Ii.magnitude(), "A");
      const Pfmt = formatSI(Math.abs(Si.re), "W");
      const Qfmt = formatSI(Math.abs(Si.im), "VAr");
      const Sfmt = formatSI(Si.magnitude(), "VA");
      return {
        id: comp.id,
        label: comp.label,
        type: comp.type,
        current: `${Ifmt.display} ${Ifmt.unit}`,
        power: `${Pfmt.display} ${Pfmt.unit}`,
        powerQ: `${Qfmt.display} ${Qfmt.unit}`,
        powerS: `${Sfmt.display} ${Sfmt.unit}`,
      };
    });

    const Stotal = Vs.mul(new Complex(Itotal.re, -Itotal.im));
    const Ifmt = formatSI(Itotal.magnitude(), "A");
    const Pfmt = formatSI(Math.abs(Stotal.re), "W");
    const Qfmt = formatSI(Math.abs(Stotal.im), "VAr");
    const Sfmt = formatSI(Stotal.magnitude(), "VA");

    setResults({
      totalImpedance: formatImpedance(Zeq),
      totalCurrent: `${Ifmt.display} ${Ifmt.unit}`,
      totalP: `${Pfmt.display} ${Pfmt.unit}`,
      totalQ: `${Qfmt.display} ${Qfmt.unit}`,
      totalS: `${Sfmt.display} ${Sfmt.unit}`,
      branches: branchResults,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-card border-circuit-card-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
              <GitBranch className="h-3.5 w-3.5 text-circuit-accent" />
            </div>
            <CardTitle className="text-base">
              Parallel Circuit Calculator
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label className="text-sm">Source Voltage (Vs)</Label>
              <input
                type="number"
                value={vsStr}
                onChange={(e) => setVsStr(e.target.value)}
                data-ocid="parallel.vs.input"
                className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent transition-all"
              />
              <UnitPills
                units={["V", "mV", "kV"]}
                selected={vsUnit}
                onChange={setVsUnit}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Frequency (AC)</Label>
              <input
                type="number"
                value={freqStr}
                onChange={(e) => setFreqStr(e.target.value)}
                data-ocid="parallel.freq.input"
                className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent transition-all"
              />
              <UnitPills
                units={["Hz", "kHz", "MHz"]}
                selected={freqUnit}
                onChange={setFreqUnit}
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-sm font-semibold">Parallel Branches</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addRow}
                data-ocid="parallel.add_button"
                className="h-7 px-2 text-xs border-circuit-card-border text-circuit-accent hover:bg-circuit-accent/10"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Branch
              </Button>
            </div>

            {rows.map((row, idx) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-circuit-card-border bg-circuit-input"
                data-ocid={`parallel.item.${idx + 1}`}
              >
                <div className="flex items-center text-xs text-circuit-accent font-mono font-bold w-5">
                  {idx + 1}
                </div>
                <Select
                  value={row.type}
                  onValueChange={(v) =>
                    updateRow(row.id, { type: v as ComponentType })
                  }
                >
                  <SelectTrigger className="h-8 w-16 text-xs bg-card border-circuit-card-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="R">R</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => updateRow(row.id, { label: e.target.value })}
                  placeholder="Label"
                  className="h-8 w-16 px-2 rounded border border-circuit-card-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-circuit-accent"
                />
                <input
                  type="number"
                  value={row.valueStr}
                  onChange={(e) =>
                    updateRow(row.id, { valueStr: e.target.value })
                  }
                  placeholder="Value"
                  className="h-8 flex-1 min-w-[80px] px-2 rounded border border-circuit-card-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-circuit-accent"
                />
                <Select
                  value={row.unit}
                  onValueChange={(v) => updateRow(row.id, { unit: v })}
                >
                  <SelectTrigger className="h-8 w-20 text-xs bg-card border-circuit-card-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnitOptions(row.type).map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  data-ocid={`parallel.delete_button.${idx + 1}`}
                  className="h-8 w-8 flex items-center justify-center rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-destructive text-sm mb-3"
              data-ocid="parallel.error_state"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={calculate}
            data-ocid="parallel.submit_button"
            className="w-full bg-circuit-accent hover:opacity-90 text-white font-semibold accent-glow-sm"
          >
            Calculate All
          </Button>
        </CardContent>
      </Card>

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          data-ocid="parallel.success_state"
        >
          <Card className="bg-card border-circuit-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  {
                    label: "Equivalent Impedance",
                    value: results.totalImpedance,
                  },
                  { label: "Total Current", value: results.totalCurrent },
                  { label: "Real Power (P)", value: results.totalP },
                  { label: "Reactive Power (Q)", value: results.totalQ },
                  { label: "Apparent Power (S)", value: results.totalS },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg bg-circuit-input border border-circuit-card-border p-3"
                  >
                    <p className="text-xs text-circuit-muted mb-1">{m.label}</p>
                    <p className="font-mono text-sm font-semibold text-circuit-accent">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Per-Branch Results</p>
                <div className="overflow-x-auto">
                  <Table data-ocid="parallel.table">
                    <TableHeader>
                      <TableRow className="border-circuit-card-border">
                        <TableHead className="text-circuit-muted text-xs">
                          Branch
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          Type
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          Current
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          P (Real)
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          Q (Reactive)
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          S (Apparent)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.branches.map((b, idx) => (
                        <TableRow
                          key={b.id}
                          className="border-circuit-card-border"
                          data-ocid={`parallel.row.${idx + 1}`}
                        >
                          <TableCell className="font-mono text-xs font-semibold text-circuit-accent">
                            {b.label}
                          </TableCell>
                          <TableCell className="text-xs text-circuit-muted">
                            {b.type}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {b.current}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {b.power}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {b.powerQ}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {b.powerS}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

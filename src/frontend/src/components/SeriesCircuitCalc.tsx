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
import { AlertCircle, Plus, Trash2, Zap } from "lucide-react";
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
  seriesImpedance,
  toSI,
} from "../utils/complexMath";
import { UnitPills } from "./UnitPills";

interface ComponentRow extends CircuitComponent {
  valueStr: string;
  unit: string;
}

interface ComponentResult {
  id: string;
  label: string;
  type: string;
  voltageDisplay: string;
  currentDisplay: string;
  powerP: string;
  powerQ: string;
  powerS: string;
}

interface SeriesResults {
  totalImpedance: string;
  totalCurrent: string;
  totalP: string;
  totalQ: string;
  totalS: string;
  components: ComponentResult[];
}

let idCounter = 1;

function makeRow(type: ComponentType = "R"): ComponentRow {
  idCounter++;
  return {
    id: `comp-${idCounter}`,
    type,
    value: 0,
    label: `${type}${idCounter}`,
    valueStr: "",
    unit: getDefaultUnit(type),
  };
}

export function SeriesCircuitCalc() {
  const [rows, setRows] = useState<ComponentRow[]>([
    {
      id: "s-r1",
      type: "R",
      value: 1000,
      label: "R1",
      valueStr: "1",
      unit: "k\u03a9",
    },
    {
      id: "s-r2",
      type: "R",
      value: 2200,
      label: "R2",
      valueStr: "2.2",
      unit: "k\u03a9",
    },
    {
      id: "s-c1",
      type: "C",
      value: 100e-9,
      label: "C1",
      valueStr: "100",
      unit: "nF",
    },
  ]);
  const [vsStr, setVsStr] = useState("12");
  const [vsUnit, setVsUnit] = useState("V");
  const [freqStr, setFreqStr] = useState("1");
  const [freqUnit, setFreqUnit] = useState("kHz");
  const [results, setResults] = useState<SeriesResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addRow = () => setRows((prev) => [...prev, makeRow("R")]);
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
      setError("Add at least one component.");
      return;
    }
    for (const r of rows) {
      if (!r.valueStr || r.value <= 0) {
        setError(`Component ${r.label} has an invalid value.`);
        return;
      }
    }
    const omega = 2 * Math.PI * freq;
    const comps: CircuitComponent[] = rows.map((r) => ({
      id: r.id,
      type: r.type,
      value: r.value,
      label: r.label,
    }));
    const Ztotal = seriesImpedance(comps, omega);
    const Vs = new Complex(vs, 0);
    const Itotal = Vs.div(Ztotal);

    const componentResults: ComponentResult[] = comps.map((comp) => {
      const Zi = getImpedance(comp, omega);
      const Vi = Itotal.mul(Zi);
      const Si = Vi.mul(new Complex(Itotal.re, -Itotal.im));
      const Vfmt = formatSI(Vi.magnitude(), "V");
      const Ifmt = formatSI(Itotal.magnitude(), "A");
      const Pfmt = formatSI(Math.abs(Si.re), "W");
      const Qfmt = formatSI(Math.abs(Si.im), "VAr");
      const Sfmt = formatSI(Si.magnitude(), "VA");
      return {
        id: comp.id,
        label: comp.label,
        type: comp.type,
        voltageDisplay: `${Vfmt.display} ${Vfmt.unit}`,
        currentDisplay: `${Ifmt.display} ${Ifmt.unit}`,
        powerP: `${Pfmt.display} ${Pfmt.unit}`,
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
      totalImpedance: formatImpedance(Ztotal),
      totalCurrent: `${Ifmt.display} ${Ifmt.unit}`,
      totalP: `${Pfmt.display} ${Pfmt.unit}`,
      totalQ: `${Qfmt.display} ${Qfmt.unit}`,
      totalS: `${Sfmt.display} ${Sfmt.unit}`,
      components: componentResults,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-card border-circuit-card-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-circuit-accent" />
            </div>
            <CardTitle className="text-base">
              Series Circuit Calculator
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
                data-ocid="series.vs.input"
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
                data-ocid="series.freq.input"
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
              <Label className="text-sm font-semibold">Components</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addRow}
                data-ocid="series.add_button"
                className="h-7 px-2 text-xs border-circuit-card-border text-circuit-accent hover:bg-circuit-accent/10"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Component
              </Button>
            </div>

            {rows.map((row, idx) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-circuit-card-border bg-circuit-input"
                data-ocid={`series.item.${idx + 1}`}
              >
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
                  data-ocid={`series.delete_button.${idx + 1}`}
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
              data-ocid="series.error_state"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={calculate}
            data-ocid="series.submit_button"
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
          data-ocid="series.success_state"
        >
          <Card className="bg-card border-circuit-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: "Total Impedance", value: results.totalImpedance },
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
                <p className="text-sm font-semibold mb-2">
                  Per-Component Results
                </p>
                <div className="overflow-x-auto">
                  <Table data-ocid="series.table">
                    <TableHeader>
                      <TableRow className="border-circuit-card-border">
                        <TableHead className="text-circuit-muted text-xs">
                          Component
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          Type
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          Voltage Drop
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
                      {results.components.map((c, idx) => (
                        <TableRow
                          key={c.id}
                          className="border-circuit-card-border"
                          data-ocid={`series.row.${idx + 1}`}
                        >
                          <TableCell className="font-mono text-xs font-semibold text-circuit-accent">
                            {c.label}
                          </TableCell>
                          <TableCell className="text-xs text-circuit-muted">
                            {c.type}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {c.voltageDisplay}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {c.currentDisplay}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {c.powerP}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {c.powerQ}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {c.powerS}
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

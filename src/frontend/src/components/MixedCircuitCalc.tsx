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
import { AlertCircle, Layers, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  type CircuitComponent,
  Complex,
  type ComponentType,
  formatImpedance,
  formatSI,
  getDefaultUnit,
  getUnitOptions,
  parallelImpedance,
  seriesImpedance,
  toSI,
} from "../utils/complexMath";
import { UnitPills } from "./UnitPills";

type GroupType = "series" | "parallel";

interface GroupComponent extends CircuitComponent {
  valueStr: string;
  unit: string;
}

interface Group {
  id: string;
  type: GroupType;
  label: string;
  components: GroupComponent[];
}

interface GroupResult {
  groupLabel: string;
  groupType: string;
  impedance: string;
  current: string;
  voltage: string;
  powerP: string;
  powerQ: string;
  powerS: string;
}

interface MixedResults {
  totalImpedance: string;
  totalCurrent: string;
  totalP: string;
  totalQ: string;
  totalS: string;
  topologySummary: string;
  groups: GroupResult[];
}

let gCounter = 0;
let gcCounter = 0;

function makeGroup(type: GroupType = "series"): Group {
  gCounter++;
  return {
    id: `g-${gCounter}`,
    type,
    label: `Group ${gCounter}`,
    components: [],
  };
}

function makeGroupComp(type: ComponentType = "R"): GroupComponent {
  gcCounter++;
  return {
    id: `gc-${gcCounter}`,
    type,
    value: 0,
    label: `${type}${gcCounter}`,
    valueStr: "",
    unit: getDefaultUnit(type),
  };
}

export function MixedCircuitCalc() {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "mg-1",
      type: "series",
      label: "Group 1 (Series)",
      components: [
        {
          id: "mgc-1",
          type: "R",
          value: 1000,
          label: "R1",
          valueStr: "1",
          unit: "k\u03a9",
        },
        {
          id: "mgc-2",
          type: "L",
          value: 10e-3,
          label: "L1",
          valueStr: "10",
          unit: "mH",
        },
      ],
    },
    {
      id: "mg-2",
      type: "parallel",
      label: "Group 2 (Parallel)",
      components: [
        {
          id: "mgc-3",
          type: "R",
          value: 2200,
          label: "R2",
          valueStr: "2.2",
          unit: "k\u03a9",
        },
        {
          id: "mgc-4",
          type: "C",
          value: 100e-9,
          label: "C1",
          valueStr: "100",
          unit: "nF",
        },
      ],
    },
  ]);
  const [vsStr, setVsStr] = useState("12");
  const [vsUnit, setVsUnit] = useState("V");
  const [freqStr, setFreqStr] = useState("1");
  const [freqUnit, setFreqUnit] = useState("kHz");
  const [results, setResults] = useState<MixedResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addGroup = () => setGroups((prev) => [...prev, makeGroup("series")]);
  const removeGroup = (gid: string) =>
    setGroups((prev) => prev.filter((g) => g.id !== gid));
  const updateGroup = (gid: string, patch: Partial<Group>) =>
    setGroups((prev) =>
      prev.map((g) => (g.id === gid ? { ...g, ...patch } : g)),
    );

  const addComponent = (gid: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== gid) return g;
        return { ...g, components: [...g.components, makeGroupComp("R")] };
      }),
    );
  };

  const removeComponent = (gid: string, cid: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== gid) return g;
        return { ...g, components: g.components.filter((c) => c.id !== cid) };
      }),
    );
  };

  const updateComponent = (
    gid: string,
    cid: string,
    patch: Partial<GroupComponent>,
  ) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== gid) return g;
        return {
          ...g,
          components: g.components.map((c) => {
            if (c.id !== cid) return c;
            const updated = { ...c, ...patch };
            if (patch.valueStr !== undefined || patch.unit !== undefined) {
              updated.value = toSI(updated.valueStr, updated.unit) ?? 0;
            }
            if (patch.type !== undefined && patch.unit === undefined) {
              updated.unit = getDefaultUnit(updated.type);
              updated.value = toSI(updated.valueStr, updated.unit) ?? 0;
            }
            return updated;
          }),
        };
      }),
    );
  };

  const buildTopology = (gs: Group[]): string => {
    const parts = gs.map((g) => {
      const sep = g.type === "series" ? " + " : " \u2225 ";
      return `[${g.components.map((c) => c.label).join(sep)}]`;
    });
    return parts.join(" + ");
  };

  const calculate = () => {
    setError(null);
    const vs = toSI(vsStr, vsUnit);
    const freq = toSI(freqStr, freqUnit);
    if (vs === null || freq === null) {
      setError("Enter valid source voltage and frequency.");
      return;
    }
    if (groups.length === 0) {
      setError("Add at least one group.");
      return;
    }
    for (const g of groups) {
      if (g.components.length === 0) {
        setError(`Group "${g.label}" has no components.`);
        return;
      }
      for (const c of g.components) {
        if (!c.valueStr || c.value <= 0) {
          setError(
            `Component ${c.label} in "${g.label}" has an invalid value.`,
          );
          return;
        }
      }
    }

    const omega = 2 * Math.PI * freq;
    const Vs = new Complex(vs, 0);

    const groupImpedances = groups.map((g) => {
      const comps: CircuitComponent[] = g.components.map((c) => ({
        id: c.id,
        type: c.type,
        value: c.value,
        label: c.label,
      }));
      return g.type === "series"
        ? seriesImpedance(comps, omega)
        : parallelImpedance(comps, omega);
    });

    const Ztotal = groupImpedances.reduce(
      (acc, z) => acc.add(z),
      new Complex(0, 0),
    );
    const Itotal = Vs.div(Ztotal);

    const groupResults: GroupResult[] = groups.map((g, idx) => {
      const Zg = groupImpedances[idx];
      const Vg = Itotal.mul(Zg);
      const Sg = Vg.mul(new Complex(Itotal.re, -Itotal.im));
      const Vfmt = formatSI(Vg.magnitude(), "V");
      const Ifmt = formatSI(Itotal.magnitude(), "A");
      const Pfmt = formatSI(Math.abs(Sg.re), "W");
      const Qfmt = formatSI(Math.abs(Sg.im), "VAr");
      const Sfmt = formatSI(Sg.magnitude(), "VA");
      return {
        groupLabel: g.label,
        groupType: g.type,
        impedance: formatImpedance(Zg),
        current: `${Ifmt.display} ${Ifmt.unit}`,
        voltage: `${Vfmt.display} ${Vfmt.unit}`,
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
      topologySummary: buildTopology(groups),
      groups: groupResults,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-card border-circuit-card-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
              <Layers className="h-3.5 w-3.5 text-circuit-accent" />
            </div>
            <CardTitle className="text-base">Mixed Circuit Builder</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="space-y-2">
              <Label className="text-sm">Source Voltage (Vs)</Label>
              <input
                type="number"
                value={vsStr}
                onChange={(e) => setVsStr(e.target.value)}
                data-ocid="mixed.vs.input"
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
                data-ocid="mixed.freq.input"
                className="w-full px-3 py-2 rounded-lg bg-circuit-input border border-circuit-card-border text-sm text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-2 focus:ring-circuit-accent transition-all"
              />
              <UnitPills
                units={["Hz", "kHz", "MHz"]}
                selected={freqUnit}
                onChange={setFreqUnit}
              />
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Circuit Groups (connected in series)
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addGroup}
                data-ocid="mixed.add_button"
                className="h-7 px-2 text-xs border-circuit-card-border text-circuit-accent hover:bg-circuit-accent/10"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Group
              </Button>
            </div>

            {groups.map((group, gIdx) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-circuit-card-border bg-circuit-input p-3"
                data-ocid={`mixed.item.${gIdx + 1}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-circuit-accent font-mono text-xs font-bold w-5">
                    {gIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={group.label}
                    onChange={(e) =>
                      updateGroup(group.id, { label: e.target.value })
                    }
                    className="flex-1 h-7 px-2 rounded border border-circuit-card-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-circuit-accent"
                  />
                  <Select
                    value={group.type}
                    onValueChange={(v) =>
                      updateGroup(group.id, { type: v as GroupType })
                    }
                  >
                    <SelectTrigger className="h-7 w-24 text-xs bg-card border-circuit-card-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="series">Series</SelectItem>
                      <SelectItem value="parallel">Parallel</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => removeGroup(group.id)}
                    data-ocid={`mixed.delete_button.${gIdx + 1}`}
                    className="h-7 w-7 flex items-center justify-center rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-circuit-accent/10 border border-circuit-accent/20 mb-2">
                  <span className="text-xs text-circuit-accent font-medium">
                    {group.type === "series"
                      ? "\u2295 Series"
                      : "\u2225 Parallel"}
                  </span>
                </div>

                <div className="space-y-1.5 mb-2">
                  {group.components.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg border border-circuit-card-border/50 bg-card/50"
                    >
                      <Select
                        value={comp.type}
                        onValueChange={(v) =>
                          updateComponent(group.id, comp.id, {
                            type: v as ComponentType,
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-14 text-xs bg-card border-circuit-card-border">
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
                        value={comp.label}
                        onChange={(e) =>
                          updateComponent(group.id, comp.id, {
                            label: e.target.value,
                          })
                        }
                        placeholder="Label"
                        className="h-7 w-14 px-1.5 rounded border border-circuit-card-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-circuit-accent"
                      />
                      <input
                        type="number"
                        value={comp.valueStr}
                        onChange={(e) =>
                          updateComponent(group.id, comp.id, {
                            valueStr: e.target.value,
                          })
                        }
                        placeholder="Value"
                        className="h-7 flex-1 min-w-[70px] px-1.5 rounded border border-circuit-card-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-circuit-accent"
                      />
                      <Select
                        value={comp.unit}
                        onValueChange={(v) =>
                          updateComponent(group.id, comp.id, { unit: v })
                        }
                      >
                        <SelectTrigger className="h-7 w-20 text-xs bg-card border-circuit-card-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getUnitOptions(comp.type).map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        onClick={() => removeComponent(group.id, comp.id)}
                        className="h-7 w-7 flex items-center justify-center rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addComponent(group.id)}
                  className="text-xs text-circuit-accent hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add component to group
                </button>
              </motion.div>
            ))}
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-destructive text-sm mb-3"
              data-ocid="mixed.error_state"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={calculate}
            data-ocid="mixed.submit_button"
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
          data-ocid="mixed.success_state"
        >
          <Card className="bg-card border-circuit-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg bg-circuit-input border border-circuit-card-border px-4 py-3">
                <p className="text-xs text-circuit-muted mb-1">
                  Circuit Topology
                </p>
                <p className="font-mono text-sm text-circuit-accent break-all">
                  {results.topologySummary}
                </p>
              </div>
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
                <p className="text-sm font-semibold mb-2">Per-Group Results</p>
                <div className="overflow-x-auto">
                  <Table data-ocid="mixed.table">
                    <TableHeader>
                      <TableRow className="border-circuit-card-border">
                        <TableHead className="text-circuit-muted text-xs">
                          Group
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          Type
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          Impedance
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          Voltage
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          Current
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          P (Real)
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          Q (React.)
                        </TableHead>
                        <TableHead className="text-circuit-muted text-xs">
                          S (App.)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.groups.map((g, idx) => (
                        <TableRow
                          key={g.groupLabel}
                          className="border-circuit-card-border"
                          data-ocid={`mixed.row.${idx + 1}`}
                        >
                          <TableCell className="font-mono text-xs font-semibold text-circuit-accent">
                            {g.groupLabel}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs ${g.groupType === "series" ? "bg-blue-500/10 text-blue-400" : "bg-green-500/10 text-green-400"}`}
                            >
                              {g.groupType}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {g.impedance}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {g.voltage}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {g.current}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {g.powerP}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {g.powerQ}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {g.powerS}
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

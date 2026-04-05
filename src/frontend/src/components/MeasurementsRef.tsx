import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Hash } from "lucide-react";

const MEASUREMENTS = [
  {
    quantity: "Voltage",
    symbol: "V",
    siUnit: "Volt (V)",
    instrument: "Voltmeter",
  },
  {
    quantity: "Current",
    symbol: "I",
    siUnit: "Ampere (A)",
    instrument: "Ammeter",
  },
  {
    quantity: "Resistance",
    symbol: "R",
    siUnit: "Ohm (Ω)",
    instrument: "Ohmmeter",
  },
  {
    quantity: "Power",
    symbol: "P",
    siUnit: "Watt (W)",
    instrument: "Multimeter",
  },
  {
    quantity: "Capacitance",
    symbol: "C",
    siUnit: "Farad (F)",
    instrument: "LCR Meter",
  },
  {
    quantity: "Inductance",
    symbol: "L",
    siUnit: "Henry (H)",
    instrument: "LCR Meter",
  },
];

const PREFIXES = [
  { prefix: "pico (p)", multiplier: "10⁻¹²", example: "1 pF = 10⁻¹² F" },
  { prefix: "nano (n)", multiplier: "10⁻⁹", example: "1 nF = 10⁻⁹ F" },
  { prefix: "micro (µ)", multiplier: "10⁻⁶", example: "1 µF = 10⁻⁶ F" },
  { prefix: "milli (m)", multiplier: "10⁻³", example: "1 mA = 0.001 A" },
  { prefix: "kilo (k)", multiplier: "10³", example: "1 kΩ = 1,000 Ω" },
  { prefix: "mega (M)", multiplier: "10⁶", example: "1 MΩ = 1,000,000 Ω" },
];

export function MeasurementsRef() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Electrical Quantities */}
      <Card className="bg-card border-circuit-card-border shadow-card-dark">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-circuit-accent" />
            </div>
            <CardTitle className="text-base">
              Electrical Quantities Reference
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table data-ocid="measurements.table">
            <TableHeader>
              <TableRow className="border-circuit-card-border">
                <TableHead className="text-circuit-muted font-semibold text-xs uppercase tracking-wider">
                  Quantity
                </TableHead>
                <TableHead className="text-circuit-muted font-semibold text-xs uppercase tracking-wider">
                  Symbol
                </TableHead>
                <TableHead className="text-circuit-muted font-semibold text-xs uppercase tracking-wider">
                  SI Unit
                </TableHead>
                <TableHead className="text-circuit-muted font-semibold text-xs uppercase tracking-wider">
                  Instrument
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MEASUREMENTS.map((m, i) => (
                <TableRow
                  key={m.quantity}
                  className="border-circuit-card-border hover:bg-circuit-accent/5 transition-colors"
                  data-ocid={`measurements.item.${i + 1}`}
                >
                  <TableCell className="font-medium text-foreground">
                    {m.quantity}
                  </TableCell>
                  <TableCell className="font-mono text-circuit-accent font-semibold">
                    {m.symbol}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-foreground/80">
                    {m.siUnit}
                  </TableCell>
                  <TableCell className="text-sm text-circuit-muted">
                    {m.instrument}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unit Prefixes */}
      <Card className="bg-card border-circuit-card-border shadow-card-dark">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
              <Hash className="h-4 w-4 text-circuit-accent" />
            </div>
            <CardTitle className="text-base">Unit Prefix Reference</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table data-ocid="prefixes.table">
            <TableHeader>
              <TableRow className="border-circuit-card-border">
                <TableHead className="text-circuit-muted font-semibold text-xs uppercase tracking-wider">
                  Prefix
                </TableHead>
                <TableHead className="text-circuit-muted font-semibold text-xs uppercase tracking-wider">
                  Multiplier
                </TableHead>
                <TableHead className="text-circuit-muted font-semibold text-xs uppercase tracking-wider">
                  Example
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PREFIXES.map((p, i) => (
                <TableRow
                  key={p.prefix}
                  className="border-circuit-card-border hover:bg-circuit-accent/5 transition-colors"
                  data-ocid={`prefixes.item.${i + 1}`}
                >
                  <TableCell className="font-medium text-foreground">
                    {p.prefix}
                  </TableCell>
                  <TableCell className="font-mono text-circuit-accent font-semibold">
                    {p.multiplier}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-foreground/70">
                    {p.example}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-circuit-card-border">
          <CardContent className="pt-4">
            <p className="text-xs text-circuit-muted uppercase tracking-wider mb-2">
              Ohm&apos;s Law Triangle
            </p>
            <div className="font-mono text-sm space-y-1">
              <p className="text-foreground">V = I × R</p>
              <p className="text-foreground">I = V / R</p>
              <p className="text-foreground">R = V / I</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-circuit-card-border">
          <CardContent className="pt-4">
            <p className="text-xs text-circuit-muted uppercase tracking-wider mb-2">
              Power Formulas
            </p>
            <div className="font-mono text-sm space-y-1">
              <p className="text-foreground">P = V × I</p>
              <p className="text-foreground">P = I² × R</p>
              <p className="text-foreground">P = V² / R</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-circuit-card-border">
          <CardContent className="pt-4">
            <p className="text-xs text-circuit-muted uppercase tracking-wider mb-2">
              Key Constants
            </p>
            <div className="font-mono text-sm space-y-1">
              <p className="text-foreground">π ≈ 3.14159</p>
              <p className="text-foreground">e ≈ 2.71828</p>
              <p className="text-foreground">j = √(−1)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Complex number math for AC circuit calculations

export class Complex {
  constructor(
    public re: number,
    public im: number,
  ) {}

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re,
    );
  }

  div(other: Complex): Complex {
    const denom = other.re * other.re + other.im * other.im;
    if (denom === 0) return new Complex(Number.POSITIVE_INFINITY, 0);
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom,
    );
  }

  reciprocal(): Complex {
    return new Complex(1, 0).div(this);
  }

  magnitude(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  phase(): number {
    return Math.atan2(this.im, this.re);
  }

  phaseDeg(): number {
    return (this.phase() * 180) / Math.PI;
  }

  toString(): string {
    const r = this.re.toPrecision(4);
    const i = Math.abs(this.im).toPrecision(4);
    if (this.im >= 0) return `${r} + j${i}`;
    return `${r} - j${i}`;
  }
}

// Component types
export type ComponentType = "R" | "L" | "C";

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  value: number; // SI base unit value
  label: string;
}

// Get impedance for a component at angular frequency omega
export function getImpedance(comp: CircuitComponent, omega: number): Complex {
  switch (comp.type) {
    case "R":
      return new Complex(comp.value, 0);
    case "L":
      return new Complex(0, omega * comp.value);
    case "C": {
      if (omega === 0) return new Complex(0, Number.NEGATIVE_INFINITY);
      return new Complex(0, -1 / (omega * comp.value));
    }
  }
}

// Series impedance: sum all impedances
export function seriesImpedance(
  components: CircuitComponent[],
  omega: number,
): Complex {
  return components.reduce(
    (acc, comp) => acc.add(getImpedance(comp, omega)),
    new Complex(0, 0),
  );
}

// Parallel impedance: 1 / sum(1/Zi)
export function parallelImpedance(
  components: CircuitComponent[],
  omega: number,
): Complex {
  const sumRecip = components.reduce(
    (acc, comp) => acc.add(getImpedance(comp, omega).reciprocal()),
    new Complex(0, 0),
  );
  return sumRecip.reciprocal();
}

// Format SI value with prefix
export function formatSI(
  value: number,
  baseUnit: string,
): { display: string; unit: string } {
  const abs = Math.abs(value);
  if (abs === 0) return { display: "0", unit: baseUnit };
  if (abs >= 1e9)
    return { display: (value / 1e9).toPrecision(4), unit: `G${baseUnit}` };
  if (abs >= 1e6)
    return { display: (value / 1e6).toPrecision(4), unit: `M${baseUnit}` };
  if (abs >= 1e3)
    return { display: (value / 1e3).toPrecision(4), unit: `k${baseUnit}` };
  if (abs >= 1) return { display: value.toPrecision(4), unit: baseUnit };
  if (abs >= 1e-3)
    return { display: (value / 1e-3).toPrecision(4), unit: `m${baseUnit}` };
  if (abs >= 1e-6)
    return {
      display: (value / 1e-6).toPrecision(4),
      unit: `\u00b5${baseUnit}`,
    };
  if (abs >= 1e-9)
    return { display: (value / 1e-9).toPrecision(4), unit: `n${baseUnit}` };
  return { display: (value / 1e-12).toPrecision(4), unit: `p${baseUnit}` };
}

export function formatImpedance(z: Complex): string {
  const mag = formatSI(z.magnitude(), "\u03a9");
  const phase = z.phaseDeg().toFixed(2);
  return `${mag.display} ${mag.unit} \u2220${phase}\u00b0`;
}

export const UNIT_MULTIPLIERS: Record<string, number> = {
  // Resistance
  "\u03a9": 1,
  "k\u03a9": 1e3,
  "M\u03a9": 1e6,
  // Capacitance
  F: 1,
  "\u00b5F": 1e-6,
  nF: 1e-9,
  pF: 1e-12,
  // Inductance
  H: 1,
  mH: 1e-3,
  "\u00b5H": 1e-6,
  // Voltage
  V: 1,
  mV: 1e-3,
  kV: 1e3,
  // Current
  A: 1,
  mA: 1e-3,
  "\u00b5A": 1e-6,
  // Frequency
  Hz: 1,
  kHz: 1e3,
  MHz: 1e6,
};

export function toSI(value: string, unit: string): number | null {
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return null;
  return n * (UNIT_MULTIPLIERS[unit] ?? 1);
}

export function getUnitOptions(type: ComponentType): string[] {
  switch (type) {
    case "R":
      return ["\u03a9", "k\u03a9", "M\u03a9"];
    case "L":
      return ["H", "mH", "\u00b5H"];
    case "C":
      return ["F", "\u00b5F", "nF", "pF"];
  }
}

export function getDefaultUnit(type: ComponentType): string {
  switch (type) {
    case "R":
      return "k\u03a9";
    case "L":
      return "mH";
    case "C":
      return "\u00b5F";
  }
}

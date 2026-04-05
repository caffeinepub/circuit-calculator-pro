import { useState } from "react";
import type { backendInterface } from "../backend";
import type { CalculationResult } from "../components/ResultsPanel";

const UNIT_MULTIPLIERS: Record<string, number> = {
  // Voltage
  V: 1,
  mV: 1e-3,
  kV: 1e3,
  // Current
  A: 1,
  mA: 1e-3,
  µA: 1e-6,
  // Resistance
  Ω: 1,
  kΩ: 1e3,
  MΩ: 1e6,
  // Capacitance
  F: 1,
  µF: 1e-6,
  nF: 1e-9,
  pF: 1e-12,
  // Inductance
  H: 1,
  mH: 1e-3,
  µH: 1e-6,
};

export function toSI(value: string, unit: string): number | null {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) return null;
  return num * (UNIT_MULTIPLIERS[unit] ?? 1);
}

export function formatValue(siValue: number): { value: string; unit: string } {
  const abs = Math.abs(siValue);
  if (abs >= 1e6) return { value: (siValue / 1e6).toPrecision(5), unit: "M" };
  if (abs >= 1e3) return { value: (siValue / 1e3).toPrecision(5), unit: "k" };
  if (abs >= 1) return { value: siValue.toPrecision(5), unit: "" };
  if (abs >= 1e-3) return { value: (siValue / 1e-3).toPrecision(5), unit: "m" };
  if (abs >= 1e-6) return { value: (siValue / 1e-6).toPrecision(5), unit: "µ" };
  if (abs >= 1e-9) return { value: (siValue / 1e-9).toPrecision(5), unit: "n" };
  if (abs >= 1e-12)
    return { value: (siValue / 1e-12).toPrecision(5), unit: "p" };
  return { value: siValue.toPrecision(5), unit: "" };
}

export function formatFrequency(hz: number): { value: string; unit: string } {
  if (hz >= 1e9) return { value: (hz / 1e9).toPrecision(5), unit: "GHz" };
  if (hz >= 1e6) return { value: (hz / 1e6).toPrecision(5), unit: "MHz" };
  if (hz >= 1e3) return { value: (hz / 1e3).toPrecision(5), unit: "kHz" };
  return { value: hz.toPrecision(5), unit: "Hz" };
}

export function formatTime(s: number): { value: string; unit: string } {
  const abs = Math.abs(s);
  if (abs >= 1) return { value: s.toPrecision(5), unit: "s" };
  if (abs >= 1e-3) return { value: (s / 1e-3).toPrecision(5), unit: "ms" };
  if (abs >= 1e-6) return { value: (s / 1e-6).toPrecision(5), unit: "µs" };
  return { value: (s / 1e-9).toPrecision(5), unit: "ns" };
}

export interface CalcState {
  result: CalculationResult | null;
  steps: string[];
  error: string | null;
  isLoading: boolean;
}

export function useOhmsLaw(actor: backendInterface | null) {
  const [state, setState] = useState<CalcState>({
    result: null,
    steps: [],
    error: null,
    isLoading: false,
  });

  const calculate = async (
    voltage: string,
    voltageUnit: string,
    current: string,
    currentUnit: string,
    resistance: string,
    resistanceUnit: string,
  ) => {
    if (!actor) {
      setState((prev) => ({
        ...prev,
        error: "Backend not available. Please try again.",
        result: null,
        steps: [],
      }));
      return;
    }

    const vSI = voltage.trim() === "" ? null : toSI(voltage, voltageUnit);
    const iSI = current.trim() === "" ? null : toSI(current, currentUnit);
    const rSI =
      resistance.trim() === "" ? null : toSI(resistance, resistanceUnit);

    const filled = [vSI, iSI, rSI].filter((x) => x !== null).length;
    const empty = [voltage, current, resistance].filter(
      (v) => v.trim() === "",
    ).length;

    if (empty !== 1) {
      setState((prev) => ({
        ...prev,
        error: "Enter exactly 2 values, leave 1 blank to solve for it.",
        result: null,
        steps: [],
      }));
      return;
    }
    if (filled < 2) {
      setState((prev) => ({
        ...prev,
        error: "Invalid numeric input. Please check your values.",
        result: null,
        steps: [],
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await actor.ohmsLaw(vSI, iSI, rSI);
      if (response.__kind__ === "err") {
        setState({
          result: null,
          steps: [],
          error: response.err,
          isLoading: false,
        });
        return;
      }
      const { value, steps } = response.ok;

      let label = "";
      let unit = "";
      let formula = "";
      let formatted = { value: value.toPrecision(5), unit: "" };

      if (vSI === null) {
        label = "Voltage (V)";
        const f = formatValue(value);
        unit = `${f.unit}V`;
        formatted = f;
        formula = "V = I × R";
      } else if (iSI === null) {
        label = "Current (I)";
        const f = formatValue(value);
        unit = `${f.unit}A`;
        formatted = f;
        formula = "I = V / R";
      } else {
        label = "Resistance (R)";
        const f = formatValue(value);
        unit = `${f.unit}Ω`;
        formatted = f;
        formula = "R = V / I";
      }

      setState({
        result: { label, value: formatted.value, unit, formula },
        steps,
        error: null,
        isLoading: false,
      });
    } catch (e) {
      setState({ result: null, steps: [], error: String(e), isLoading: false });
    }
  };

  return { ...state, calculate };
}

export function useVoltageDivider(actor: backendInterface | null) {
  const [state, setState] = useState<CalcState>({
    result: null,
    steps: [],
    error: null,
    isLoading: false,
  });

  const calculate = async (
    vin: string,
    vinUnit: string,
    r1: string,
    r1Unit: string,
    r2: string,
    r2Unit: string,
  ) => {
    if (!actor) {
      setState((prev) => ({
        ...prev,
        error: "Backend not available. Please try again.",
        result: null,
        steps: [],
      }));
      return;
    }
    const vinSI = toSI(vin, vinUnit);
    const r1SI = toSI(r1, r1Unit);
    const r2SI = toSI(r2, r2Unit);

    if (vinSI === null || r1SI === null || r2SI === null) {
      setState((prev) => ({
        ...prev,
        error: "Please enter valid numeric values for all fields.",
        result: null,
        steps: [],
      }));
      return;
    }
    if (r1SI + r2SI === 0) {
      setState((prev) => ({
        ...prev,
        error: "R1 + R2 cannot be zero.",
        result: null,
        steps: [],
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await actor.voltageDivider(vinSI, r1SI, r2SI);
      if (response.__kind__ === "err") {
        setState({
          result: null,
          steps: [],
          error: response.err,
          isLoading: false,
        });
        return;
      }
      const { value, steps } = response.ok;
      const f = formatValue(value);
      setState({
        result: {
          label: "Output Voltage (Vout)",
          value: f.value,
          unit: `${f.unit}V`,
          formula: "Vout = Vin × R2 / (R1 + R2)",
        },
        steps,
        error: null,
        isLoading: false,
      });
    } catch (e) {
      setState({ result: null, steps: [], error: String(e), isLoading: false });
    }
  };

  return { ...state, calculate };
}

export function useRCTimeConstant(actor: backendInterface | null) {
  const [state, setState] = useState<CalcState>({
    result: null,
    steps: [],
    error: null,
    isLoading: false,
  });

  const calculate = async (
    r: string,
    rUnit: string,
    c: string,
    cUnit: string,
  ) => {
    if (!actor) {
      setState((prev) => ({
        ...prev,
        error: "Backend not available. Please try again.",
        result: null,
        steps: [],
      }));
      return;
    }
    const rSI = toSI(r, rUnit);
    const cSI = toSI(c, cUnit);

    if (rSI === null || cSI === null) {
      setState((prev) => ({
        ...prev,
        error: "Please enter valid numeric values for both fields.",
        result: null,
        steps: [],
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await actor.rcTimeConstant(rSI, cSI);
      if (response.__kind__ === "err") {
        setState({
          result: null,
          steps: [],
          error: response.err,
          isLoading: false,
        });
        return;
      }
      const { value, steps } = response.ok;
      const f = formatTime(value);
      setState({
        result: {
          label: "Time Constant (τ)",
          value: f.value,
          unit: f.unit,
          formula: "τ = R × C",
        },
        steps,
        error: null,
        isLoading: false,
      });
    } catch (e) {
      setState({ result: null, steps: [], error: String(e), isLoading: false });
    }
  };

  return { ...state, calculate };
}

export function useRLCResonance(actor: backendInterface | null) {
  const [state, setState] = useState<CalcState>({
    result: null,
    steps: [],
    error: null,
    isLoading: false,
  });

  const calculate = async (
    l: string,
    lUnit: string,
    c: string,
    cUnit: string,
  ) => {
    if (!actor) {
      setState((prev) => ({
        ...prev,
        error: "Backend not available. Please try again.",
        result: null,
        steps: [],
      }));
      return;
    }
    const lSI = toSI(l, lUnit);
    const cSI = toSI(c, cUnit);

    if (lSI === null || cSI === null) {
      setState((prev) => ({
        ...prev,
        error: "Please enter valid numeric values for both fields.",
        result: null,
        steps: [],
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await actor.rlcResonantFrequency(lSI, cSI);
      if (response.__kind__ === "err") {
        setState({
          result: null,
          steps: [],
          error: response.err,
          isLoading: false,
        });
        return;
      }
      const { value, steps } = response.ok;
      const f = formatFrequency(value);
      setState({
        result: {
          label: "Resonant Frequency (f₀)",
          value: f.value,
          unit: f.unit,
          formula: "f = 1 / (2π√(LC))",
        },
        steps,
        error: null,
        isLoading: false,
      });
    } catch (e) {
      setState({ result: null, steps: [], error: String(e), isLoading: false });
    }
  };

  return { ...state, calculate };
}

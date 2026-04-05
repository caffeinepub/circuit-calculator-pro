import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CalculationResult {
    value: number;
    steps: Array<string>;
}
export type CalculationResponse = {
    __kind__: "ok";
    ok: CalculationResult;
} | {
    __kind__: "err";
    err: string;
};
export interface backendInterface {
    ohmsLaw(voltage: number | null, current: number | null, resistance: number | null): Promise<CalculationResponse>;
    rcTimeConstant(r: number, c: number): Promise<CalculationResponse>;
    rlcResonantFrequency(l: number, c: number): Promise<CalculationResponse>;
    voltageDivider(vin: number, r1: number, r2: number): Promise<CalculationResponse>;
    identifyComponent(imageDataUrl: string): Promise<string>;
}

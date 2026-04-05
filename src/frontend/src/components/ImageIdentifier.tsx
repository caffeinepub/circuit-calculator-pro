import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Camera, CheckCircle2, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";

interface IdentificationResult {
  componentType: string;
  value: string;
  description: string;
  confidence: number;
  colorBands?: string[];
  symbol: string;
  pinout?: string;
  package?: string;
}

const COLOR_BAND_COLORS: Record<string, string> = {
  Black: "#1a1a1a",
  Brown: "#7b4f27",
  Red: "#e23b3b",
  Orange: "#f97316",
  Yellow: "#eab308",
  Green: "#22c55e",
  Blue: "#3b82f6",
  Violet: "#8b5cf6",
  Gray: "#6b7280",
  White: "#f9fafb",
  Gold: "#d4af37",
  Silver: "#c0c0c0",
};

const COLOR_VALUES: Record<string, number> = {
  Black: 0,
  Brown: 1,
  Red: 2,
  Orange: 3,
  Yellow: 4,
  Green: 5,
  Blue: 6,
  Violet: 7,
  Gray: 8,
  White: 9,
};
const MULTIPLIER: Record<string, number> = {
  Black: 1,
  Brown: 10,
  Red: 100,
  Orange: 1000,
  Yellow: 10000,
  Green: 100000,
  Blue: 1000000,
  Gold: 0.1,
  Silver: 0.01,
};
const TOLERANCE: Record<string, string> = {
  Brown: "\u00b11%",
  Red: "\u00b12%",
  Gold: "\u00b15%",
  Silver: "\u00b110%",
  Green: "\u00b10.5%",
  Blue: "\u00b10.25%",
  Violet: "\u00b10.1%",
};

function formatResistance(ohms: number): string {
  if (ohms >= 1_000_000)
    return `${(ohms / 1_000_000).toFixed(ohms % 1_000_000 === 0 ? 0 : 2)} M\u03a9`;
  if (ohms >= 1_000)
    return `${(ohms / 1_000).toFixed(ohms % 1_000 === 0 ? 0 : 2)} k\u03a9`;
  return `${ohms} \u03a9`;
}

function calcResistorValue(bands: string[]): string {
  if (bands.length < 3) return "Unknown";
  const d1 = COLOR_VALUES[bands[0]] ?? 0;
  const d2 = COLOR_VALUES[bands[1]] ?? 0;
  const mult = MULTIPLIER[bands[2]] ?? 1;
  const ohms = (d1 * 10 + d2) * mult;
  const tol = bands[3] ? (TOLERANCE[bands[3]] ?? "") : "";
  return `${formatResistance(ohms)}${tol ? ` ${tol}` : ""}`;
}

const GEMINI_API_KEY = "AIzaSyCn8Pvn9KRSWYx2lHtK--gdiyTt1OxgfeM";
// Use gemini-2.0-flash which is the current stable model
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function identifyWithGemini(
  imageBlob: Blob,
): Promise<IdentificationResult> {
  const mimeType = imageBlob.type || "image/jpeg";

  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(imageBlob);
  });

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64,
              },
            },
            {
              text: 'You are an expert electrical engineer. Analyze this image of an electronic component and identify it precisely.\n\nRespond ONLY with a valid JSON object (no markdown, no code blocks) with these exact fields:\n{\n  "componentType": "<e.g. Resistor, Capacitor, Inductor, LED, Transistor, Diode, Zener Diode, Schottky Diode, Integrated Circuit, Crystal>",\n  "value": "<the component value with units, e.g. 100\u03a9 \u00b15%, 100\u00b5F 25V, 10mH, 2.0V Vf, 2N2222, NE555, 16MHz>",\n  "description": "<1-2 sentence detailed description including visible markings, color bands, package type, and any readable text>",\n  "confidence": <integer 0-100>,\n  "symbol": "<circuit symbol character: \u03a9 for resistor, F for capacitor, H for inductor, \u2192 for LED, Q for transistor, \u2192| for diode, IC for integrated circuit, X for crystal>",\n  "package": "<package type if visible, e.g. TO-92, DIP-8, 0805, Radial, Axial, or null>",\n  "pinout": "<pin names if applicable, e.g. Base/Collector/Emitter, or null>",\n  "colorBands": ["<color1>", "<color2>", "<color3>", "<color4 or null>"] or null\n}\n\nFor resistors, always include colorBands if visible. For unknown components, set componentType to \'Electronic Component\' and confidence below 50.',
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    if (response.status === 400) {
      throw new Error("Invalid request or unsupported image format");
    }
    if (response.status === 403) {
      throw new Error("API key invalid or quota exceeded");
    }
    if (response.status === 404) {
      throw new Error(
        `Model not found. Please check the Gemini model name. (${errBody.slice(0, 120)})`,
      );
    }
    throw new Error(`API error ${response.status}: ${errBody.slice(0, 120)}`);
  }

  const data = await response.json();
  const rawText: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip markdown code fences if present
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  let parsed: IdentificationResult;
  try {
    parsed = JSON.parse(cleaned) as IdentificationResult;
  } catch {
    throw new Error(`Could not parse AI response: ${cleaned.slice(0, 200)}`);
  }

  return parsed;
}

export function ImageIdentifier() {
  const [dragging, setDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageName, setImageName] = useState("");
  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawCaption, setRawCaption] = useState<string | null>(null);
  const fileInputId = "component-image-upload";

  const handleFile = useCallback((file: File) => {
    setImageName(file.name);
    setResult(null);
    setError(null);
    setRawCaption(null);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageBlob(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) handleFile(file);
    },
    [handleFile],
  );

  const identify = async () => {
    if (!imageBlob) return;
    setIdentifying(true);
    setResult(null);
    setError(null);
    setRawCaption(null);
    try {
      const identified = await identifyWithGemini(imageBlob);
      // Store a JSON representation as the raw response for the details section
      setRawCaption(JSON.stringify(identified, null, 2));
      setResult(identified);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("API key invalid") || msg.includes("quota")) {
        setError(
          "API key invalid or quota exceeded. Please check your Gemini API key.",
        );
      } else if (
        msg.includes("unsupported image") ||
        msg.includes("Invalid request")
      ) {
        setError(
          "Unsupported image format. Please upload a JPG, PNG, or WEBP image.",
        );
      } else if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("fetch")
      ) {
        setError(
          "Network error: could not reach the AI service. Please check your connection and try again.",
        );
      } else {
        setError(`Identification failed: ${msg}`);
      }
    } finally {
      setIdentifying(false);
    }
  };

  const clearImage = () => {
    setImageUrl(null);
    setImageBlob(null);
    setImageName("");
    setResult(null);
    setError(null);
    setRawCaption(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-card border-circuit-card-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
              <Camera className="h-3.5 w-3.5 text-circuit-accent" />
            </div>
            <div>
              <CardTitle className="text-base">
                Component Image Identifier
              </CardTitle>
              <p className="text-xs text-circuit-muted mt-0.5">
                Upload a photo of an electrical component to identify its type
                and value
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!imageUrl ? (
            <label
              htmlFor={fileInputId}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              data-ocid="identifier.dropzone"
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-16 ${
                dragging
                  ? "border-circuit-accent bg-circuit-accent/5 scale-[1.01]"
                  : "border-circuit-card-border hover:border-circuit-accent/50 hover:bg-circuit-accent/5"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center">
                <Upload className="h-5 w-5 text-circuit-accent" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop a component image here
                </p>
                <p className="text-xs text-circuit-muted mt-1">
                  or click to browse \u2014 JPG, PNG, WEBP supported
                </p>
              </div>
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                data-ocid="identifier.upload_button"
              />
            </label>
          ) : (
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border border-circuit-card-border">
                <img
                  src={imageUrl}
                  alt="Component"
                  className="w-full max-h-64 object-contain bg-black"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 border border-circuit-card-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/40 transition-colors"
                  data-ocid="identifier.close_button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-circuit-muted mt-1.5 font-mono truncate">
                {imageName}
              </p>
            </div>
          )}

          {imageUrl && (
            <Button
              onClick={identify}
              disabled={identifying}
              data-ocid="identifier.primary_button"
              className="w-full bg-circuit-accent hover:opacity-90 text-white font-semibold accent-glow-sm"
            >
              {identifying ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing with AI...
                </span>
              ) : (
                "Identify Component"
              )}
            </Button>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5"
              data-ocid="identifier.error_state"
            >
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-xs text-destructive leading-relaxed">
                {error}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-circuit-accent/20 bg-circuit-accent/5">
        <span className="text-xs text-circuit-accent mt-0.5">\u2139</span>
        <p className="text-xs text-circuit-muted">
          <span className="font-semibold text-circuit-accent">
            Tips for best results:
          </span>{" "}
          Use a clear, well-lit photo of a single component on a plain
          background. Supported: resistors, capacitors, inductors, LEDs,
          transistors, diodes, ICs, crystals. Powered by Google Gemini 2.0 Flash
          for accurate identification.
        </p>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          data-ocid="identifier.success_state"
        >
          <Card className="bg-card border-circuit-card-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <CardTitle className="text-base">
                  Identified Component
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-circuit-input border border-circuit-card-border p-3">
                  <p className="text-xs text-circuit-muted mb-1">
                    Component Type
                  </p>
                  <p className="font-semibold text-sm text-foreground">
                    {result.componentType}
                  </p>
                </div>
                <div className="rounded-lg bg-circuit-input border border-circuit-card-border p-3">
                  <p className="text-xs text-circuit-muted mb-1">Value</p>
                  <p className="font-mono font-semibold text-sm text-circuit-accent">
                    {result.value}
                  </p>
                </div>
                <div className="rounded-lg bg-circuit-input border border-circuit-card-border p-3">
                  <p className="text-xs text-circuit-muted mb-1">Symbol</p>
                  <p className="font-mono font-bold text-lg text-circuit-accent">
                    {result.symbol}
                  </p>
                </div>
                <div className="rounded-lg bg-circuit-input border border-circuit-card-border p-3">
                  <p className="text-xs text-circuit-muted mb-1">Confidence</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-circuit-card-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-circuit-accent transition-all"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-circuit-accent">
                      {result.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {(result.package || result.pinout) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.package && (
                    <div className="rounded-lg bg-circuit-input border border-circuit-card-border p-3">
                      <p className="text-xs text-circuit-muted mb-1">Package</p>
                      <p className="text-sm font-medium text-foreground">
                        {result.package}
                      </p>
                    </div>
                  )}
                  {result.pinout && (
                    <div className="rounded-lg bg-circuit-input border border-circuit-card-border p-3">
                      <p className="text-xs text-circuit-muted mb-1">Pinout</p>
                      <p className="text-sm font-medium text-foreground">
                        {result.pinout}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-circuit-muted rounded-lg bg-circuit-input border border-circuit-card-border px-3 py-2">
                {result.description}
              </p>

              {result.colorBands && result.colorBands.length > 0 && (
                <div>
                  <p className="text-xs text-circuit-muted mb-2">
                    Resistor Color Bands
                  </p>
                  <div className="flex gap-1.5 items-end">
                    {result.colorBands.map((band) => (
                      <div
                        key={band}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-8 h-10 rounded border border-white/10"
                          style={{
                            backgroundColor: COLOR_BAND_COLORS[band] ?? "#666",
                          }}
                        />
                        <span className="text-xs text-circuit-muted">
                          {band}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-circuit-muted mt-1 font-mono">
                    Calculated: {calcResistorValue(result.colorBands)}
                  </p>
                </div>
              )}

              {rawCaption && (
                <details className="group">
                  <summary className="text-xs text-circuit-muted cursor-pointer select-none hover:text-circuit-accent transition-colors">
                    Show raw AI description
                  </summary>
                  <p className="text-xs text-circuit-muted mt-1.5 font-mono bg-circuit-input border border-circuit-card-border rounded-lg px-3 py-2 leading-relaxed whitespace-pre-wrap">
                    {rawCaption}
                  </p>
                </details>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

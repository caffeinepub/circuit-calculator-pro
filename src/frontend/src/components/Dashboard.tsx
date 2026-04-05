import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Camera,
  Cpu,
  Divide,
  GitBranch,
  Layers,
  Radio,
  Thermometer,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

type TabId =
  | "ohms"
  | "voltage-divider"
  | "rc"
  | "rlc"
  | "series"
  | "parallel"
  | "mixed"
  | "image-identifier";

interface DashboardProps {
  onNavigate: (tab: TabId) => void;
}

const TOOLS = [
  {
    id: "ohms" as TabId,
    icon: Zap,
    title: "Ohm's Law",
    description:
      "Solve for voltage, current, or resistance. Enter any two values to find the third.",
    badge: "Basic",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-400/20",
  },
  {
    id: "voltage-divider" as TabId,
    icon: Divide,
    title: "Voltage Divider",
    description:
      "Calculate output voltage from a resistor voltage divider network.",
    badge: "Basic",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-400/20",
  },
  {
    id: "rc" as TabId,
    icon: Thermometer,
    title: "RC Time Constant",
    description:
      "Compute the RC time constant \u03c4 = RC for charging/discharging circuits.",
    badge: "AC/DC",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-400/20",
  },
  {
    id: "rlc" as TabId,
    icon: Radio,
    title: "RLC Resonance",
    description:
      "Find the resonant frequency f\u2080 = 1/(2\u03c0\u221aLC) for RLC circuits.",
    badge: "AC",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-400/20",
  },
  {
    id: "series" as TabId,
    icon: Activity,
    title: "Series Circuit",
    description:
      "Multi-component series circuit with full impedance, voltage, current, and power analysis.",
    badge: "Multi",
    badgeClass: "bg-green-500/10 text-green-400 border-green-400/20",
  },
  {
    id: "parallel" as TabId,
    icon: GitBranch,
    title: "Parallel Circuit",
    description:
      "Multi-branch parallel circuit analysis with branch currents and power per branch.",
    badge: "Multi",
    badgeClass: "bg-green-500/10 text-green-400 border-green-400/20",
  },
  {
    id: "mixed" as TabId,
    icon: Layers,
    title: "Mixed Circuit Builder",
    description:
      "Build complex mixed series-parallel circuits and calculate all parameters at once.",
    badge: "Advanced",
    badgeClass: "bg-orange-500/10 text-orange-400 border-orange-400/20",
  },
  {
    id: "image-identifier" as TabId,
    icon: Camera,
    title: "Image Identifier",
    description:
      "Upload a component photo to identify its type and value. Auto-fills into calculators.",
    badge: "AI",
    badgeClass: "bg-pink-500/10 text-pink-400 border-pink-400/20",
  },
];

const STATS = [
  { label: "Calculators", value: "8", icon: Cpu },
  { label: "Component Types", value: "R, L, C", icon: Activity },
  { label: "Unit Prefixes", value: "7", icon: Zap },
  { label: "Topologies", value: "3", icon: Layers },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-circuit-card-border bg-gradient-to-br from-card via-circuit-accent/5 to-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-circuit-accent/10 border border-circuit-accent/30 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-circuit-accent animate-pulse" />
              <span className="text-xs font-medium text-circuit-accent tracking-wide">
                All Systems Online
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Circuit Calculator{" "}
              <span className="text-circuit-accent">Pro</span>
            </h2>
            <p className="text-sm text-circuit-muted max-w-lg">
              Professional-grade electrical calculations with complex impedance
              math, unit conversion, and step-by-step solutions. Supports
              series, parallel, and mixed circuit topologies.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              onClick={() => onNavigate("series")}
              data-ocid="dashboard.primary_button"
              className="bg-circuit-accent hover:opacity-90 text-white font-semibold accent-glow-sm"
            >
              Build a Circuit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-circuit-card-border">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-circuit-accent/10 border border-circuit-accent/20 flex items-center justify-center flex-shrink-0">
                <s.icon className="h-3.5 w-3.5 text-circuit-accent" />
              </div>
              <div>
                <p className="font-mono font-bold text-sm text-foreground">
                  {s.value}
                </p>
                <p className="text-xs text-circuit-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tool grid */}
      <div>
        <h3 className="text-sm font-semibold text-circuit-muted uppercase tracking-wider mb-4">
          All Calculators
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TOOLS.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
            >
              <Card
                className="bg-card border-circuit-card-border hover:border-circuit-accent/40 transition-all duration-200 group cursor-pointer h-full"
                onClick={() => onNavigate(tool.id)}
                data-ocid={`dashboard.${tool.id}.card`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-circuit-accent/10 border border-circuit-accent/30 flex items-center justify-center group-hover:bg-circuit-accent/20 transition-colors">
                      <tool.icon className="h-4 w-4 text-circuit-accent" />
                    </div>
                    <Badge
                      className={`text-xs border ${tool.badgeClass} bg-transparent`}
                    >
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm mt-2">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">
                    {tool.description}
                  </CardDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 h-7 px-2 text-xs text-circuit-accent hover:bg-circuit-accent/10 -ml-2"
                    data-ocid={`dashboard.${tool.id}.button`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(tool.id);
                    }}
                  >
                    Open \u2192
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Unit reference */}
      <Card className="bg-card border-circuit-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Unit Prefix Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { prefix: "G", name: "Giga", exp: "\u00d710\u2079" },
              { prefix: "M", name: "Mega", exp: "\u00d710\u2076" },
              { prefix: "k", name: "Kilo", exp: "\u00d710\u00b3" },
              { prefix: "\u2014", name: "Base", exp: "\u00d710\u2070" },
              { prefix: "m", name: "Milli", exp: "\u00d710\u207b\u00b3" },
              { prefix: "\u00b5", name: "Micro", exp: "\u00d710\u207b\u2076" },
              { prefix: "n", name: "Nano", exp: "\u00d710\u207b\u2079" },
            ].map((u) => (
              <div
                key={u.prefix}
                className="text-center rounded-lg bg-circuit-input border border-circuit-card-border p-2"
              >
                <p className="font-mono text-lg font-bold text-circuit-accent">
                  {u.prefix}
                </p>
                <p className="text-xs text-foreground">{u.name}</p>
                <p className="font-mono text-xs text-circuit-muted">{u.exp}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

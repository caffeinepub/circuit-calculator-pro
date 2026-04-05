import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Bell, Cpu, Menu, Search, Settings, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { ImageIdentifier } from "./components/ImageIdentifier";
import { MeasurementsRef } from "./components/MeasurementsRef";
import { MixedCircuitCalc } from "./components/MixedCircuitCalc";
import { OhmsLawCalc } from "./components/OhmsLawCalc";
import { ParallelCircuitCalc } from "./components/ParallelCircuitCalc";
import { RCTimeConstantCalc } from "./components/RCTimeConstantCalc";
import { RLCResonanceCalc } from "./components/RLCResonanceCalc";
import { SeriesCircuitCalc } from "./components/SeriesCircuitCalc";
import { VoltageDividerCalc } from "./components/VoltageDividerCalc";

type TabId =
  | "dashboard"
  | "ohms"
  | "voltage-divider"
  | "rc"
  | "rlc"
  | "series"
  | "parallel"
  | "mixed"
  | "image-identifier"
  | "measurements";

const TABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "ohms", label: "Ohm's Law" },
  { id: "voltage-divider", label: "Voltage Divider" },
  { id: "rc", label: "RC Calculator" },
  { id: "rlc", label: "RLC Calculator" },
  { id: "series", label: "Series Circuit" },
  { id: "parallel", label: "Parallel Circuit" },
  { id: "mixed", label: "Mixed Circuit" },
  { id: "image-identifier", label: "Image Identifier" },
  { id: "measurements", label: "Measurements" },
];

const TAB_DESCRIPTIONS: Record<TabId, string> = {
  dashboard: "Overview of all calculators and engineering tools",
  ohms: "Calculate voltage, current, or resistance using Ohm's Law",
  "voltage-divider":
    "Find output voltage across a resistor in a voltage divider circuit",
  rc: "Calculate the RC time constant for charging and discharging",
  rlc: "Find the resonant frequency of an RLC circuit",
  series:
    "Multi-component series circuit \u2014 full impedance, voltage, current, and power analysis",
  parallel:
    "Multi-branch parallel circuit \u2014 equivalent impedance and branch analysis",
  mixed:
    "Build complex mixed series-parallel circuits and calculate all parameters at once",
  "image-identifier": "Upload a component photo to identify its type and value",
  measurements:
    "Reference guide for electrical quantities, units, and instruments",
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("circuitcalc-dark-mode");
    if (stored !== null) setDarkMode(stored === "true");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("circuitcalc-dark-mode", String(darkMode));
  }, [darkMode]);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-circuit-card-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center h-14 gap-3">
            <button
              type="button"
              onClick={() => handleTabChange("dashboard")}
              className="flex items-center gap-2 flex-shrink-0 mr-2"
              data-ocid="header.dashboard.link"
            >
              <div className="w-7 h-7 rounded-md bg-circuit-accent/10 border border-circuit-accent/40 flex items-center justify-center">
                <Cpu className="h-4 w-4 text-circuit-accent" />
              </div>
              <div className="hidden sm:flex items-baseline gap-0.5">
                <span className="font-sans font-bold text-sm tracking-tight text-foreground uppercase">
                  Circuit Calculator
                </span>
                <span className="font-sans font-bold text-sm tracking-tight text-circuit-accent uppercase ml-1">
                  Pro
                </span>
              </div>
            </button>

            {/* Search (cosmetic) */}
            <div className="relative hidden md:flex flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-circuit-muted" />
              <input
                type="text"
                placeholder="Search calculators..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-circuit-input border border-circuit-card-border text-xs text-foreground placeholder:text-circuit-muted focus:outline-none focus:ring-1 focus:ring-circuit-accent transition-all"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                data-ocid="header.darkmode.toggle"
                className="data-[state=checked]:bg-circuit-accent"
              />

              <button
                type="button"
                className="relative w-8 h-8 rounded-md bg-card border border-circuit-card-border flex items-center justify-center text-circuit-muted hover:text-circuit-accent hover:border-circuit-accent transition-all"
                aria-label="Notifications"
              >
                <Bell className="h-3.5 w-3.5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" />
              </button>

              <button
                type="button"
                className="w-8 h-8 rounded-md bg-card border border-circuit-card-border flex items-center justify-center text-circuit-muted hover:text-circuit-accent hover:border-circuit-accent transition-all"
                aria-label="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                className="w-8 h-8 rounded-full bg-circuit-accent/10 border border-circuit-accent/40 flex items-center justify-center text-circuit-accent text-xs font-bold hover:bg-circuit-accent/20 transition-colors"
                aria-label="User profile"
              >
                EN
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-8 h-8 rounded-md bg-card border border-circuit-card-border flex items-center justify-center text-circuit-muted"
                aria-label="Toggle menu"
                data-ocid="header.mobile_menu.toggle"
              >
                {mobileMenuOpen ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <Menu className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop tabs */}
          <nav
            className="hidden lg:flex items-end gap-0 overflow-x-auto"
            aria-label="Main navigation"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                data-ocid={`nav.${tab.id}.link`}
                className={`flex-shrink-0 px-3.5 py-2 text-xs font-medium border-b-2 transition-all duration-150 ${
                  activeTab === tab.id
                    ? "border-circuit-accent text-circuit-accent"
                    : "border-transparent text-circuit-muted hover:text-foreground hover:border-circuit-card-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Mobile nav */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden overflow-hidden border-t border-circuit-card-border pb-2"
              >
                <div className="flex flex-col gap-0.5 pt-2">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      data-ocid={`mobile.nav.${tab.id}.link`}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all ${
                        activeTab === tab.id
                          ? "text-circuit-accent bg-circuit-accent/10"
                          : "text-circuit-muted hover:text-foreground hover:bg-card"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        {activeTab !== "dashboard" && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-circuit-muted mt-0.5">
              {TAB_DESCRIPTIONS[activeTab]}
            </p>
            <Separator className="mt-3 bg-circuit-card-border" />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && (
              <Dashboard onNavigate={(tab) => handleTabChange(tab as TabId)} />
            )}
            {activeTab === "ohms" && <OhmsLawCalc />}
            {activeTab === "voltage-divider" && <VoltageDividerCalc />}
            {activeTab === "rc" && <RCTimeConstantCalc />}
            {activeTab === "rlc" && <RLCResonanceCalc />}
            {activeTab === "series" && <SeriesCircuitCalc />}
            {activeTab === "parallel" && <ParallelCircuitCalc />}
            {activeTab === "mixed" && <MixedCircuitCalc />}
            {activeTab === "image-identifier" && <ImageIdentifier />}
            {activeTab === "measurements" && <MeasurementsRef />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-circuit-card-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-circuit-muted">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Status: Online
              </span>
              <span>|</span>
              <span>App v2.2.0</span>
              <span>|</span>
              <button
                type="button"
                className="hover:text-circuit-accent transition-colors"
              >
                Resources
              </button>
              <span>|</span>
              <button
                type="button"
                className="hover:text-circuit-accent transition-colors"
              >
                Documentation
              </button>
              <span>|</span>
              <button
                type="button"
                className="hover:text-circuit-accent transition-colors"
              >
                Support
              </button>
              <span>|</span>
              <button
                type="button"
                className="hover:text-circuit-accent transition-colors"
              >
                Legal
              </button>
            </div>
            <p>
              &copy; {new Date().getFullYear()}. Built with \u2665 using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-circuit-accent hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

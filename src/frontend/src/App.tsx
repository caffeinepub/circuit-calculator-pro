import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Bell, Cpu, Menu, Search, Settings, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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

// Marquee text — repeated so the seamless 50% loop always fills the viewport
const MARQUEE_SEGMENT =
  "Made with Electro Love \u26a1 Mathu CC Pro 2026 \u26a1\u2002\u2002";
const MARQUEE_STYLE: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", monospace',
  fontWeight: 800,
  fontSize: "0.65rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#00e5ff",
  textShadow:
    "0 0 6px #00e5ff, 0 0 16px #00bcd4, 0 0 32px rgba(0,188,212,0.35)",
  paddingRight: "4rem",
};

function MarqueeStrip() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: "rgba(0, 6, 18, 0.80)",
        borderBottom: "1px solid rgba(0, 229, 255, 0.16)",
        paddingTop: "5px",
        paddingBottom: "5px",
      }}
      aria-hidden="true"
    >
      <div className="marquee-track">
        {Array.from({ length: 16 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static decorative list
          <span key={i} style={MARQUEE_STYLE}>
            {MARQUEE_SEGMENT}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Easter Egg: Rose burst ──────────────────────────────────────────────

type Heart = {
  id: number;
  angle: number;
  distance: number;
  size: number;
  spin: number;
  delay: number;
  duration: number;
};

function generateHearts(count = 20): Heart[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.4,
    distance: 110 + Math.random() * 140,
    size: 1.0 + Math.random() * 1.3,
    spin: (Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 200),
    delay: 0.05 + Math.random() * 0.25,
    duration: 1.2 + Math.random() * 0.7,
  }));
}

const HEARTS = generateHearts(20);

function RoseEasterEgg({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: decorative dismiss overlay
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(3px)" }}
      onClick={onDone}
    >
      <motion.div
        initial={{ scale: 0, rotate: -12 }}
        animate={{
          scale: [0, 1.5, 0.9, 1.15, 1.0, 1.05, 1.0],
          rotate: [-12, 10, -5, 3, -2, 1, 0],
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
          times: [0, 0.25, 0.45, 0.6, 0.75, 0.88, 1],
        }}
        exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
        style={{
          fontSize: "6rem",
          lineHeight: 1,
          position: "relative",
          zIndex: 2,
          userSelect: "none",
        }}
      >
        🌹
        {HEARTS.map((h) => {
          const tx = Math.cos(h.angle) * h.distance;
          const ty = Math.sin(h.angle) * h.distance;
          return (
            <motion.span
              key={h.id}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                x: [0, tx * 0.6, tx],
                y: [0, ty * 0.6, ty],
                opacity: [0, 1, 1, 0],
                scale: [0, 1.3, 1.0, 0.6],
                rotate: [0, h.spin * 0.5, h.spin],
              }}
              transition={{
                duration: h.duration,
                ease: "easeOut",
                delay: h.delay,
                times: [0, 0.3, 0.7, 1],
              }}
              style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                fontSize: `${h.size}rem`,
                pointerEvents: "none",
                display: "block",
                lineHeight: 1,
                transformOrigin: "center",
              }}
            >
              ❤️
            </motion.span>
          );
        })}
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={{
          position: "absolute",
          bottom: "calc(50% - 8rem)",
          color: "rgba(255,255,255,0.45)",
          fontSize: "0.7rem",
          fontFamily: '"JetBrains Mono", monospace',
          letterSpacing: "0.12em",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        click anywhere to dismiss
      </motion.p>
    </div>
  );
}

// ── Bell Modal ─────────────────────────────────────────────────────────────

function BellModal({ onClose }: { onClose: () => void }) {
  const [showLightning, setShowLightning] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowLightning(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: full-screen dismiss overlay
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Lightning flash overlay */}
      {showLightning && (
        <div
          className="fixed inset-0 pointer-events-none z-[9999]"
          style={{ animation: "lightning-flash 1.2s ease-out forwards" }}
        />
      )}

      {/* Modal card */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.4, opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={onClose}
        style={{
          background: "rgba(0, 8, 24, 0.95)",
          border: "2px solid rgba(0, 229, 255, 0.4)",
          borderRadius: "1rem",
          boxShadow:
            "0 0 40px rgba(0, 229, 255, 0.25), 0 0 80px rgba(0, 180, 212, 0.15)",
          padding: "1rem",
          maxWidth: "min(90vw, 520px)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        <img
          src="/assets/mathuwp-019d5d0d-cb3a-7600-843f-5cda07a18540.jpg"
          alt="Bell popup"
          style={{
            maxHeight: "70vh",
            maxWidth: "100%",
            objectFit: "contain",
            borderRadius: "0.5rem",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.1rem",
            marginTop: "0.5rem",
          }}
        >
          {(["THE MAN", "THE MYTH", "THE LEGEND"] as string[]).map((line) => (
            <span
              key={line}
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 900,
                fontSize: "clamp(1.1rem, 4vw, 1.8rem)",
                letterSpacing: "0.18em",
                textTransform: "uppercase" as const,
                color: "#00b4ff",
                textShadow:
                  "0 0 8px #00b4ff, 0 0 20px #0070ff, 0 0 40px #003aff, 0 0 80px #0020cc, 2px 2px 0 #001a8a",
                WebkitTextStroke: "1px rgba(0,180,255,0.5)",
              }}
            >
              {line}
            </span>
          ))}
        </div>
        <p
          style={{
            color: "rgba(0, 229, 255, 0.6)",
            fontSize: "0.65rem",
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: "0.12em",
          }}
        >
          click anywhere to close
        </p>
      </motion.div>
    </div>
  );
}

// ── YouTube song player (hidden iframe via YouTube IFrame API) ─────────────

// Video ID extracted from https://youtube.com/shorts/UYh0ngsu_5o
const YT_VIDEO_ID = "UYh0ngsu_5o";
// Video ID extracted from https://youtu.be/iJAZJAQTZ4A
const YT_BELL_VIDEO_ID = "iJAZJAQTZ4A";

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: {
              target: {
                playVideo: () => void;
                stopVideo: () => void;
                destroy: () => void;
              };
            }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        },
      ) => {
        playVideo: () => void;
        stopVideo: () => void;
        destroy: () => void;
      };
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

function useYouTubePlayer() {
  const playerRef = useRef<{
    playVideo: () => void;
    stopVideo: () => void;
    destroy: () => void;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const readyRef = useRef(false);

  // Load the YT IFrame API script once
  useEffect(() => {
    if (document.getElementById("yt-iframe-api")) return;
    const tag = document.createElement("script");
    tag.id = "yt-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  const initPlayer = useCallback(() => {
    if (playerRef.current || !containerRef.current) return;
    const div = document.createElement("div");
    div.id = "yt-player-inner";
    containerRef.current.appendChild(div);

    playerRef.current = new window.YT.Player("yt-player-inner", {
      videoId: YT_VIDEO_ID,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          readyRef.current = true;
          e.target.playVideo();
          setIsPlaying(true);
        },
        onStateChange: (e) => {
          // YT.PlayerState.ENDED = 0
          if (e.data === 0) {
            setIsPlaying(false);
          }
        },
      },
    });
  }, []);

  const play = useCallback(() => {
    if (!window.YT?.Player) {
      // API not ready yet — set up the callback and wait
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };
      return;
    }
    if (playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    } else {
      initPlayer();
    }
  }, [initPlayer]);

  const stop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stopVideo();
      setIsPlaying(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  return { containerRef, isPlaying, play, stop };
}

function useBellYouTubePlayer() {
  const playerRef = useRef<{
    playVideo: () => void;
    stopVideo: () => void;
    destroy: () => void;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const readyRef = useRef(false);

  // YT IFrame API script only needs to be loaded once — no-op if already present
  useEffect(() => {
    if (document.getElementById("yt-iframe-api")) return;
    const tag = document.createElement("script");
    tag.id = "yt-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  const initPlayer = useCallback(() => {
    if (playerRef.current || !containerRef.current) return;
    const div = document.createElement("div");
    div.id = "yt-bell-player-inner";
    containerRef.current.appendChild(div);

    playerRef.current = new window.YT.Player("yt-bell-player-inner", {
      videoId: YT_BELL_VIDEO_ID,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          readyRef.current = true;
          e.target.playVideo();
          setIsPlaying(true);
        },
        onStateChange: (e) => {
          // YT.PlayerState.ENDED = 0
          if (e.data === 0) {
            setIsPlaying(false);
          }
        },
      },
    });
  }, []);

  const play = useCallback(() => {
    if (!window.YT?.Player) {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };
      return;
    }
    if (playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    } else {
      initPlayer();
    }
  }, [initPlayer]);

  const stop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stopVideo();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  return {
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    isPlaying,
    play,
    stop,
  };
}

// ── Main App ──────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPumpkin, setShowPumpkin] = useState(false);
  const [showBellModal, setShowBellModal] = useState(false);

  const {
    containerRef: ytContainerRef,
    isPlaying,
    play: playYT,
    stop: stopYT,
  } = useYouTubePlayer();

  const {
    containerRef: bellYtContainerRef,
    isPlaying: isBellPlaying,
    play: playBellYT,
    stop: stopBellYT,
  } = useBellYouTubePlayer();

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

  const handleCpuClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPlaying) {
        // Second click: stop the song
        stopYT();
      } else {
        // First click: trigger rose easter egg + play song
        setShowPumpkin(true);
        playYT();
      }
    },
    [isPlaying, playYT, stopYT],
  );

  const handleBellClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isBellPlaying || showBellModal) {
        stopBellYT();
        setShowBellModal(false);
      } else {
        setShowBellModal(true);
        playBellYT();
      }
    },
    [isBellPlaying, showBellModal, playBellYT, stopBellYT],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden YouTube player container (CPU easter egg) */}
      <div
        ref={ytContainerRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "1px",
          height: "1px",
          overflow: "hidden",
          pointerEvents: "none",
          opacity: 0,
          zIndex: -1,
        }}
        aria-hidden="true"
      />

      {/* Hidden YouTube player container (Bell song) */}
      <div
        ref={bellYtContainerRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "1px",
          height: "1px",
          overflow: "hidden",
          pointerEvents: "none",
          opacity: 0,
          zIndex: -1,
        }}
        aria-hidden="true"
      />

      {/* Easter egg overlay */}
      <AnimatePresence>
        {showPumpkin && <RoseEasterEgg onDone={() => setShowPumpkin(false)} />}
      </AnimatePresence>

      {/* Bell modal overlay */}
      <AnimatePresence>
        {showBellModal && (
          <BellModal
            onClose={() => {
              stopBellYT();
              setShowBellModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-circuit-card-border">
        {/* Header marquee strip */}
        <MarqueeStrip />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center h-14 gap-3">
            {/* CPU icon: first click = easter egg + play; second click = stop song */}
            <div className="flex items-center gap-2 flex-shrink-0 mr-2">
              <button
                type="button"
                onClick={handleCpuClick}
                className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors ${
                  isPlaying
                    ? "bg-circuit-accent/30 border-circuit-accent animate-pulse"
                    : "bg-circuit-accent/10 border-circuit-accent/40 hover:bg-circuit-accent/25"
                }`}
                aria-label={isPlaying ? "Stop song" : "Easter egg"}
                title={isPlaying ? "Click to stop the song" : ""}
                data-ocid="header.cpu.easter_egg"
              >
                <Cpu className="h-4 w-4 text-circuit-accent" />
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("dashboard")}
                className="hidden sm:flex items-baseline gap-0.5"
                data-ocid="header.dashboard.link"
              >
                <span className="font-sans font-bold text-sm tracking-tight text-foreground uppercase">
                  Circuit Calculator
                </span>
                <span className="font-sans font-bold text-sm tracking-tight text-circuit-accent uppercase ml-1">
                  Pro
                </span>
              </button>
              {/* Mathu.xyzz branding */}
              <span
                className="hidden sm:inline-block ml-3 font-mono font-black text-sm tracking-widest uppercase"
                style={{
                  color: "#00e5ff",
                  textShadow: "0 0 8px #00e5ff, 0 0 18px #00bcd4",
                  letterSpacing: "0.18em",
                }}
              >
                Mathu.xyzz
              </span>
            </div>

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
                onClick={handleBellClick}
                className={`relative w-8 h-8 rounded-md bg-card border flex items-center justify-center transition-all ${
                  isBellPlaying
                    ? "border-circuit-accent text-circuit-accent animate-pulse bg-circuit-accent/10"
                    : "border-circuit-card-border text-circuit-muted hover:text-circuit-accent hover:border-circuit-accent"
                }`}
                aria-label="Notifications"
                data-ocid="header.bell.button"
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
    </div>
  );
}

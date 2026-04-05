interface CircuitSVGProps {
  className?: string;
}

export function CircuitSVG({ className = "" }: CircuitSVGProps) {
  return (
    <svg
      viewBox="0 0 380 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer loop lines */}
      {/* Top wire */}
      <line
        x1="40"
        y1="40"
        x2="340"
        y2="40"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      {/* Bottom wire */}
      <line
        x1="40"
        y1="180"
        x2="340"
        y2="180"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      {/* Left wire */}
      <line
        x1="40"
        y1="40"
        x2="40"
        y2="180"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      {/* Right wire */}
      <line
        x1="340"
        y1="40"
        x2="340"
        y2="180"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />

      {/* Resistor symbol on top wire (center ~170-210) */}
      {/* Wire to resistor */}
      <line
        x1="40"
        y1="40"
        x2="130"
        y2="40"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <line
        x1="250"
        y1="40"
        x2="340"
        y2="40"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      {/* Resistor rectangle */}
      <rect
        x="130"
        y="30"
        width="120"
        height="20"
        rx="2"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.9"
        fill="none"
      />
      {/* Internal zigzag lines */}
      <polyline
        points="140,40 148,32 156,48 164,32 172,48 180,32 188,48 196,32 204,48 210,40"
        stroke="#22B3FF"
        strokeWidth="1.2"
        strokeOpacity="0.7"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Label */}
      <text
        x="190"
        y="22"
        textAnchor="middle"
        fill="#22B3FF"
        fillOpacity="0.7"
        fontSize="11"
        fontFamily="monospace"
      >
        R
      </text>

      {/* Capacitor symbol on left wire */}
      {/* Wire to cap */}
      <line
        x1="40"
        y1="40"
        x2="40"
        y2="95"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <line
        x1="40"
        y1="125"
        x2="40"
        y2="180"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      {/* Capacitor plates */}
      <line
        x1="20"
        y1="105"
        x2="60"
        y2="105"
        stroke="#22B3FF"
        strokeWidth="2"
        strokeOpacity="0.9"
      />
      <line
        x1="20"
        y1="115"
        x2="60"
        y2="115"
        stroke="#22B3FF"
        strokeWidth="2"
        strokeOpacity="0.9"
      />
      {/* Label */}
      <text
        x="68"
        y="114"
        fill="#22B3FF"
        fillOpacity="0.7"
        fontSize="11"
        fontFamily="monospace"
      >
        C
      </text>

      {/* Inductor symbol on right wire */}
      {/* Wire to inductor */}
      <line
        x1="340"
        y1="40"
        x2="340"
        y2="80"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <line
        x1="340"
        y1="140"
        x2="340"
        y2="180"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      {/* Inductor coils */}
      <path
        d="M340,80 Q328,80 328,90 Q328,100 340,100 Q352,100 352,110 Q352,120 340,120 Q328,120 328,130 Q328,140 340,140"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.9"
        fill="none"
      />
      {/* Label */}
      <text
        x="358"
        y="114"
        fill="#22B3FF"
        fillOpacity="0.7"
        fontSize="11"
        fontFamily="monospace"
      >
        L
      </text>

      {/* Voltage source on bottom wire */}
      {/* Wire to source */}
      <line
        x1="40"
        y1="180"
        x2="155"
        y2="180"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <line
        x1="225"
        y1="180"
        x2="340"
        y2="180"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      {/* Battery/source circle */}
      <circle
        cx="190"
        cy="180"
        r="22"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
        fill="none"
      />
      {/* +/- symbols */}
      <text
        x="183"
        y="185"
        fill="#22B3FF"
        fillOpacity="0.8"
        fontSize="14"
        fontFamily="monospace"
      >
        V
      </text>
      {/* Label */}
      <text
        x="190"
        y="215"
        textAnchor="middle"
        fill="#22B3FF"
        fillOpacity="0.6"
        fontSize="10"
        fontFamily="monospace"
      >
        CIRCUIT
      </text>

      {/* Node dots */}
      <circle cx="40" cy="40" r="3" fill="#22B3FF" fillOpacity="0.7" />
      <circle cx="340" cy="40" r="3" fill="#22B3FF" fillOpacity="0.7" />
      <circle cx="40" cy="180" r="3" fill="#22B3FF" fillOpacity="0.7" />
      <circle cx="340" cy="180" r="3" fill="#22B3FF" fillOpacity="0.7" />

      {/* Ground symbol at bottom center */}
      <line
        x1="190"
        y1="202"
        x2="190"
        y2="210"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      <line
        x1="178"
        y1="210"
        x2="202"
        y2="210"
        stroke="#22B3FF"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      <line
        x1="182"
        y1="213"
        x2="198"
        y2="213"
        stroke="#22B3FF"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <line
        x1="186"
        y1="216"
        x2="194"
        y2="216"
        stroke="#22B3FF"
        strokeWidth="0.8"
        strokeOpacity="0.3"
      />
    </svg>
  );
}

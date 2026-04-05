interface UnitPillsProps {
  units: string[];
  selected: string;
  onChange: (unit: string) => void;
  disabled?: boolean;
}

export function UnitPills({
  units,
  selected,
  onChange,
  disabled = false,
}: UnitPillsProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {units.map((unit) => (
        <button
          key={unit}
          type="button"
          disabled={disabled}
          onClick={() => onChange(unit)}
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer ${
            selected === unit
              ? "bg-circuit-accent text-white border-circuit-accent accent-glow-sm"
              : "bg-transparent text-circuit-muted border-circuit-card-border hover:border-circuit-accent hover:text-circuit-accent"
          }`}
        >
          {unit}
        </button>
      ))}
    </div>
  );
}

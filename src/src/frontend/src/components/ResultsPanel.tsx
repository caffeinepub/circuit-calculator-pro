import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export interface CalculationResult {
  label: string;
  value: string;
  unit: string;
  formula: string;
}

interface ResultsPanelProps {
  result: CalculationResult | null;
  steps: string[];
  error: string | null;
  isLoading: boolean;
}

export function ResultsPanel({
  result,
  steps,
  error,
  isLoading,
}: ResultsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Result Card */}
      <Card className="bg-card border-circuit-card-border shadow-card-dark">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-circuit-muted uppercase tracking-wider">
            Result
          </CardTitle>
        </CardHeader>
        <CardContent data-ocid="calc.result.card">
          {isLoading && (
            <div className="space-y-2" data-ocid="calc.loading_state">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {error && !isLoading && (
            <AnimatePresence mode="wait">
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 text-destructive"
                data-ocid="calc.error_state"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            </AnimatePresence>
          )}

          {result && !isLoading && !error && (
            <AnimatePresence mode="wait">
              <motion.div
                key={result.value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                data-ocid="calc.success_state"
              >
                <div className="flex items-baseline gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-circuit-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-circuit-muted mb-1">
                      {result.label}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-3xl font-bold text-circuit-accent">
                        {result.value}
                      </span>
                      <span className="font-mono text-lg text-circuit-muted">
                        {result.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-circuit-input rounded-lg px-3 py-2 border border-circuit-card-border">
                  <p className="text-xs text-circuit-muted mb-1">
                    Formula used
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {result.formula}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {!result && !isLoading && !error && (
            <p className="text-sm text-circuit-muted italic">
              Enter values and click Calculate
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step-by-Step Solution */}
      {(steps.length > 0 || isLoading) && (
        <Card className="bg-card border-circuit-card-border shadow-card-dark">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-circuit-muted uppercase tracking-wider">
              Step-by-Step Solution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2" data-ocid="calc.steps.loading_state">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            )}
            {!isLoading && steps.length > 0 && (
              <motion.ol
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 list-none"
              >
                {steps.map((step, i) => (
                  <motion.li
                    key={`step-${i}-${step.slice(0, 20)}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className="flex gap-3 items-start"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-circuit-accent/10 border border-circuit-accent/30 text-circuit-accent text-xs flex items-center justify-center font-mono font-semibold">
                      {i + 1}
                    </span>
                    <span className="font-mono text-sm text-foreground/85 leading-5">
                      {step}
                    </span>
                  </motion.li>
                ))}
              </motion.ol>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

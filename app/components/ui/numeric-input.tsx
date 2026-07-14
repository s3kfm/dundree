import { LucideMinus, LucidePlus } from "lucide-react";
import { SyntheticEvent, useEffect, useRef } from "react";
import { NumberInput, NumberInputProps } from "rsuite";

export default function NumericInput(props: NumberInputProps) {
  const { min, max, disabled, value } = props;

  // Ref to track the interval ID for cleanup
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync props to a Ref to avoid stale closures in the interval
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // Clean up timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAdjust = (direction: number, event: SyntheticEvent) => {
    const p = propsRef.current;
    const currentVal = Number(p.value ?? 0);
    const newValue = currentVal + direction;

    // Guard against null/undefined if necessary
    if (p.value === undefined || p.value === null) return;

    // Check boundaries and stop timer if we hit them
    if (direction > 0 && p.max !== undefined && newValue > Number(p.max)) {
      return stopTimer();
    }
    if (direction < 0 && p.min !== undefined && newValue < Number(p.min)) {
      return stopTimer();
    }

    p.onChange?.(newValue, event);
  };

  const startTimer = (direction: number, event: React.MouseEvent) => {
    stopTimer();
    handleAdjust(direction, event);

    timerRef.current = setInterval(() => {
      handleAdjust(direction, event);
    }, 150); // 150ms provides a smooth, responsive feel
  };

  return (
    <div className="flex gap-2 items-center justify-between border border-base-300 rounded-lg p-2 bg-base-100">
      {/* Decrease Button */}
      <button
        className="btn btn-circle btn-sm btn-ghost"
        type="button"
        disabled={disabled || (min !== undefined && Number(value) <= min)}
        onMouseDown={(e) => startTimer(-1, e)}
        onMouseUp={stopTimer}
        onMouseLeave={stopTimer}
      >
        <LucideMinus size={16} />
      </button>

      <NumberInput
        {...props}
        readOnly
        plaintext
        controls={false}
        className="text-center"
      />

      {/* Increase Button */}
      <button
        className="btn btn-circle btn-sm btn-ghost"
        type="button"
        disabled={disabled || (max !== undefined && Number(value) >= max)}
        onMouseDown={(e) => startTimer(1, e)}
        onMouseUp={stopTimer}
        onMouseLeave={stopTimer}
      >
        <LucidePlus size={16} />
      </button>
    </div>
  );
}

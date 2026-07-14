import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * DiceRoller Component
 * @param {number|null|undefined} value - The final number to display (1-20).
 * If null, undefined, or 0, shows a blank/placeholder state.
 */
export const DiceRoller = ({
  value,
  onRollComplete,
}: {
  value?: number | null;
  onRollComplete?: () => void;
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isRolling, setIsRolling] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    // Only trigger the roll animation if we have a valid target value
    if (value && value !== prevValueRef.current) {
      triggerRoll();
    } else if (!value) {
      // If value is cleared to null/undefined, update display immediately
      setDisplayValue(null);
    }
    prevValueRef.current = value;
  }, [value]);

  const triggerRoll = () => {
    setIsRolling(true);

    let iterations = 0;
    const maxIterations = 12;

    const interval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 20) + 1);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        setDisplayValue(value);
        setIsRolling(false);
        // Call the callback when roll is complete
        onRollComplete?.();
      }
    }, 60);
  };

  // Helper to determine if we should show a number or placeholder
  const hasValue =
    displayValue !== null && displayValue !== undefined && displayValue !== 0;

  return (
    <div className="relative flex flex-col items-center justify-center my-1">
      <motion.div
        animate={
          isRolling
            ? {
                rotate: [0, 120, -120, 240, 0],
                scale: [1, 1.15, 0.95, 1.05, 1],
                y: [0, -30, 15, -10, 0],
              }
            : { rotate: 0, scale: 1, y: 0 }
        }
        transition={{ duration: 0.8, ease: "backOut" }}
        className="relative"
      >
        {/* Icosahedron SVG */}
        <svg
          viewBox="0 0 100 100"
          className={`w-40 h-40 drop-shadow-2xl transition-colors duration-500 ${
            !hasValue
              ? "text-slate-700"
              : displayValue === 20
                ? "text-amber-400"
                : displayValue === 1
                  ? "text-red-500"
                  : "text-indigo-500"
          }`}
        >
          <path
            fill="currentColor"
            d="M50 2 L95 25 L95 75 L50 98 L5 75 L5 25 Z"
            className="stroke-white/10 stroke-1"
          />
          <path
            fill="rgba(255,255,255,0.05)"
            d="M50 2 L50 98 M50 2 L5 25 M50 2 L95 25 M5 25 L95 25 M5 75 L95 75 M50 98 L5 75 M50 98 L95 75"
          />
        </svg>

        {/* The Number or Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={hasValue ? displayValue : "empty"}
              initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.5, filter: "blur(2px)" }}
              transition={{ duration: 0.1 }}
              className={`text-4xl font-black select-none drop-shadow-md ${
                !hasValue
                  ? "text-slate-500 font-light"
                  : displayValue === 20
                    ? "text-white"
                    : "text-indigo-50"
              }`}
            >
              {hasValue ? displayValue : "?"}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

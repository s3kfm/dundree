import { useRef, useCallback } from "react";

export type BUFFER_MODE = "line" | "period" | "codeblock";

export interface FlushEvent {
  text: string;
  mode: BUFFER_MODE | "final";
}

interface UseStreamingBufferProps {
  onFlush: (event: FlushEvent) => void;
  bufferModes?: BUFFER_MODE[];
}

/**
 * useStreamingBuffer
 * Logic:
 * 1. Accumulates incoming text chunks into a ref buffer.
 * 2. On every push, scans the buffer for triggers based on active bufferModes.
 * 3. Handles codeblocks specially - waits for opening and closing backticks.
 * 4. Flushes content appropriately based on mode and codeblock state.
 */

interface CodeblockState {
  isInCodeblock: boolean;
  backtickCount: number; // 1 for `, 2 for ``, 3 for ```
  startIndex: number;
}

/**
 * Detects if we're entering or exiting a codeblock
 */
function detectCodeblockTransition(
  buffer: string,
  currentState: CodeblockState,
): CodeblockState {
  let i = currentState.startIndex;
  const state = { ...currentState };

  while (i < buffer.length) {
    // Check for backticks
    if (buffer[i] === "`") {
      let backtickCount = 0;
      let j = i;

      // Count consecutive backticks
      while (j < buffer.length && buffer[j] === "`") {
        backtickCount++;
        j++;
      }

      if (!state.isInCodeblock) {
        // Opening a codeblock
        state.isInCodeblock = true;
        state.backtickCount = backtickCount;
        i = j;
      } else if (backtickCount === state.backtickCount) {
        // Closing the codeblock (matching backtick count)
        state.isInCodeblock = false;
        state.backtickCount = 0;
        i = j;
      } else {
        // Different backtick count, keep searching
        i = j;
      }
    } else {
      i++;
    }
  }

  state.startIndex = buffer.length;
  return state;
}

/**
 * Find the opening ``` position in the buffer (the start of the backtick sequence)
 * Returns the index of the first backtick, or -1 if not found.
 */
function findCodeblockOpen(buffer: string): number {
  let i = 0;
  while (i < buffer.length) {
    if (buffer[i] === "`") {
      let count = 0;
      let j = i;
      while (j < buffer.length && buffer[j] === "`") {
        count++;
        j++;
      }
      if (count >= 3) {
        return i;
      }
      i = j;
    } else {
      i++;
    }
  }
  return -1;
}

/**
 * Find the first trigger point in the buffer, respecting codeblock boundaries.
 *
 * New behaviour:
 * - If the buffer contains text BEFORE a ``` opener, flush that text first.
 * - If the buffer starts at (or inside) a ``` block, wait for the closing ```
 *   and flush the whole block (including closing backticks).
 * - Otherwise fall through to line / period detection as before.
 */
function findFlushPoint(
  buffer: string,
  bufferModes: BUFFER_MODE[],
): { index: number; mode: BUFFER_MODE } | null {
  if (bufferModes.includes("codeblock")) {
    const openIdx = findCodeblockOpen(buffer);

    if (openIdx > 0) {
      // There is text BEFORE the opening ```.  Flush that text first.
      return { index: openIdx, mode: "line" };
    }

    if (openIdx === 0) {
      // Buffer starts with ```.  Wait for the matching closing ```.
      // Count the opening backticks.
      let openCount = 0;
      while (openCount < buffer.length && buffer[openCount] === "`") {
        openCount++;
      }

      // Search for the closing sequence after the opener.
      let i = openCount;
      while (i < buffer.length) {
        if (buffer[i] === "`") {
          let count = 0;
          let j = i;
          while (j < buffer.length && buffer[j] === "`") {
            count++;
            j++;
          }
          if (count >= openCount) {
            // Found the closing backticks — flush up to and including them.
            return { index: j, mode: "codeblock" };
          }
          i = j;
        } else {
          i++;
        }
      }

      // Closing ``` not yet received — don't flush yet.
      return null;
    }

    // openIdx === -1: no ``` in buffer at all.
    // Fall through to line / period detection below.
  }

  // If we're inside a codeblock, don't split on line or period
  const currentState = detectCodeblockTransition(buffer, {
    isInCodeblock: false,
    backtickCount: 0,
    startIndex: 0,
  });

  if (currentState.isInCodeblock) {
    // Still inside an open codeblock, don't flush yet
    return null;
  }

  // Check for periods (but not if we're in a codeblock)
  if (bufferModes.includes("period")) {
    const periodIndex = buffer.indexOf(".");
    if (periodIndex !== -1) {
      // Make sure this period isn't inside a codeblock
      const beforePeriod = buffer.substring(0, periodIndex);
      const stateBeforePeriod = detectCodeblockTransition(beforePeriod, {
        isInCodeblock: false,
        backtickCount: 0,
        startIndex: 0,
      });

      if (!stateBeforePeriod.isInCodeblock) {
        return { index: periodIndex + 1, mode: "period" };
      }
    }
  }

  // Check for line breaks (but not if we're in a codeblock)
  if (bufferModes.includes("line")) {
    const lineBreakMatch = buffer.match(/\r\n|\r|\n/);
    if (lineBreakMatch && lineBreakMatch.index !== undefined) {
      // Make sure this line break isn't inside a codeblock
      const beforeBreak = buffer.substring(0, lineBreakMatch.index);
      const stateBeforeBreak = detectCodeblockTransition(beforeBreak, {
        isInCodeblock: false,
        backtickCount: 0,
        startIndex: 0,
      });

      if (!stateBeforeBreak.isInCodeblock) {
        return {
          index: lineBreakMatch.index + lineBreakMatch[0].length,
          mode: "line",
        };
      }
    }
  }

  return null;
}

export function useStreamingBuffer({
  onFlush,
  bufferModes = ["line"],
}: UseStreamingBufferProps) {
  const bufferRef = useRef<string>("");
  const codeblockStateRef = useRef<CodeblockState>({
    isInCodeblock: false,
    backtickCount: 0,
    startIndex: 0,
  });

  const push = useCallback(
    (chunk: string, isFinal = false) => {
      bufferRef.current += chunk;

      // Try to flush as much as possible
      while (true) {
        const flushPoint = findFlushPoint(
          bufferRef.current,
          bufferModes,
          codeblockStateRef.current,
        );

        if (flushPoint) {
          const textToFlush = bufferRef.current.substring(0, flushPoint.index);
          bufferRef.current = bufferRef.current.substring(flushPoint.index);

          // Reset codeblock state after flush
          codeblockStateRef.current = {
            isInCodeblock: false,
            backtickCount: 0,
            startIndex: 0,
          };

          onFlush({ text: textToFlush, mode: flushPoint.mode });
        } else {
          break;
        }
      }

      // If this is the final chunk, flush everything remaining
      if (isFinal && bufferRef.current.length > 0) {
        const remaining = bufferRef.current;
        bufferRef.current = "";
        codeblockStateRef.current = {
          isInCodeblock: false,
          backtickCount: 0,
          startIndex: 0,
        };
        onFlush({ text: remaining, mode: "final" });
      }
    },
    [bufferModes, onFlush],
  );

  /**
   * end / dump / flush — call this when the chat stream ends (e.g. status
   * changes away from "streaming") to flush whatever is still sitting in the
   * buffer.  Any remaining text is emitted with mode "final".
   */
  const end = useCallback(() => {
    if (bufferRef.current.length > 0) {
      const remaining = bufferRef.current;
      bufferRef.current = "";
      codeblockStateRef.current = {
        isInCodeblock: false,
        backtickCount: 0,
        startIndex: 0,
      };
      onFlush({ text: remaining, mode: "final" });
    }
  }, [onFlush]);

  const reset = useCallback(() => {
    bufferRef.current = "";
    codeblockStateRef.current = {
      isInCodeblock: false,
      backtickCount: 0,
      startIndex: 0,
    };
  }, []);

  return { push, end, dump: end, flush: end, reset };
}

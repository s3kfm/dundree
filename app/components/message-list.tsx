"use client";

import MessageRenderer from "./message-renderer";
import { UIMessage } from "@ai-sdk/react";
import { motion, AnimatePresence } from "motion/react";

interface MessageListProps {
  messages: UIMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  // Find the last assistant message
  const assistantMessages = messages.filter((msg) => msg.role === "assistant");
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];

  return (
    <AnimatePresence mode="wait">
      {lastAssistantMessage && (
        <motion.div
          key={lastAssistantMessage.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <MessageRenderer
            id={lastAssistantMessage.id}
            last={true}
            message={lastAssistantMessage}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

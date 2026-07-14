import { Play, StopCircle, FileText, RefreshCw } from "lucide-react";
import { useGameContext } from "./game-context-provider";
import { UIMessage } from "@ai-sdk/react";
import { Streamdown } from "streamdown";
import { useMemo, useState } from "react";
import "streamdown/styles.css";

export default function MessageRenderer({
  message,
  last,
  id,
}: {
  id: string;
  message: UIMessage;
  last: boolean;
}) {
  const {
    narratingId,
    narrate,
    stopNarration,
    chat: { status, regenerate },
  } = useGameContext();

  const [showMarkdown, setShowMarkdown] = useState(false);

  // Extract text content from message parts
  const content = useMemo(() => {
    const textParts = message.parts.filter((part) => part.type === "text");
    return textParts.map((part) => part.text).join(" ");
  }, [message.parts]);

  const onNarrate = async () => {
    if (narratingId === id) {
      stopNarration();
    } else {
      narrate(id);
    }
  };

  return (
    <div className="message-tree py-2 ">
      <div className="flex justify-end gap-2">
        <button
          className="btn btn-accent btn-xs "
          disabled={status !== "ready"}
          onClick={onNarrate}
        >
          {narratingId === id ? (
            <StopCircle className="size-3" />
          ) : (
            <Play className="size-3" />
          )}{" "}
          Narrate
        </button>
        <button
          className="btn btn-secondary btn-xs"
          onClick={() => regenerate()}
        >
          Regenerate
        </button>
        {process.env.NEXT_PUBLIC_ENVIRONMENT === "development" ? (
          <button
            className="btn btn-secondary btn-xs"
            onClick={() => setShowMarkdown(!showMarkdown)}
          >
            <FileText className="size-3" />
            {showMarkdown ? "Hide" : "See"} Markdown
          </button>
        ) : (
          ""
        )}
      </div>
      <div className="px-4 mt-2">
        {showMarkdown ? (
          <pre className="bg-base-100 p-4 rounded-md overflow-x-auto text-sm">
            {content}
          </pre>
        ) : (
          <Streamdown
            animated={{ animation: "blurIn" }}
            isAnimating={status === "streaming"}
            components={{
              code: ({ children, className }) => {
                // Hide custom code blocks for now

                //console.log(className);
                if (className === "language-npc") {
                  //console.log(children);
                }
                if (className === "language-dialog") {
                  if (typeof children !== "string") {
                    return <></>;
                  }
                  try {
                    const json = JSON.parse(children);
                    return (
                      <div className="relative px-4 py-3 rounded-xl shadow-xl bg-base-300 opacity-90 rounded border-l border-l-primary/80">
                        <small className="text-primary">{json.name}</small>

                        <div>
                          <span className="text-2xl">&ldquo;</span>
                          {json.text}
                          <span className="text-2xl">&rdquo;</span>
                        </div>
                      </div>
                    );
                  } catch (e) {
                    return <></>;
                  }
                }
                // Render normal code blocks
                return <></>;
              },
            }}
          >
            {content}
          </Streamdown>
        )}
      </div>
    </div>
  );
}

import { convertToModelMessages, streamText, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { getById } from "@/db/models";
import { characters, gameMessagesTable, gamesTable } from "@/db/schema";
import { v4 } from "uuid";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const newMessageId = v4();

  const game = await getById(gamesTable, id);

  const modelMessages = await convertToModelMessages(messages);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const charactersList = await db
    .select()
    .from(characters)
    .where(eq(characters.gameId, id));

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),

    // tools: {
    //   rollD20: {
    //     execute: async () => {
    //       const roll = Math.floor(Math.random() * 20) + 1;
    //       return { roll };
    //     },
    //     description:
    //       "Roll a 20-sided die (d20) for skill checks, attacks, or saving throws. This tool will be executed in the browser and display an animated dice roll to the player.",
    //     inputSchema: z.object({
    //       reason: z
    //         .string()
    //         .describe(
    //           "The reason for rolling the die (e.g., 'Strength check to lift the boulder', 'Dexterity saving throw', 'Perception check to spot traps')",
    //         ),
    //       characterName: z
    //         .string()
    //         .optional()
    //         .describe("The name of the character rolling the die"),
    //       difficulty: z
    //         .number()
    //         .optional()
    //         .describe(
    //           "The difficulty class (DC) for the roll, if applicable (1-30)",
    //         ),
    //     }),
    //   },
    // },
    system: `
### SYSTEM MISSION: THE MARKDOWN ENGINE
You are a high-fidelity Game Engine and Dungeon Master. You do not converse as an AI; you generate structured Markdown blocks and plain text narration to drive a game UI.

### CORE PROTOCOLS
* NO CONVERSATION: Never provide introductions, greetings, or meta-commentary like "Sure, here is the scene."
* PLAIN NARRATION: Atmospheric descriptions are delivered as raw text. No bolding, no italics, no headings, no markdown symbols. This is intended for voice output.
* STRUCTURED DATA: Use only the specific code block identifiers defined below.



### OUTPUT FLOW & SCHEMAS

1. INITIAL NARRATION
The response must start with 2-3 lines of plain text acknowledging the player's input and describing the immediate sensory reaction. Break subsequent narration into 3-4 second chunks.

2. THE HIDDEN BLOCK
Delivered after the initial narration.
\`\`\`hidden
[AI THINKING PROCESS: Reference stats, calculate DND 5e DC, and plan world reactions.]
\`\`\`

3. NPC DISCOVERY
Use only when a new character enters the scene.
\`\`\`npc
{"id": "unique_id", "name": "Name", voice_id: "aura-2", "history": "Background"}
\`\`\`


4. DIALOGUE
For NPC speech. The prompt field describes the delivery or stage direction (e.g. "He sighs" or "He says to you"). Use the same voice as discovery
\`\`\`dialog
{"npc_id": "unique_id", voice_id: "aura-2-..": "Name", "prompt": "How it is said", "text": "What is said"}
\`\`\`


Available Voices for NPCS:

aura-2-draco-en, British: Warm, approachable, trustworthy Baritone. (Best for: Storytelling, fantasy NPCs)

aura-2-athena-en, American: Calm, smooth, professional, Mature. (Best for: World narration, instructions)

aura-2-janus-en, American (Southern): Southern, smooth, trustworthy. (Best for: Character-rich storytelling)

aura-2-pluto-en, American: Smooth, calm, empathetic, Baritone. (Best for: Emotional or deep dialogue)

aura-2-cora-en, American: Smooth, melodic, caring. (Best for: Storytelling, soft narration)

aura-2-cordelia-en, American: Approachable, warm, polite, Young Adult. (Best for: Narrative assistants)

aura-2-zeus-en, American: Deep, trustworthy, smooth. (Best for: Formal UI, authority figures)

aura-2-orpheus-en, American: Professional, clear, confident, trustworthy. (Best for: Customer service, technical help)

aura-2-callista-en, American: Clear, energetic, professional, smooth. (Best for: Business assistants, IVR)

aura-2-hera-en, American: Smooth, warm, professional. (Best for: Informative walkthroughs)

aura-2-asteria-en, American: Clear, confident, knowledgeable, energetic. (Best for: Tutorials, advertising)

aura-2-hermes-en, American: Expressive, engaging, professional. (Best for: Informative guides)

aura-2-apollo-en, American: Confident, comfortable, casual. (Best for: Peer-to-peer chat)

aura-2-aurora-en, American: Cheerful, expressive, energetic. (Best for: Social apps, coaching)

aura-2-helena-en, American: Caring, natural, positive, raspy. (Best for: High-warmth casual chat)

aura-2-luna-en, American: Friendly, natural, engaging, Young Adult. (Best for: General assistance)

aura-2-aries-en, American: Warm, energetic, caring. (Best for: Supportive companions)

aura-2-delia-en, American: Casual, friendly, cheerful, breathy, Young Adult. (Best for: Interviews, vlogging vibes)

aura-2-amalthea-en, Filipino: Engaging, natural, cheerful, Young Adult. (Best for: Friendly global chat)

aura-2-hyperion-en, Australian: Caring, warm, empathetic. (Best for: Supportive interviews)

aura-2-theia-en, Australian: Expressive, polite, sincere. (Best for: Informative content)

aura-2-pandora-en, British: Smooth, calm, melodic, breathy. (Best for: Knowledgeable assistants)


5. PLAYER INPUT REQUEST
At the end of each message, decide which player character goes next. If a conversation with one player exceeds 4 messages, rotate to a different player. Always end the message with this block.
\`\`\`response
{"name": "Player Name", "id": "character_id", "type": "text"}
\`\`\`
*(Use {"type": "dice"} for D&D 5e skill checks or attacks.)*

### INTERACTION RULES
* NO INTER-PLAYER ACTIONS: Do not generate interactions between players, narrate player-on-player activity, or generate dialogue on behalf of players.
* DICE LOGIC: When type: dice is sent, the next user input is the roll result. Use your hidden block in the following turn to determine success/failure based on that value using DND 5e rules.
* 
### PLAYER DATA (CONTEXT)
${charactersList
  .map(
    (char) => `
ID: ${char.id || char.name.toLowerCase().replace(/\s/g, "_")}
Name: ${char.name}
Pronouns: ${char.pronoun || "they/them"}
Stats: STR:${char.strength}, DEX:${char.dexterity}, CON:${char.constitution}, INT:${char.intelligence}, WIS:${char.wisdom}, CHA:${char.charisma}
`,
  )
  .join("\n")}

### WORLD SETTING
${game.setting}

### CURRENT TASK
Evaluate the user's input against their character stats and the world setting. Generate the next logical <game_update> packet.`,
    messages: modelMessages,

    onFinish: async (result) => {
      const lastUserMessage = modelMessages.at(-1);
      const lastUserMessageUI = messages.at(-1);

      // Extract text from the last message content
      let messageText = "";
      const lastMessageContent = lastUserMessage?.content;

      if (typeof lastMessageContent === "string") {
        messageText = lastMessageContent;
      } else if (Array.isArray(lastMessageContent)) {
        const textPart = lastMessageContent.find(
          (part) =>
            typeof part === "object" &&
            part !== null &&
            "text" in part &&
            typeof part.text === "string",
        );
        if (textPart && "text" in textPart) {
          messageText = textPart.text;
        }
      }
      await db
        .update(gamesTable)
        .set({ status: "active" })
        .where(eq(gamesTable.id, id));

      await db
        .insert(gameMessagesTable)
        .values([
          {
            id: lastUserMessageUI?.id,
            message: messageText,
            role: lastUserMessage?.role ?? "user",
            gameId: id,
          },
        ])
        .onConflictDoNothing();
      await db
        .insert(gameMessagesTable)
        .values({
          id: newMessageId,
          message: result.text,
          role: "assistant",
          gameId: id,
        })
        .onConflictDoUpdate({
          target: gameMessagesTable.id,
          set: {
            message: result.text,
          },
        });
    },
  });

  return result.toUIMessageStreamResponse({
    generateMessageId: () => newMessageId,
  });
}

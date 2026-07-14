"use client";

import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { GameFormValues } from "@/types";
import { gameFormSchema } from "@/validators/game";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useEffect, useMemo, useState } from "react";
import { Streamdown } from "streamdown";
import { LucideCheck } from "lucide-react";
export default function GameForm({
  onSuccess,
}: {
  onSuccess?: (data: { id: number | string }) => void;
}) {
  const router = useRouter();


  const mutation = useMutation({
    mutationFn: async (values: GameFormValues) => {
      const response = await axios.post("/api/games", values);
      return response.data;
    },
    onSuccess: (data) => {
      if (onSuccess) onSuccess?.call(null, data);
      else router.push(`/games/${data.id}`);
      console.log("Form submitted successfully:", data);
      formik.resetForm();
    },
    onError: (error) => {
      console.error("Form submission error:", error);
    },
  });

  const [instructions, setInstructions] = useState("");
  // Formik setup
  const formik = useFormik<GameFormValues>({
    initialValues: {
      theme: "",
      setting: "",
      summary: "",
      history: [],
      name: "",
    },
    validationSchema: gameFormSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });
    const { messages, sendMessage, status } = useChat({
    onData: (message) => {
      console.log(message);
    },
    onFinish: ({ message }) => {
      console.log(message);
      const settingText=message.parts.map((part) => part.type === "text" ? part.text : "").join("\n").trim()
      formik.setFieldValue("setting", settingText);
    //  formik.setFieldValue("name", settingText.split("\n")[0]);

    },
    transport: new DefaultChatTransport({
      api: `/api/games/generate-setting`,
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const generateSetting = async () => {
    const isInstructionsPresent =
      instructions && instructions.trim().length > 0;
    await sendMessage({
      role: "user",
      parts: [
        {
          type: "text",
          text: `Theme: ${formik.values.theme}\n ${isInstructionsPresent ? `Instructions: ${instructions}` : ""}`,
        },
      ],
    });
    setInstructions("");
  };

  const themes = [
    "Fantasy",
    "Scifi/Space",
    "Cyberpunk",
    "Real Life",
    "Medieval",
  ];

  const lastAssistantMessage = useMemo(()=>{
    return messages
    .filter((msg) => msg.role === "assistant")
    .at(-1);
  },[messages])
  
  const extractedText= useMemo(()=> {
    return lastAssistantMessage?.parts.map((part) => part.type === "text" ? part.text : "").join("\n").trim()|| ""
  }, [lastAssistantMessage])

const gameName = useMemo(() => {
  if (!extractedText) return ""

  const firstBreak = extractedText.indexOf('\n')
  if (firstBreak === -1) return ""

  return  extractedText.slice(0, firstBreak).trim().replace(/^#+\s*/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim()
}, [extractedText])

useEffect(()=>{
  formik.setFieldValue("name", gameName)
}, [gameName])
  const settingsText  = useMemo(()=> {
    return extractedText.split('\n').slice(1).join('\n')
  }, [extractedText])
  

  const { values } = formik;
  const isFormReady =
    values.setting &&
    values.setting.trim().length > 0 &&
    values.theme &&
    values.theme.trim().length > 0;

    useEffect(()=>{}, [extractedText])
  return (
    <form onSubmit={formik.handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <label htmlFor="theme" className="block text-sm font-medium ">
          Select a theme by clicking on one of the options below
        </label>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => formik.setFieldValue("theme", theme)}
              className={`rounded-lg px-4 py-2 font-medium transition-all ${
                formik.values.theme === theme
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                  : "border border-zinc-300 bg-white text-zinc-900 hover:border-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:border-purple-500"
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
        <label
          htmlFor="suggestions"
          className="label block text-sm font-medium"
        >
          Suggestions
        </label>
        <input
          id="suggestions"
          type="text"
          className="input block w-full"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Enter any instructions or suggestions you have for the setting"
        />
        <div className=" sticky top-2">
        <div className="flex justify-between">
          <button
            className={`btn ${isFormReady ? "btn-secondary" : "btn-primary"}`}
            type="button"
            disabled={!values.theme || status !== "ready"}
            onClick={generateSetting}
          >
           {values.setting ? "Regenerate" : "Generate"} Setting
          </button>
          <button
            className={`btn ${mutation.isSuccess ? "btn-success" : "btn-primary"}`}
            type="submit"
            disabled={!isFormReady || status !== "ready" || mutation.isPending|| mutation.isSuccess}
          >
            Create Game
            {mutation.isPending && <div className="loader loader-sm"></div> }
            {mutation.isSuccess && <LucideCheck/> }
          </button>
        </div>
        </div>
      </div>
      {values.theme && settingsText && (
        <div className="space-y-2">
          <div className="">
            <label htmlFor="name" className="block text-sm font-medium ">
              Game Name
            </label>
            <input className="input w-full" id="name" value={values.name} onChange={(e) => formik.setFieldValue("name", e.target.value)} />

          </div>
          <div className="border p-1 rounded block w-full break-words overflow-x-hidden">
            <Streamdown>
              {settingsText}
            </Streamdown>
          </div>
        </div>
      )}

      {mutation.isSuccess && (
        <div className="rounded-lg bg-green-100 p-4 text-green-800 dark:bg-green-900 dark:text-green-200">
          Game created successfully!
        </div>
      )}

      {mutation.isError && (
        <div className="rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
          Error creating game. Please try again.
        </div>
      )}
    </form>
  );
}

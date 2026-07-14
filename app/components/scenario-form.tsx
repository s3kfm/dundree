"use client";

import React, { useState } from "react";
import { useFormik, FormikProvider } from "formik";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ScenarioFormValues } from "@/types";
import { createScenarioSchema } from "@/validators/scenario";
import { useRouter } from "next/navigation";
import {
  LucideCheck,
  LucidePlus,
  LucideRocket,
  LucideSparkles,
  LucideCastle,
  LucideZap,
  LucideBuilding2,
  LucideHistory,
  LucideUser,
  LucideClock,
  LucidePlusCircle,
  LucideMapPin,
  LucideGavel,
  LucideX,
  LucideUpload,
  LucideReceiptRussianRuble,
  CornerDownLeft,
} from "lucide-react";
import ImageUploadWidget from "./upload-widget";
import { useAsset } from "../hooks/use-asset";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const THEMES = [
  { id: "fantasy", label: "Fantasy", icon: LucideCastle },
  { id: "sci-fi", label: "Sci-Fi", icon: LucideRocket },
  { id: "cyberpunk", label: "Cyberpunk", icon: LucideZap },
  { id: "urban-fantasy", label: "Urban Fan.", icon: LucideBuilding2 },
  { id: "mythology", label: "Mythology", icon: LucideHistory },
  { id: "contemporary", label: "Contemp.", icon: LucideClock },
];

export default function ScenarioForm({
  initialValues,
  onSuccess,
}: {
  initialValues?: Partial<ScenarioFormValues>;
  onSuccess?: (data: { id: string }) => void;
}) {
  const router = useRouter();

  // Determine if this is an update or create based on initialValues.id
  const isUpdate = !!initialValues?.id;

  const mutation = useMutation({
    mutationFn: async (values: ScenarioFormValues) => {
      if (isUpdate) {
        // PUT request for update
        const response = await axios.put(
          `/api/scenarios/${initialValues.id}`,
          values,
        );
        return response.data;
      } else {
        // POST request for create
        const response = await axios.post("/api/scenarios", values);
        return response.data;
      }
    },
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data);
      } else {
        router.push("/scenarios");
      }
      console.log("Form submitted successfully:", data);
    },
    onError: (error) => {
      console.error("Form submission error:", error);
    },
  });

  // Formik setup
  const formik = useFormik<ScenarioFormValues>({
    initialValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      summary: initialValues?.summary || "",
      axioms: initialValues?.axioms || [],
      pictureAssetId: initialValues?.pictureAssetId || null,
      theme: initialValues?.theme || "sci-fi",
      locations: initialValues?.locations || [],
    },
    validationSchema: createScenarioSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const { data: asset } = useAsset(formik.values.pictureAssetId);
  const [newAxiom, setNewAxiom] = useState("");

  const handleAddAxiom = () => {
    if (newAxiom.trim()) {
      formik.setFieldValue("axioms", [
        ...(formik.values.axioms || []),
        newAxiom.trim(),
      ]);
      setNewAxiom("");
    }
  };

  return (
    <FormikProvider value={formik}>
      <form
        onSubmit={formik.handleSubmit}
        className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 p-6 py-12"
      >
        {/* Left Column: Theme & Narrative */}
        <div className="lg:col-span-7 space-y-10">
          {/* Header Section */}
          <section>
            <div className="mb-6">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary/70">
                Definition
              </span>
              <h2 className="text-4xl font-headline font-bold text-base-content mt-1">
                Create Scenario
              </h2>
              <p className="text-base-content/60 mt-2 max-w-lg text-sm">
                Define the scenario, you can be as serious and thorought or not
                take it seriously at all
              </p>
            </div>

            {/* Theme Selection Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-xl">
              {THEMES.map((theme) => {
                const Icon = theme.icon;
                const isSelected = formik.values.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => formik.setFieldValue("theme", theme.id)}
                    className={cn(
                      "relative group aspect-square rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 p-2",
                      isSelected
                        ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--p),0.2)]"
                        : "bg-base-200 border-base-300 hover:border-primary/40 hover:scale-[1.02]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6",
                        isSelected ? "text-primary" : "text-base-content/40",
                      )}
                    />
                    <span
                      className={cn(
                        "font-label text-[9px] uppercase tracking-widest",
                        isSelected
                          ? "text-primary font-bold"
                          : "text-base-content/60",
                      )}
                    >
                      {theme.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {formik.touched.theme && formik.errors.theme && (
              <div className="text-xs text-error mt-2">
                {formik.errors.theme}
              </div>
            )}
          </section>

          {/* Name Field */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-headline text-2xl " htmlFor="name">
                Scenario Name
              </label>
              <span className="font-label text-[10px] text-base-content/40 uppercase tracking-widest">
                Required
              </span>
            </div>
            <div className="">
              <input
                id="name"
                name="name"
                type="text"
                className="input w-full"
                placeholder="Enter the name of your world..."
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.name && formik.errors.name && (
              <div className="text-xs text-error">{formik.errors.name}</div>
            )}
          </section>

          {/* World Essence Section */}
          <section className="space-y-4">
            <div className="">
              <label className="font-headline text-2xl " htmlFor="description">
                Description
              </label>
              <div className="font-label text-[10px] text-base-content/80 uppercase tracking-widest">
                You can define the world here, or define the opening sitation
                where characters find themselves in, define the rules of the
                world
              </div>
            </div>
            <div className="relative group">
              <textarea
                id="description"
                name="description"
                className="textarea w-full outline-none"
                placeholder="Describe the essence of the scenario here as briefly or as detailed as you like"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            <div className="flex justify-between items-center">
              {formik.touched.description && formik.errors.description ? (
                <div className="text-xs text-error">
                  {formik.errors.description}
                </div>
              ) : (
                <div />
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-2 text-secondary font-label uppercase tracking-widest text-[10px]"
              >
                <LucideSparkles className="w-4 h-4" />
                Enhance with AI
              </button>
            </div>
          </section>

          {/* Axioms Section */}
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl ">Axioms</h3>
            </div>

            <div className="space-y-3">
              {(formik.values.axioms || []).map((axiom, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-base-300/30 p-4 rounded-xl border-l-2 border-primary/50 group hover:bg-base-300/50 transition-colors"
                >
                  <LucideGavel className="w-5 h-5  group-hover:text-primary transition-colors" />
                  <span className="flex-grow text-base-content text-sm">
                    {axiom}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newAxioms = [...(formik.values.axioms || [])];
                      newAxioms.splice(index, 1);
                      formik.setFieldValue("axioms", newAxioms);
                    }}
                    className="cursor-pointer text-base-content/60 hover:text-error transition-colors"
                  >
                    <LucideX className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-4 bg-base-200/40 p-4 rounded-xl border  border-base-content/60 group  transition focus-within:opacity-100">
                <LucideSparkles className="w-5 h-5 text-base-content/80" />
                <input
                  type="text"
                  placeholder="Input new axiom or condition..."
                  className="bg-transparent border-none focus:ring-0 w-full text-sm italic outline-none text-base-content/90"
                  value={newAxiom}
                  onChange={(e) => setNewAxiom(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddAxiom())
                  }
                />
                {newAxiom.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={handleAddAxiom}
                  >
                    <CornerDownLeft className="size-2" /> Add
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 opacity-40">
              <span className="text-[10px] font-label italic uppercase tracking-wider">
                • Magic is a limited resource
              </span>
              <span className="text-[10px] font-label italic uppercase tracking-wider">
                • All technology is powered by the Aether
              </span>
              <span className="text-[10px] font-label italic uppercase tracking-wider">
                • High orbital taxes
              </span>
            </div>
          </section>

          {/* World Visualization Section */}
          <section className="space-y-4">
            <div className="font-headline text-2xl ">World Visualization</div>
            <div
              className={cn(
                "relative group w-full aspect-[21/9] rounded-2xl overflow-hidden border-2 border-dashed border-base-content/90 flex flex-col items-center justify-center transition-all",
              )}
              style={
                asset?.secureUrl
                  ? {
                      backgroundImage: `url(${asset.secureUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            >
              {asset?.secureUrl && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
              )}

              <div className="relative z-10 flex flex-col items-center">
                {!asset?.secureUrl && (
                  <>
                    <LucideUpload className="w-10 h-10 text-base-content/20 mb-4" />
                    <p className="font-label text-[11px] uppercase tracking-[0.2em] text-base-content/40 mb-6">
                      No cover image initialized
                    </p>
                  </>
                )}
                <ImageUploadWidget
                  onSuccess={(res) =>
                    formik.setFieldValue("pictureAssetId", res.id)
                  }
                  folder="scenarios"
                  label={
                    asset?.secureUrl
                      ? "Change Visualization"
                      : "Upload or Generate Image"
                  }
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Locations & Forge */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-base-200/40 backdrop-blur-xl p-8 rounded-3xl border border-base-content/5 sticky top-12 shadow-2xl">
            {/* Locations Header */}
            <div className="mb-8 flex justify-between items-center">
              <h3 className="font-headline text-2xl text-primary/90 flex items-center gap-3">
                <LucideMapPin className="w-6 h-6" /> Locations
              </h3>
              <button
                type="button"
                className="btn btn-primary btn-outline btn-xs gap-1 font-label text-[9px] uppercase tracking-widest"
              >
                <LucideSparkles className="w-3 h-3" /> Add with AI
              </button>
            </div>

            {/* Locations List */}
            <div className="space-y-5">
              {(formik.values.locations || []).map((loc, idx) => (
                <div
                  key={loc.id}
                  className="bg-base-300/40 p-5 rounded-2xl border border-primary/5 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-base-content text-sm">
                        {loc.name}
                      </h4>
                      <p className="text-[10px] text-base-content/40 mt-0.5">
                        {loc.description}
                      </p>
                    </div>
                    <span className="badge badge-primary badge-outline font-label text-[8px] uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                  {loc.imageUrl && (
                    <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                      <img
                        src={loc.imageUrl}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        alt={loc.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-block btn-ghost btn-xs font-label uppercase tracking-widest text-base-content/40 hover:text-primary"
                  >
                    Edit Geometry
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-block btn-ghost border-2 border-dashed border-base-content/10 hover:border-primary/40 h-16 rounded-2xl flex items-center justify-center gap-3 text-base-content/40 text-xs transition-all"
              >
                <LucidePlus className="w-5 h-5" />
                Add Starting Location
              </button>
            </div>

            {/* Forge Button */}
            <div className="mt-10">
              <button
                type="submit"
                disabled={mutation.isPending}
                className={cn(
                  "btn btn-block h-16 rounded-2xl font-headline font-extrabold text-xl tracking-tight transition-all relative overflow-hidden group",
                  mutation.isSuccess
                    ? "btn-success"
                    : "btn-primary bg-gradient-to-br from-primary to-primary-focus border-none shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[0.98]",
                )}
              >
                {mutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : mutation.isSuccess ? (
                  <div className="flex items-center gap-2">
                    <LucideCheck /> World Forged
                  </div>
                ) : (
                  `${isUpdate ? "Update" : "Forge"} World`
                )}
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 skew-y-6"></div>
              </button>
              <p className="text-[9px] text-center text-base-content/30 uppercase tracking-widest mt-4 font-label">
                Initialize Quantum Scenario Pulse
              </p>
            </div>

            {/* Error/Success Alerts */}
            {mutation.isError && (
              <div className="alert alert-error mt-6 text-xs py-2">
                <span>Error forging world. Please check axioms.</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </FormikProvider>
  );
}

"use client";

import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Character, CharacterFormValues } from "@/types";
import {
  calculatePointBuyCost,
  characterFormSchema,
  POINT_BUY_TOTAL,
} from "@/validators/character";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Minus, User, Upload } from "lucide-react";
import ImageUploadWidget from "./upload-widget";
import { useAsset } from "../hooks/use-asset";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CharacterFormProps {
  gameId: string;
  onSuccess?: () => void;
  id?: string;
}

export default function CharacterForm({
  gameId,
  onSuccess,
  id,
}: CharacterFormProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: CharacterFormValues) => {
      const response = !id
        ? await axios.post(`/api/games/${gameId}/characters`, {
            ...values,
          })
        : await axios.put(`/api/characters/${id}`, { ...values });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Character created successfully:", data);
      queryClient.invalidateQueries({
        queryKey: ["games", gameId, "characters"],
      });
      queryClient.invalidateQueries({ queryKey: ["characters", id] });
      formik.resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Character creation error:", error);
    },
  });

  const formik = useFormik<CharacterFormValues & { points?: string }>({
    initialValues: {
      name: "",
      pronoun: "he/him",
      strength: 8,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
      hp: 10,
      armorClass: 10,
      level: 1,
      description: "",
      photoAssetId: null,
    },
    validationSchema: characterFormSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const {
    data: character,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Character>({
    queryKey: ["characters", id],
    enabled: !!id,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });
  const isDisabled = isLoading;
  useEffect(() => {
    if (character) {
      formik.setValues({
        name: character.name,
        pronoun: character.pronoun ?? "they/them",
        strength: character.strength ?? 8,
        dexterity: character.dexterity ?? 8,
        constitution: character.constitution ?? 8,
        intelligence: character.intelligence ?? 8,
        wisdom: character.wisdom ?? 8,
        charisma: character.charisma ?? 8,
        hp: character.hp ?? 10,
        armorClass: character.armorClass ?? 10,
        level: character.level ?? 1,
        description: character.description ?? "",
      });
    }
  }, [character]);

  const cost = calculatePointBuyCost(formik.values);
  const pointsRemaining = POINT_BUY_TOTAL - cost;
  const { data: photoAsset } = useAsset(formik.values.photoAssetId);

  return (
    <form onSubmit={formik.handleSubmit} className="w-full space-y-8">
      {/* Loading Alert */}
      {isLoading && (
        <div className="alert alert-info">
          <span className="loading loading-spinner loading-sm"></span>
          <span>Loading character data...</span>
        </div>
      )}
      {/* Error Alert */}
      {isError && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Error loading character:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-sm btn-ghost"
          >
            Retry
          </button>
        </div>
      )}
      {/* No Data Alert */}
      {id && !isLoading && !isError && !character && (
        <div className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Character data not found</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-sm btn-ghost"
          >
            Refresh
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Identity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Character Name */}
          <div className="form-control w-full">
            <label htmlFor="name" className="label">
              <span className="label-text font-headline text-[10px] uppercase tracking-[0.2em] text-primary">
                <User className="inline-block mr-2" size={14} />
                Character Name
              </span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className="input input-bordered bg-base-200 border-white/10 focus:border-primary/50 focus:outline-none w-full"
              placeholder="e.g. Valerius the Silent"
              disabled={isDisabled}
            />
            {formik.touched.name && formik.errors.name && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formik.errors.name}
                </span>
              </label>
            )}
          </div>

          {/* Pronoun Selector */}
          <div className="form-control w-full">
            <label htmlFor="pronoun" className="label">
              <span className="label-text font-headline text-[10px] uppercase tracking-[0.2em] text-primary">
                Pronouns
              </span>
            </label>
            <select
              id="pronoun"
              name="pronoun"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.pronoun}
              className="select select-bordered bg-base-200 border-white/10 focus:border-primary/50 focus:outline-none w-full"
              disabled={isDisabled}
            >
              <option value="he/him">He/Him</option>
              <option value="she/her">She/Her</option>
              <option value="they/them">They/Them</option>
            </select>
            {formik.touched.pronoun && formik.errors.pronoun && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formik.errors.pronoun}
                </span>
              </label>
            )}
          </div>

          {/* Character Description */}
          <div className="form-control w-full">
            <label htmlFor="description" className="label">
              <span className="label-text font-headline text-[10px] uppercase tracking-[0.2em] text-primary">
                Character Background
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              className="textarea textarea-bordered bg-base-200 border-white/10 focus:border-primary/50 focus:outline-none w-full h-40 resize-none"
              placeholder="Describe your character's background and story..."
              disabled={isDisabled}
            />
            {formik.touched.description && formik.errors.description && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formik.errors.description}
                </span>
              </label>
            )}
          </div>

          {/* Character Portrait Upload */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-headline text-[10px] uppercase tracking-[0.2em] text-primary">
                Character Portrait
              </span>
            </label>
            <div
              className={cn(
                "relative group w-full aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-base-content/20 flex flex-col items-center justify-center transition-all bg-base-200",
              )}
              style={
                photoAsset?.secureUrl
                  ? {
                      backgroundImage: `url(${photoAsset.secureUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            >
              {photoAsset?.secureUrl && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
              )}

              <div className="relative z-10 flex flex-col items-center">
                {!photoAsset?.secureUrl && (
                  <>
                    <Upload className="w-10 h-10 text-base-content/20 mb-4" />
                    <p className="font-headline text-[11px] uppercase tracking-[0.2em] text-base-content/40 mb-6">
                      No portrait uploaded
                    </p>
                  </>
                )}
                <ImageUploadWidget
                  onSuccess={(res) =>
                    formik.setFieldValue("photoAssetId", res.id)
                  }
                  folder="characters"
                  label={
                    photoAsset?.secureUrl
                      ? "Change Portrait"
                      : "Upload Portrait"
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attributes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Attributes Section */}
          <section className="bg-base-200 p-8 rounded-xl border border-white/5">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="font-headline text-lg uppercase tracking-widest text-white">
                  Attribute Calibration
                </h3>
                <p className="text-white/40 text-xs uppercase tracking-tighter">
                  Allocate points across core abilities (8-15)
                </p>
              </div>
              <div className="text-right">
                <motion.span
                  key={pointsRemaining}
                  initial={{ scale: 1.2, color: "#ffc563" }}
                  animate={{
                    scale: 1,
                    color: pointsRemaining < 0 ? "#ff6b6b" : "#ffc563",
                  }}
                  className="font-headline text-3xl font-bold tabular-nums drop-shadow-[0_0_10px_rgba(255,179,0,0.4)]"
                >
                  {pointsRemaining}
                </motion.span>
                <p className="font-headline text-[10px] uppercase tracking-widest text-primary/60">
                  Points Remaining
                </p>
              </div>
            </div>

            {formik.errors.points && (
              <div className="alert alert-error mb-4">
                <span>{formik.errors.points}</span>
              </div>
            )}

            {/* Ability Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strength */}
              <div className="bg-neutral/40 p-4 rounded-lg flex items-center justify-between group hover:bg-neutral/60 transition-colors">
                <div className="flex-1">
                  <p className="font-headline text-[10px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-primary transition-colors">
                    Strength
                  </p>
                  <p className="font-headline text-2xl font-bold">
                    {formik.values.strength}
                  </p>
                  {formik.touched.strength && formik.errors.strength && (
                    <p className="text-error text-xs mt-1">
                      {formik.errors.strength}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.max(8, formik.values.strength - 1);
                      formik.setFieldValue("strength", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-white/20 hover:bg-primary/20 hover:border-primary/50 text-white/40 hover:text-primary"
                    disabled={isDisabled || formik.values.strength <= 8}
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.min(15, formik.values.strength + 1);
                      formik.setFieldValue("strength", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-primary/40 bg-primary/10 hover:bg-primary hover:text-primary-content"
                    disabled={isDisabled || formik.values.strength >= 15}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Dexterity */}
              <div className="bg-neutral/40 p-4 rounded-lg flex items-center justify-between group hover:bg-neutral/60 transition-colors">
                <div className="flex-1">
                  <p className="font-headline text-[10px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-primary transition-colors">
                    Dexterity
                  </p>
                  <p className="font-headline text-2xl font-bold">
                    {formik.values.dexterity}
                  </p>
                  {formik.touched.dexterity && formik.errors.dexterity && (
                    <p className="text-error text-xs mt-1">
                      {formik.errors.dexterity}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.max(8, formik.values.dexterity - 1);
                      formik.setFieldValue("dexterity", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-white/20 hover:bg-primary/20 hover:border-primary/50 text-white/40 hover:text-primary"
                    disabled={isDisabled || formik.values.dexterity <= 8}
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.min(15, formik.values.dexterity + 1);
                      formik.setFieldValue("dexterity", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-primary/40 bg-primary/10 hover:bg-primary hover:text-primary-content"
                    disabled={isDisabled || formik.values.dexterity >= 15}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Constitution */}
              <div className="bg-neutral/40 p-4 rounded-lg flex items-center justify-between group hover:bg-neutral/60 transition-colors">
                <div className="flex-1">
                  <p className="font-headline text-[10px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-primary transition-colors">
                    Constitution
                  </p>
                  <p className="font-headline text-2xl font-bold">
                    {formik.values.constitution}
                  </p>
                  {formik.touched.constitution &&
                    formik.errors.constitution && (
                      <p className="text-error text-xs mt-1">
                        {formik.errors.constitution}
                      </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.max(
                        8,
                        formik.values.constitution - 1,
                      );
                      formik.setFieldValue("constitution", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-white/20 hover:bg-primary/20 hover:border-primary/50 text-white/40 hover:text-primary"
                    disabled={isDisabled || formik.values.constitution <= 8}
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.min(
                        15,
                        formik.values.constitution + 1,
                      );
                      formik.setFieldValue("constitution", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-primary/40 bg-primary/10 hover:bg-primary hover:text-primary-content"
                    disabled={isDisabled || formik.values.constitution >= 15}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Intelligence */}
              <div className="bg-neutral/40 p-4 rounded-lg flex items-center justify-between group hover:bg-neutral/60 transition-colors">
                <div className="flex-1">
                  <p className="font-headline text-[10px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-primary transition-colors">
                    Intelligence
                  </p>
                  <p className="font-headline text-2xl font-bold">
                    {formik.values.intelligence}
                  </p>
                  {formik.touched.intelligence &&
                    formik.errors.intelligence && (
                      <p className="text-error text-xs mt-1">
                        {formik.errors.intelligence}
                      </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.max(
                        8,
                        formik.values.intelligence - 1,
                      );
                      formik.setFieldValue("intelligence", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-white/20 hover:bg-primary/20 hover:border-primary/50 text-white/40 hover:text-primary"
                    disabled={isDisabled || formik.values.intelligence <= 8}
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.min(
                        15,
                        formik.values.intelligence + 1,
                      );
                      formik.setFieldValue("intelligence", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-primary/40 bg-primary/10 hover:bg-primary hover:text-primary-content"
                    disabled={isDisabled || formik.values.intelligence >= 15}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Wisdom */}
              <div className="bg-neutral/40 p-4 rounded-lg flex items-center justify-between group hover:bg-neutral/60 transition-colors">
                <div className="flex-1">
                  <p className="font-headline text-[10px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-primary transition-colors">
                    Wisdom
                  </p>
                  <p className="font-headline text-2xl font-bold">
                    {formik.values.wisdom}
                  </p>
                  {formik.touched.wisdom && formik.errors.wisdom && (
                    <p className="text-error text-xs mt-1">
                      {formik.errors.wisdom}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.max(8, formik.values.wisdom - 1);
                      formik.setFieldValue("wisdom", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-white/20 hover:bg-primary/20 hover:border-primary/50 text-white/40 hover:text-primary"
                    disabled={isDisabled || formik.values.wisdom <= 8}
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.min(15, formik.values.wisdom + 1);
                      formik.setFieldValue("wisdom", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-primary/40 bg-primary/10 hover:bg-primary hover:text-primary-content"
                    disabled={isDisabled || formik.values.wisdom >= 15}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Charisma */}
              <div className="bg-neutral/40 p-4 rounded-lg flex items-center justify-between group hover:bg-neutral/60 transition-colors">
                <div className="flex-1">
                  <p className="font-headline text-[10px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-primary transition-colors">
                    Charisma
                  </p>
                  <p className="font-headline text-2xl font-bold">
                    {formik.values.charisma}
                  </p>
                  {formik.touched.charisma && formik.errors.charisma && (
                    <p className="text-error text-xs mt-1">
                      {formik.errors.charisma}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.max(8, formik.values.charisma - 1);
                      formik.setFieldValue("charisma", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-white/20 hover:bg-primary/20 hover:border-primary/50 text-white/40 hover:text-primary"
                    disabled={isDisabled || formik.values.charisma <= 8}
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = Math.min(15, formik.values.charisma + 1);
                      formik.setFieldValue("charisma", newVal);
                    }}
                    className="btn btn-circle btn-xs btn-outline border-primary/40 bg-primary/10 hover:bg-primary hover:text-primary-content"
                    disabled={isDisabled || formik.values.charisma >= 15}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Combat Stats - Hidden */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 hidden">
        {/* HP */}
        <div className="form-control">
          <label htmlFor="hp" className="label">
            <span className="label-text">Hit Points (HP)</span>
          </label>
          <input
            id="hp"
            name="hp"
            type="number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.hp}
            className="input input-bordered"
          />
          {formik.touched.hp && formik.errors.hp && (
            <label className="label">
              <span className="label-text-alt text-error">
                {formik.errors.hp}
              </span>
            </label>
          )}
        </div>

        {/* Armor Class */}
        <div className="form-control">
          <label htmlFor="armorClass" className="label">
            <span className="label-text">Armor Class (AC)</span>
          </label>
          <input
            id="armorClass"
            name="armorClass"
            type="number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.armorClass}
            className="input input-bordered"
          />
          {formik.touched.armorClass && formik.errors.armorClass && (
            <label className="label">
              <span className="label-text-alt text-error">
                {formik.errors.armorClass}
              </span>
            </label>
          )}
        </div>

        {/* Level */}
        <div className="form-control">
          <label htmlFor="level" className="label">
            <span className="label-text">Level</span>
          </label>
          <input
            id="level"
            name="level"
            type="number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.level}
            max={15}
            className="input input-bordered"
          />
          {formik.touched.level && formik.errors.level && (
            <label className="label">
              <span className="label-text-alt text-error">
                {formik.errors.level}
              </span>
            </label>
          )}
        </div>
      </div>
      {Object.entries(formik.errors).length} errors present
      {/* Submit Button */}
      <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
        <button
          type="submit"
          disabled={mutation.isPending || isDisabled}
          className="btn btn-primary btn-wide rounded-full font-headline font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,197,99,0.3)] hover:shadow-[0_0_35px_rgba(255,197,99,0.5)]"
        >
          {mutation.isPending
            ? "Saving..."
            : id
              ? "Update Character"
              : "Create Character"}
        </button>
      </div>
      {/* Success Message */}
      {mutation.isSuccess && (
        <div className="alert alert-success">
          <span>Character saved successfully!</span>
        </div>
      )}
      {/* Error Message */}
      {mutation.isError && (
        <div className="alert alert-error">
          <span>
            Error saving character. Please check your inputs and try again.
          </span>
        </div>
      )}
    </form>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { motion } from "motion/react";
import {
  Mic,
  ArrowRight,
  Eye,
  BookOpen,
  Brain,
  Waves,
  Circle,
  Play,
} from "lucide-react";
import Link from "next/link";

export default function HomeContent() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-0 md:pt-20 ">
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwLl7QllUOtdVy6dL7YCbBV0K7a518rCkpp5Y_8wfKQ7F26f4r_7ixBEXEgaelvjdH3YB4r135yiVZsMLarwt1yFQOYw_TuM9Wa-7PqhPR9O14NPhflR2Ks55tVws1RRUML78HBebMCfz444AqeT1ke68CYH8ZZn1p6E80QJeJIsKo8eLZF0NwuHLVOc_qg1IA0ZLwDi9QNaz7z92-oQkUhrzsdu6AHjqQs_cfIlWVtR44ln4AxF7zpsw7it26LAeP5H5VK8FEG2LA"
            alt="Cinematic wide shot of a glowing ethereal stone gateway"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-base-100 via-transparent to-base-100"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-base-100 via-transparent to-base-100"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-6 px-4 py-1 border border-base-content/10 rounded-full bg-base-300/50 backdrop-blur-sm"
          >
            <span className="font-label text-[10px] tracking-[0.3em] uppercase ">
              Voice First AI RPG
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-8xl font-headline font-bold mb-8 tracking-tight leading-tight"
          >
            Your Voice.{" "}
            <span className="text-primary italic text-glow">Its </span> World
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl font-body text-base-content/70 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            A voice-first TTRPG that hears your story, speaks your reality, and
            paints the scene in real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <Link
              href="/games"
              className="btn btn-primary btn-lg px-10 font-label tracking-widest uppercase text-sm shadow-xl shadow-primary/30 hover:scale-105 transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <button className="btn btn-outline btn-lg px-10 font-label tracking-widest uppercase text-sm hover:bg-base-200 transition-all">
              <Play className="mr-2 w-4 h-4 fill-current" />
              Watch Prelude
            </button>
          </motion.div>
        </div>
      </section>

      {/* Feature: Voice-to-Reality Engine */}
      <section id="features" className="py-32 px-6 relative bg-base-200/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full animate-aether"></div>
            <img
              src="/voice.jpg"
              alt="Visual representation of a voice wave"
              className="relative rounded-2xl border border-base-content/10 shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight">
              You Speak
            </h2>
            <p className="text-xl text-base-content/70 font-body leading-relaxed">
              Fabley is a voice-first adventure where the AI hears your ideas,
              speaks back in character, and generates the world around you in
              real-time. It’s a living TTRPG you can talk to
            </p>
            <div className="flex gap-4 items-center">
              <Mic className="text-primary w-6 h-6" />
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-base-content/50">
                It reacts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Neural Performance */}
      <section className="py-32 bg-base-200 border-y border-base-content/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <span className="font-label text-xs tracking-widest text-accent uppercase">
              Full Cast
            </span>
            <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight">
              Adaptive Voices
            </h2>
            <p className="text-xl text-base-content/70 font-body leading-relaxed">
              Characters and narration is powered by dynamic voices
            </p>
          </div>

          <div className="flex-1 relative w-full max-w-lg aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full glass-panel rounded-full border border-accent/20 flex items-center justify-center overflow-hidden">
                <div className="flex items-end gap-2 h-48">
                  {[0.1, 0.3, 0.5, 0.2, 0.4, 0.6, 0.3, 0.5, 0.2].map(
                    (delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ["20%", "80%", "20%"] }}
                        transition={{ duration: 1, repeat: Infinity, delay }}
                        className="w-2 bg-accent/60 rounded-full"
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Experience Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-headline font-bold mb-6">
              The Core Experience
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto font-body">
              Immerse yourself in three layers of pure sensory storytelling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                color: "text-primary",
                title: "Visual Layer",
                items: ["Generates Environments", "Character Images"],
              },
              {
                icon: Mic,
                color: "text-secondary",
                title: "Neural Voice",
                items: ["Adaptive NPC performance", "Expressive Voices"],
              },
              {
                icon: BookOpen,
                color: "text-accent",
                title: "Narrative Layer",
                items: [
                  "Complete Control over expressiveness",
                  "Infinite lore expansion",
                ],
              },
            ].map((layer, i) => (
              <div
                key={i}
                className="bg-base-300 p-10 rounded-2xl border border-base-content/5 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-6">
                  <layer.icon className={`${layer.color} w-8 h-8`} />
                  <h4
                    className={`font-label text-sm uppercase tracking-widest ${layer.color}`}
                  >
                    {layer.title}
                  </h4>
                </div>
                <ul className="space-y-4">
                  {layer.items.map((item, j) => (
                    <li key={j} className="flex gap-3 items-start">
                      <Circle
                        className={`${layer.color} w-2 h-2 mt-1.5 fill-current opacity-60`}
                      />
                      <span className="text-sm font-body">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/nebula/1920/1080"
            alt="Abstract cinematic art"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-base-100"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="text-5xl md:text-7xl font-headline font-bold mb-8">
            Your Adventure Awaits
          </h2>
          <p className="text-2xl font-headline italic text-secondary mb-12">
            The veil is thin. Will you step through?
          </p>
          <div className="flex flex-col items-center gap-8">
            <Link
              href="/games"
              className="btn btn-primary btn-lg px-16 font-label tracking-[0.2em] uppercase text-sm shadow-2xl shadow-primary/20 hover:scale-105 transition-all w-full md:w-auto"
            >
              Join the Alpha
            </Link>
            <div className="flex items-center gap-4 text-base-content/40 font-label text-[10px] tracking-widest uppercase">
              <span className="w-8 h-px bg-base-content/10"></span>
              Limited Slots Remaining for Phase I
              <span className="w-8 h-px bg-base-content/10"></span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

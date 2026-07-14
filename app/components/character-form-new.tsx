/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Menu,
  Settings,
  Camera,
  History,
  Plus,
  Minus,
  Compass,
  User,
  Book,
  Backpack,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Attribute =
  | "Strength"
  | "Dexterity"
  | "Constitution"
  | "Intelligence"
  | "Wisdom"
  | "Charisma";

interface AttributeState {
  Strength: number;
  Dexterity: number;
  Constitution: number;
  Intelligence: number;
  Wisdom: number;
  Charisma: number;
}

export default function App() {
  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [lore, setLore] = useState("");
  const [pointsRemaining, setPointsRemaining] = useState(27);
  const [attributes, setAttributes] = useState<AttributeState>({
    Strength: 10,
    Dexterity: 10,
    Constitution: 10,
    Intelligence: 10,
    Wisdom: 10,
    Charisma: 10,
  });

  const updateAttribute = (attr: Attribute, delta: number) => {
    const currentValue = attributes[attr];
    const newValue = currentValue + delta;

    if (newValue < 8 || newValue > 20) return;
    if (delta > 0 && pointsRemaining <= 0) return;

    setAttributes((prev) => ({ ...prev, [attr]: newValue }));
    setPointsRemaining((prev) => prev - delta);
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-primary-content">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-base-100/90 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto h-16">
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost btn-circle text-primary">
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-headline font-bold tracking-[0.2em] text-primary uppercase drop-shadow-[0_0_8px_rgba(255,197,99,0.4)]">
              The Aetheric Chronicle
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8">
              {["Adventure", "Journal", "Library"].map((item) => (
                <button
                  key={item}
                  className="text-sm font-headline font-medium uppercase tracking-widest hover:text-primary transition-colors"
                >
                  {item}
                </button>
              ))}
            </nav>
            <button className="btn btn-ghost btn-circle text-primary">
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Portrait & Identity */}
        <div className="lg:col-span-5 space-y-8">
          {/* Portrait Section */}
          <section className="relative group">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-base-300 border border-white/5 relative shadow-2xl">
              <img
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                src="https://images.unsplash.com/photo-1519074063912-ad25b57b6d17?q=80&w=1000&auto=format&fit=crop"
                alt="Character Portrait Placeholder"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-t from-base-100 to-transparent">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full bg-neutral flex items-center justify-center mb-4 border border-primary/30"
                >
                  <Camera className="text-primary" size={32} />
                </motion.div>
                <p className="font-headline text-primary uppercase tracking-[0.2em] text-sm mb-2">
                  Initialize Visual Core
                </p>
                <p className="text-white/40 text-xs max-w-[200px]">
                  Upload character portrait. Maximum 5MB. Arcanum-standard
                  aspect ratio suggested.
                </p>
              </div>
            </div>
            {/* Decorative corners */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>
          </section>

          {/* Identity Fields */}
          <div className="space-y-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-headline text-[10px] uppercase tracking-[0.2em] text-primary">
                  Codenomenclature / Name
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Valerius the Silent"
                className="input input-bordered bg-base-200 border-white/10 focus:border-primary/50 focus:outline-none w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-headline text-[10px] uppercase tracking-[0.2em] text-primary">
                  Identity Vectors / Pronouns
                </span>
              </label>
              <input
                type="text"
                placeholder="They / Them"
                className="input input-bordered bg-base-200 border-white/10 focus:border-primary/50 focus:outline-none w-full"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Lore & Attributes */}
        <div className="lg:col-span-7 space-y-8">
          {/* Lore Section */}
          <section className="bg-base-300 p-6 rounded-xl border border-white/5 shadow-lg">
            <h3 className="font-headline text-xs uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2">
              <History size={16} />
              Narrative Chronology
            </h3>
            <textarea
              className="textarea textarea-bordered bg-base-200 border-white/10 focus:border-primary/50 focus:outline-none w-full h-40 resize-none"
              placeholder="Describe the spark that ignited your journey through the Aetheric void..."
              value={lore}
              onChange={(e) => setLore(e.target.value)}
            ></textarea>
          </section>

          {/* Attributes Section */}
          <section className="bg-base-200 p-8 rounded-xl border border-white/5">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="font-headline text-lg uppercase tracking-widest text-white">
                  Attribute Calibration
                </h3>
                <p className="text-white/40 text-xs uppercase tracking-tighter">
                  Allocate resonance points across core faculties
                </p>
              </div>
              <div className="text-right">
                <motion.span
                  key={pointsRemaining}
                  initial={{ scale: 1.2, color: "#ffc563" }}
                  animate={{ scale: 1, color: "#ffc563" }}
                  className="font-headline text-3xl font-bold tabular-nums drop-shadow-[0_0_10px_rgba(255,179,0,0.4)]"
                >
                  {pointsRemaining}
                </motion.span>
                <p className="font-headline text-[10px] uppercase tracking-widest text-primary/60">
                  Points Remaining
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(attributes) as Attribute[]).map((attr) => (
                <div
                  key={attr}
                  className="bg-neutral/40 p-4 rounded-lg flex items-center justify-between group hover:bg-neutral/60 transition-colors"
                >
                  <div>
                    <p className="font-headline text-[10px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-primary transition-colors">
                      {attr}
                    </p>
                    <p className="font-headline text-2xl font-bold">
                      {attributes[attr]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateAttribute(attr, -1)}
                      className="btn btn-circle btn-xs btn-outline border-white/20 hover:bg-primary/20 hover:border-primary/50 text-white/40 hover:text-primary"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={() => updateAttribute(attr, 1)}
                      className="btn btn-circle btn-xs btn-outline border-primary/40 bg-primary/10 hover:bg-primary hover:text-primary-content"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
            <button className="btn btn-primary btn-wide rounded-full font-headline font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,197,99,0.3)] hover:shadow-[0_0_35px_rgba(255,197,99,0.5)]">
              Create Character
            </button>
            <button className="btn btn-ghost btn-sm text-white/40 hover:text-primary font-headline text-[10px] uppercase tracking-widest">
              <Trash2 size={12} className="mr-1" />
              Discard Construct
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 h-20 bg-base-100/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex justify-around items-center px-4 h-full max-w-7xl mx-auto">
          <NavItem icon={<Compass size={20} />} label="Adventure" />
          <NavItem icon={<User size={20} />} label="Character" active />
          <NavItem icon={<Book size={20} />} label="Grimoire" />
          <NavItem icon={<Backpack size={20} />} label="Inventory" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? "text-primary drop-shadow-[0_0_10px_rgba(255,179,0,0.6)]" : "text-white/30 hover:text-white/70"}`}
    >
      {icon}
      <span className="font-headline text-[10px] uppercase font-bold tracking-tighter">
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="nav-active"
          className="w-1 h-1 rounded-full bg-primary mt-0.5"
        />
      )}
    </button>
  );
}

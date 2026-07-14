/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { Terminal, Zap, Disc as Discord, Twitter } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="w-full border-t border-base-content/5 mt-20 bg-base-100">
      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-label uppercase tracking-widest text-[10px] text-base-content/40">
          © 2024 THE ARCANE TERMINAL | SYSTEM STATUS: OPTIMAL
        </div>
        <div className="flex gap-8">
          {[
            { label: "Terminal Logs", icon: Terminal },
            { label: "Mana API", icon: Zap },
            { label: "Discord", icon: Discord },
            { label: "Twitter", icon: Twitter },
          ].map((link, i) => (
            <a
              key={i}
              className="flex items-center gap-2 font-label uppercase tracking-widest text-[10px] text-base-content/40 hover:text-secondary transition-all"
              href="#"
            >
              <link.icon className="w-3 h-3" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { Show } from "@clerk/nextjs";
import {
  ArrowRight,
  ChevronRight,
  MoveRight,
  TriangleRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomeNavbar() {
  return (
    <header className="">
      <div className="fixed top-0 w-full z-50 bg-base-100/80 backdrop-blur-xl border-b border-primary/10">
        <div className="navbar flex-col gap-4 md:flex-row max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex-1 flex gap-2 items-center">
            <Image
              alt="Bonfire logo"
              width={25}
              height={25}
              src="/bonfire.png"
            />

            <Link
              className="text-2xl font-bold  font-headline tracking-wide cursor-pointer"
              href="/"
            >
              Fabley
            </Link>
          </div>
          <div className="flex-none flex items-center gap-8">
            <nav className="flex gap-8">
              <a
                className="font-label uppercase tracking-widest text-xs text-primary border-b-2 border-primary pb-1 hover:scale-105 transition-all"
                href="#features"
              >
                Features
              </a>
              <a
                className="font-label uppercase tracking-widest text-xs text-base-content/70 hover:text-primary transition-colors hover:scale-105"
                href="#adventures"
              >
                Adventures
              </a>
              <a
                className="font-label uppercase tracking-widest text-xs text-base-content/70 hover:text-primary transition-colors hover:scale-105"
                href="#pricing"
              >
                Pricing
              </a>
            </nav>

            <div className="navbar-right hidden md:block">
              <Show when="signed-in">
                <Link
                  href="/games"
                  className="btn btn-primary btn-sm font-label text-xs tracking-tighter hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  <span className="hidden md:inline">Continue </span>
                </Link>
              </Show>
              <Show when="signed-out">
                <Link
                  href="/sign-up"
                  className="btn btn-primary btn-sm font-label text-xs tracking-tighter hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  Get Started
                </Link>
              </Show>
            </div>
          </div>
          <div className="hidden dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52"
            >
              <li>
                <a>Features</a>
              </li>
              <li>
                <a>Adventures</a>
              </li>
              <li>
                <a>Pricing</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-24 md:hidden flex justify-between  items-center alert ">
        <Show
          when="signed-in"
          fallback={
            <>
              <div className="">Start your adventure</div>
              <Link href="/games" className="btn-primary btn">
                Start{" "}
              </Link>
            </>
          }
        >
          <div className="">Continue your journey</div>
          <Link href="/games" className="btn-link btn">
            Continue{" "}
          </Link>
        </Show>
      </div>
    </header>
  );
}

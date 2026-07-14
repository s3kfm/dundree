"use client";

import { Scenario } from "@/types";
import { MoreVertical, PencilIcon } from "lucide-react";
import { useAsset } from "../hooks/use-asset";
import Link from "next/link";

interface ScenarioCardProps {
  scenario: Scenario;
}

export default function ScenarioCard({ scenario }: ScenarioCardProps) {
  const asset = useAsset(scenario.pictureAssetId);
  return (
    <div className="campaign-card group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            asset?.data?.secureUrl ??
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCuCCDxgGkroxBWLt1kz4u9vx2erGpfndrsbxlpGyM-cZIAyNJE8DAMIvGStjsbj2Q3TUJcwVTcEb2U8vZztDACi_AMqevhDK7vzHMAOs4iYTqLxoMO1mVekD8FwkCLJGAjAYcWpuWHIpVC7eIgY3KNZ1HJjXaciB7vD48GQDA-R50qNwBZhxf4Hp63tEM5APhIRgPXI1_Wtw1rdWhcJuETrrMp74ZAEXw89KjhT0OA61HKLEMR6XcCmtmsrfXKOpf8zY2L6MDAH51I"
          }
          alt={scenario.name || "Scenario"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent opacity-60"></div>
      </div>
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="campaign-title">
            {scenario.name || "Untitled Scenario"}
          </h3>
          <button className="btn btn-ghost btn-xs btn-circle">
            <MoreVertical className="w-4 h-4 text-base-content/50" />
          </button>
        </div>
        <p className="campaign-description">
          {scenario.description || "No summary available"}
        </p>

        <Link
          href={`/scenarios/${scenario.id}/edit`}
          className="btn btn-warning btn-sm"
        >
          <PencilIcon className="size-3" />
          Edit
        </Link>
      </div>
      <button className="campaign-button">Select Scenario</button>
    </div>
  );
}

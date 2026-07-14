"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";
import { v4 } from "uuid";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Asset } from "@/types";

interface UploadProps {
  onSuccess: (asset: Asset) => void;
  aspectRatio?: number;
  folder: string;
  label?: string;
}

export default function ImageUploadWidget({
  onSuccess,
  aspectRatio = 1.77,
  folder,

  label,
}: UploadProps) {
  const [publicId, setPublicId] = useState(v4());

  const mutation = useMutation({
    mutationFn: async (data: {
      id: string;
      version?: string;
      width?: number;
      height?: number;
      bytes?: number;
      fileType?: "audio" | "image" | "video" | "other";
      format?: string;
      secureUrl: string;
    }) => {
      const response = await axios.post<Asset>("/api/assets", data);
      return response.data;
    },
    onSuccess: (data) => {
      onSuccess?.call({}, data);
    },
    onError: (error) => {
      console.error("Failed to create asset:", error);
    },
  });
  return (
    <CldUploadWidget
      key={publicId}
      // Replace with your actual unsigned upload preset or signed config
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        folder: folder,
        publicId: publicId,

        maxFileSize: 10000000,
        multiple: false,
        cropping: true,
        croppingAspectRatio: aspectRatio,
        //   showSkipCrop: false, // Forces the user to crop to your ratio
        styles: {
          palette: {
            window: "#FFFFFF",
            sourceBg: "#F4F4F5",
            windowBorder: "#90A0B3",
            tabIcon: "#000000",
            inactiveTabIcon: "#6E7075",
            menuIcons: "#000000",
            link: "#0078FF",
            action: "#0078FF",
            inProgress: "#0078FF",
            complete: "#20B832",
            error: "#E01414",
            textDark: "#000000",
            textLight: "#FFFFFF",
          },
        },
      }}
      signatureEndpoint={"/api/assets/sign"}
      onSuccess={(results) => {
        if (results.info && typeof results.info !== "string") {
          const {
            format,
            version,
            bytes,
            secure_url,
            height,
            width,
            resource_type,
          } = results.info;

          // Determine file type based on resource_type
          let fileType: "audio" | "image" | "video" | "other" = "other";
          if (resource_type === "image") fileType = "image";
          else if (resource_type === "video") fileType = "video";
          else if (resource_type === "raw") {
            // Check if it's audio based on format
            if (format && ["mp3", "wav", "ogg", "m4a"].includes(format)) {
              fileType = "audio";
            }
          }

          // Create asset in database
          mutation.mutate({
            id: publicId,
            version: version?.toString(),
            width,
            height,
            bytes,
            fileType,
            format,
            secureUrl: secure_url,
          });

          // Call the original onSuccess callback

          // Generate new publicId for next upload
          setPublicId(v4());
        }
      }}
    >
      {({ open }) => {
        return (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => open()}
          >
            {label ?? "Upload"}
          </button>
        );
      }}
    </CldUploadWidget>
  );
}

import * as yup from "yup";

// Backend validation schemas for assets
export const createAssetSchema = yup.object().shape({
  id: yup
    .string()
    .uuid("Invalid asset ID format")
    .required("Asset ID is required"),
  version: yup.string().optional(),
  width: yup.number().integer().positive().optional(),
  height: yup.number().integer().positive().optional(),
  bytes: yup.number().integer().positive().optional(),
  fileType: yup.string().oneOf(["audio", "image", "video", "other"]).optional(),
  format: yup.string().max(10).optional(),
  secureUrl: yup
    .string()
    .url("Invalid URL format")
    .required("Secure URL is required"),
});

export const deleteAssetSchema = yup.object().shape({
  id: yup
    .string()
    .uuid("Invalid asset ID format")
    .required("Asset ID is required"),
});

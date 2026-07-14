import * as yup from "yup";

// Location schema for nested validation
const locationSchema = yup.object().shape({
  id: yup.string().required(),
  name: yup.string().required(),
  description: yup.string().required(),
  type: yup.string().required(),
  imageUrl: yup.string().url().optional(),
});

// Backend validation schemas
export const createScenarioSchema = yup.object().shape({
  name: yup.string().trim().required("Scenario name is required"),
  description: yup.string().trim().required("Description is required"),
  summary: yup.string().trim().optional(),
  pictureAssetId: yup.string().uuid().optional().nullable(),
  theme: yup
    .string()
    .trim()
    .oneOf(
      [
        "fantasy",
        "sci-fi",
        "cyberpunk",
        "urban-fantasy",
        "mythology",
        "real-life",
        "contemporary",
      ],
      "Invalid theme selected",
    )
    .optional(),
  axioms: yup.array().of(yup.string().required()).optional(),
  locations: yup.array().of(locationSchema).optional(),
});

export const updateScenarioSchema = yup.object().shape({
  name: yup.string().trim().optional(),
  description: yup.string().trim().optional(),
  summary: yup.string().trim().optional(),
  pictureAssetId: yup.string().uuid().optional().nullable(),
  theme: yup
    .string()
    .trim()
    .oneOf(
      [
        "fantasy",
        "sci-fi",
        "cyberpunk",
        "urban-fantasy",
        "mythology",
        "real-life",
        "contemporary",
      ],
      "Invalid theme selected",
    )
    .optional(),
  axioms: yup.array().of(yup.string().required()).optional(),
  locations: yup.array().of(locationSchema).optional(),
});

export const deleteScenarioSchema = yup.object().shape({
  id: yup
    .string()
    .uuid("Invalid scenario ID format")
    .required("Scenario ID is required"),
});

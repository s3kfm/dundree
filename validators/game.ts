import * as yup from "yup";

// Frontend form validation - field names match database table columns
export const gameFormSchema = yup.object().shape({
  theme: yup.string().trim().optional(),
  setting: yup.string().trim().required("Game setting is required"),
  summary: yup.string().trim().optional(),
  history: yup.array().optional(),
});

// Backend validation schemas
export const createGameSchema = yup.object().shape({
  theme: yup.string().trim().optional(),
  setting: yup.string().trim().optional(),
  summary: yup.string().trim().optional(),
  history: yup.array().optional(),
  name: yup.string().required("Game name is required"),
  scenarioId: yup.string().uuid("Invalid scenario ID").optional(),
  axioms: yup.array().of(yup.string()).optional(),
});

export const updateGameSchema = yup.object().shape({
  theme: yup.string().trim().optional(),
  setting: yup.string().trim().optional(),
  summary: yup.string().trim().optional(),
  history: yup.array().optional(),
});

export const deleteGameSchema = yup.object().shape({
  id: yup
    .string()
    .uuid("Invalid game ID format")
    .required("Game ID is required"),
});

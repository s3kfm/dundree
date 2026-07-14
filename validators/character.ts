import * as yup from "yup";
export const POINT_BUY_TOTAL = 27;

const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};
const ABILITY_KEYS = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
] as const;

type AbilityKey = (typeof ABILITY_KEYS)[number];

export function calculatePointBuyCost(abilities: Record<AbilityKey, number>) {
  return ABILITY_KEYS.reduce(
    (total, key) => total + (POINT_BUY_COST[abilities[key]] ?? 0),
    0,
  );
}
// Frontend form validation - field names match database table columns
export const characterFormSchema = yup
  .object()
  .shape({
    name: yup.string().trim().required("Character name is required"),
    pronoun: yup
      .string()
      .oneOf(["he/him", "she/her", "they/them"], "Invalid pronoun")
      .optional(),

    strength: yup.number().integer().min(8).max(15).required(),
    dexterity: yup.number().integer().min(8).max(15).required(),
    constitution: yup.number().integer().min(8).max(15).required(),
    intelligence: yup.number().integer().min(8).max(15).required(),
    wisdom: yup.number().integer().min(8).max(15).required(),
    charisma: yup.number().integer().min(8).max(15).required(),
    photoAssetId: yup.string().optional().nullable(),
    description: yup.string().trim().optional(),
  })
  .test(
    "pointsBuy",
    "Ability scores exceed the 27 point buy limit",
    function (values) {
      // 'this' context requires a regular function
      if (!values) return true;

      const cost = calculatePointBuyCost(values);
      const POINT_BUY_TOTAL = 27;

      if (cost > POINT_BUY_TOTAL) {
        // This maps the error specifically to the 'strength' field
        // so your UI and Form Library actually see it.
        return this.createError({
          path: "points",
          message: `Total cost is ${cost}, which exceeds the ${POINT_BUY_TOTAL} limit.`,
        });
      }

      return true;
    },
  );

export const updateCharacterSchema = yup.object().shape({
  name: yup.string().trim().optional(),
  charisma: yup
    .number()
    .integer("Charisma must be an integer")
    .min(8, "Charisma must be at least 8")
    .max(15, "Charisma cannot exceed 15")
    .optional(),
  strength: yup
    .number()
    .integer("Strength must be an integer")
    .min(8, "Strength must be at least 8")
    .max(15, "Strength cannot exceed 15")
    .optional(),
  intelligence: yup
    .number()
    .integer("Intelligence must be an integer")
    .min(8, "Intelligence must be at least 8")
    .max(15, "Intelligence cannot exceed 15")
    .optional(),
  agility: yup
    .number()
    .integer("Agility must be an integer")
    .min(8, "Agility must be at least 8")
    .max(15, "Agility cannot exceed 15")
    .optional(),
  photoAssetId: yup.string(),

  pronoun: yup.string().oneOf(["he/him", "she/her", "they/them"]).required(),
  description: yup.string().trim().optional(),
});

export const deleteCharacterSchema = yup.object().shape({
  id: yup
    .string()
    .uuid("Invalid character ID format")
    .required("Character ID is required"),
});

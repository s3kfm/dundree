import { eq, isNull, or } from "drizzle-orm";
import { db } from ".";
import { scenariosTable } from "./schema";

export const getScenarios = async (
  userId?: string | null,
  options?: { limit?: number; offset?: number },
) => {
  const { limit, offset } = options ?? {};

  let query = db.select().from(scenariosTable).$dynamic();

  // Always filter: include public scenarios (userId is null) OR scenarios owned by the user
  if (userId) {
    query = query.where(
      or(eq(scenariosTable.userId, userId), isNull(scenariosTable.userId)),
    );
  } else {
    // If no userId provided, only return public scenarios
    query = query.where(isNull(scenariosTable.userId));
  }

  if (limit) {
    query = query.limit(limit);
  }
  if (offset) {
    query = query.offset(offset);
  }

  return query;
};

import { and, eq, getTableColumns, SQL, sql } from "drizzle-orm";
import { db } from ".";
import { assetsTable, characters, gamesTable, scenariosTable } from "./schema";
import { Character, GameWithDetails } from "@/types";
const characterColumns = getTableColumns(characters);
const characterJsonBuild = sql.raw(
  Object.entries(characterColumns)
    .map(([key, col]) => `'${key}', characters.${col.name}`)
    .join(", "),
);
export const getGamesForUser = async (
  userId: string,
  options?: { limit?: number; offset?: number; where?: SQL },
): Promise<GameWithDetails[]> => {
  const { limit, offset } = options ?? {};
  let query = db
    .select({
      ...getTableColumns(gamesTable),
      scenario: getTableColumns(scenariosTable),
      pictureAssetId: scenariosTable.pictureAssetId,
      characters: sql<Character[]>`COALESCE(
        json_agg(json_build_object(
          ${characterJsonBuild}

        )) FILTER (WHERE ${characters.id} IS NOT NULL), 
        '[]'
      )`.as("characters"),
    })
    .from(gamesTable)
    .where(and(eq(gamesTable.userId, userId), options?.where))
    .leftJoin(scenariosTable, eq(gamesTable.scenarioId, scenariosTable.id))
    .leftJoin(assetsTable, eq(assetsTable.id, scenariosTable.pictureAssetId))
    .leftJoin(characters, eq(characters.gameId, gamesTable.id))
    .groupBy(gamesTable.id, scenariosTable.id)
    .$dynamic();

  if (limit) {
    query = query.limit(limit);
  }
  if (offset) {
    query = query.offset(offset);
  }
  return query;
};

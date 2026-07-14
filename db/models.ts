import { AnyPgTable, PgTable } from "drizzle-orm/pg-core";
import { db } from ".";
import { eq, getTableColumns } from "drizzle-orm";
export function insertItem<TTable extends PgTable>(
  table: TTable,
  values: TTable["$inferInsert"],
): Promise<TTable["$inferSelect"]> {
  return db
    .insert(table)
    .values(values)
    .returning()
    .then((data) => data[0]);
}

export function updateItemById<TTable extends PgTable>(
  table: TTable,
  values: Partial<TTable["$inferInsert"]>,
  id: string | number,
) {
  return db
    .update(table)
    .set(values)
    .where(eq(getTableColumns(table).id, id))
    .returning();
}

export async function getById<TTable extends AnyPgTable>(
  table: TTable,
  id: string | number, // Or string | number depending on your IDs
): Promise<TTable["$inferSelect"] | null> {
  const columns = getTableColumns(table);

  // We cast columns.id as 'any' to satisfy the eq() helper,
  // since TS doesn't know for sure that every table has an 'id'
  const [result] = await db
    .select()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(table as any)
    .where(eq(columns.id, id))
    .limit(1);

  return result ?? null;
}

export function deleteItemById<TTable extends PgTable>(
  table: TTable,
  id: string | number,
) {
  return db
    .delete(table)
    .where(eq(getTableColumns(table).id, id))
    .returning();
}

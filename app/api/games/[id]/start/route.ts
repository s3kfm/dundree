import { getById } from "@/db/models";
import { gamesTable } from "@/db/schema";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const game = await getById(gamesTable, id);
}

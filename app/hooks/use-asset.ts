import { useQuery } from "@tanstack/react-query";
import { Asset } from "@/types";
import { defaultFetcher } from "@/app/lib/default-fetcher";

export function useAsset(id: string | undefined | null) {
  return useQuery<Asset>({
    queryKey: ["assets", id],
    queryFn: defaultFetcher,
    enabled: !!id,
  });
}

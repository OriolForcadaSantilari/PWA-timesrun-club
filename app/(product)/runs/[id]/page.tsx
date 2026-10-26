import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyRunPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const entry of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      query.append(key, entry);
    }
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  permanentRedirect(`/run/${encodeURIComponent(id)}${suffix}`);
}

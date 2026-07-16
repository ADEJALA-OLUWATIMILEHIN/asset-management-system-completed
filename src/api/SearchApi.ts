export type SearchResult = {
  id: string;
  type: "asset" | "maintenance" | "expiry";
  title: string;
  subtitle: string;
  to: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3005";

export async function searchRecords(query: string): Promise<SearchResult[]> {
  const response = await fetch(`${apiBaseUrl}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Unable to search records");
  const body = await response.json();
  return Array.isArray(body.results) ? body.results : [];
}

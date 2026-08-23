/** Fetch JSON from a URL, using CORS proxies in the browser when direct fetch is blocked. */
export async function fetchJson<T>(url: string, directOnly = false): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as T;
  } catch {
    // Direct fetch failed — likely CORS in the browser.
  }

  if (directOnly || typeof window === "undefined") return null;

  const proxies = [
    (target: string) =>
      `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
    (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}`,
  ];

  for (const wrap of proxies) {
    try {
      const res = await fetch(wrap(url));
      if (!res.ok) continue;
      const data = (await res.json()) as T;
      return data;
    } catch {
      continue;
    }
  }

  return null;
}

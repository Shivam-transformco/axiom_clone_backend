import { getJson } from '../http/httpClient';

interface JupiterResp {
  data: Record<string, { id: string; price: number }>;
}

export async function getJupiterPrices(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {};
  const unique = Array.from(new Set(ids));
  const url = `https://price.jup.ag/v4/price?ids=${encodeURIComponent(unique.join(','))}`;
  const data = await getJson<JupiterResp>(url);
  const out: Record<string, number> = {};
  for (const k of Object.keys(data.data || {})) {
    out[k] = data.data[k].price;
  }
  return out;
}

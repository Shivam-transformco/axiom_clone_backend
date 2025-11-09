import axios from 'axios';
import axiosRetry from 'axios-retry';

export const http = axios.create({
  timeout: 10_000,
  headers: {
    'user-agent': 'axiom-realtime-aggregator/0.1'
  }
});

axiosRetry(http, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    if (!error.response) return true; // network error
    const status = error.response.status;
    return status >= 500 || status === 429;
  }
});

export async function getJson<T>(url: string): Promise<T> {
  const res = await http.get<T>(url);
  return res.data;
}

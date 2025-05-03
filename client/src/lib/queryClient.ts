import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  urlOrOptions: string | { 
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
  data?: unknown | undefined,
): Promise<Response> {
  let url: string;
  let options: RequestInit = { credentials: "include" };

  if (typeof urlOrOptions === 'string') {
    // Legacy usage: apiRequest(url, data)
    url = urlOrOptions;
    options = {
      ...options,
      method: 'GET',
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
    };
  } else {
    // New usage: apiRequest({ url, method, headers, body })
    url = urlOrOptions.url || '';
    options = {
      ...options,
      method: urlOrOptions.method || 'GET',
      headers: urlOrOptions.headers || {},
      body: urlOrOptions.body,
    };
  }

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

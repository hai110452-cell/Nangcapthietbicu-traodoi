const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(/\/$/, "");

export type ApiOptions = RequestInit & { auth?: boolean };

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cep_access_token");
}

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("cep_access_token", accessToken);
  localStorage.setItem("cep_refresh_token", refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cep_access_token");
  localStorage.removeItem("cep_refresh_token");
}

async function send(path: string, init: RequestInit, token: string | null) {
  return fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

export async function api<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = true, ...init } = options;
  let token = auth ? getAccessToken() : null;
  let response = await send(path, init, token);

  // Tự làm mới access token một lần khi JWT hết hạn.
  if (response.status === 401 && auth && typeof window !== "undefined" && !path.includes("/auth/refresh")) {
    const refreshToken = localStorage.getItem("cep_refresh_token");
    if (refreshToken) {
      try {
        const refreshed = await send("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }, null);
        if (refreshed.ok) {
          const tokens = await refreshed.json();
          saveTokens(tokens.accessToken, tokens.refreshToken);
          token = tokens.accessToken;
          response = await send(path, init, token);
        } else clearTokens();
      } catch { clearTokens(); }
    }
  }

  const text = await response.text();
  let data: any = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!response.ok || data?.error) {
    const message = data?.message || data?.error || `Yêu cầu API thất bại (${response.status})`;
    throw new Error(Array.isArray(message) ? message.join(", ") : String(message));
  }
  return data as T;
}

export const moneyToNumber = (value: string) => Number(String(value).replace(/[^0-9]/g, "")) || 0;
export const formatMoney = (value: number) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

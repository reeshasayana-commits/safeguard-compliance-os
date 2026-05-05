// ============================================================================
// Axios API Client — Preconfigured with interceptors
// ============================================================================

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Phase 3: Replace with actual token retrieval from auth store
    const token = localStorage.getItem('safeguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Global error handling ─────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Phase 3: Redirect to login or refresh token
        console.error('[API] Unauthorized — token may be expired');
      } else if (status === 403) {
        console.error('[API] Forbidden — insufficient permissions');
      } else if (status >= 500) {
        console.error('[API] Server error:', error.response.data);
      }
    } else if (error.request) {
      console.error('[API] Network error — no response received');
    }

    return Promise.reject(error);
  }
);

export { apiClient };

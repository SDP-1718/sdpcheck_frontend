export const useMockApi = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true'
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://sdpcheck.duckdns.org').replace(/\/$/, '')

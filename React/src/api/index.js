import axios from "axios";
import { refreshTokeAPI } from "./auth"; // Assuming this is correctly set up
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/store/auth"; // Import the Zustand store

export const APIClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Function to check token expiry (remains the same)
export function isTokenExpire(token) {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token); // Standard 'exp' claim
    const now = Date.now() / 1000;
    return exp < now;
  } catch {
    return true; // If decoding fails, treat as expired/invalid
  }
}

export const publicRoutes = ["/signup", "/refresh-token", "/login"];

// --- Request Interceptor ---
APIClient.interceptors.request.use(
  (config) => {
    // Do not add token for public routes
    if (publicRoutes.includes(config.url || "")) {
      return config;
    }

    const { token } = useAuthStore.getState(); // Get token from Zustand store

    if (token && !isTokenExpire(token)) { // Only add token if it exists and is not expired
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If token is expired or not present, let the request proceed without it.
    // The response interceptor will handle 401s if the endpoint requires auth.
    return config;
  },
  (error) => Promise.reject(error)
);


// --- Response Interceptor ---
let isRefreshing = false;
let failedQueue = []; // Array of { resolve, reject } Callbacks

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

APIClient.interceptors.response.use(
  (response) => response, // Simply return successful responses
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401 error and not for a public route or the refresh token route itself
    if (error.response?.status === 401 && originalRequest.url !== "/refresh-token" && !publicRoutes.includes(originalRequest.url || "")) {

      if (isRefreshing) { // If already refreshing, queue the original request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => { // This promise resolves when token is refreshed
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return APIClient(originalRequest); // Retry with new token
        })
        .catch(err => {
          return Promise.reject(err); // If refresh ultimately fails
        });
      }

      isRefreshing = true;
      const { refreshToken, setTokens, clear } = useAuthStore.getState();

      if (refreshToken && !isTokenExpire(refreshToken)) {
        try {
          const response = await refreshTokeAPI({ refreshToken }); // Call your refresh token API
          const newTokens = response.data;
          setTokens(newTokens); // Update tokens in store

          originalRequest.headers.Authorization = `Bearer ${newTokens.token}`;
          processQueue(null, newTokens.token); // Process queued requests with new token
          return APIClient(originalRequest); // Retry the original request
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          clear(); // Clear tokens
          processQueue(refreshError, null); // Reject queued requests
          // Redirect to login, consider adding a message
          window.location.href = '/login?message=session_expired_refresh_failed';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No valid refresh token or refresh token expired
        console.log("No valid refresh token available or refresh token expired.");
        clear();
        isRefreshing = false; // Reset flag
        processQueue(new Error("No valid refresh token."), null);
        window.location.href = '/login?message=session_expired_no_refresh';
        return Promise.reject(error); // Reject original error
      }
    }
    // For other errors, just reject them
    return Promise.reject(error);
  }
);

// Old removeTokenHandler, can be deprecated if store clear + navigation is handled by interceptor/AuthGurd
export function removeTokenHandler() {
  useAuthStore.getState().clear();
  window.location.replace("/login?message=manual_logout");
}

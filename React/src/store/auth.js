import { isTokenExpire } from "@/api"; // Assuming isTokenExpire is correctly handling decoding or just checking expiry
import { refreshTokeAPI } from "@/api/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

// Helper function to decode token safely
const decodeTokenPayload = (token) => {
  try {
    if (token) {
      return jwtDecode(token);
    }
    return null;
  } catch (error) {
    // console.error("Failed to decode token:", error); // Avoid console logging for invalid tokens during normal checks
    return null;
  }
};

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      decodedToken: null,
      decodedRefreshToken: null,
      loading: false, // For async operations like isValidTokens

      setTokens: (tokens) => {
        const newAccessToken = tokens?.token;
        const newRefreshToken = tokens?.refreshToken;
        set({
          token: newAccessToken,
          refreshToken: newRefreshToken,
          decodedToken: decodeTokenPayload(newAccessToken),
          decodedRefreshToken: decodeTokenPayload(newRefreshToken),
        });
      },

      clear: () => {
        set({
          token: null,
          refreshToken: null,
          decodedToken: null,
          decodedRefreshToken: null,
        });
      },

      // This function checks current tokens and attempts refresh if access token is expired but refresh token is valid.
      // It's useful for an initial check when the app loads or before navigating to a protected area.
      validateAndRefreshTokens: async () => {
        set({ loading: true });
        const { token, refreshToken, clear: clearTokens, setTokens: setNewTokens } = get();

        const isAccessTokenValid = token && !isTokenExpire(token);
        const isRefreshTokenValid = refreshToken && !isTokenExpire(refreshToken);

        if (isAccessTokenValid) {
          set({ loading: false });
          return true; // Access token is valid, no action needed
        }

        // Access token is expired or missing
        if (isRefreshTokenValid) {
          // Access token is invalid/expired, but refresh token is valid. Attempt refresh.
          try {
            const response = await refreshTokeAPI({ refreshToken });
            setNewTokens(response.data); // Update store with new tokens
            set({ loading: false });
            return true; // Tokens refreshed successfully
          } catch (error) {
            console.error("Token refresh failed during validation:", error);
            clearTokens(); // Clear tokens if refresh fails
            set({ loading: false });
            return false; // Refresh failed
          }
        } else {
          // Both tokens are invalid or refresh token is invalid/expired
          clearTokens();
          set({ loading: false });
          return false;
        }
      },
      // Simple synchronous check for token existence for immediate UI updates or guards
      // Does not attempt refresh. Relies on validateAndRefreshTokens or interceptors for that.
      isAuthenticated: () => {
        const { token, refreshToken } = get();
        // Check if tokens exist and are not (yet) deemed expired by a simple check.
        // More robust expiry check is done by isTokenExpire which decodes.
        // AuthGurd will use isTokenExpire directly.
        return !!token && !!refreshToken;
      }
    }),
    {
      name: "auth-storage", // Changed name to avoid potential conflicts if old "auth-store" exists with different structure
      // getStorage: () => localStorage, // Default is localStorage
    }
  )
);

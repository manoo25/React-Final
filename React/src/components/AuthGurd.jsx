import { isTokenExpire } from "@/api"; // Utility to check token expiry
import { useAuthStore } from "@/store/auth";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AuthGurdRoute = () => {
  const { pathname } = useLocation();
  const {
    token,
    refreshToken,
    clear: clearAuthTokens,
    validateAndRefreshTokens,
    loading: authStoreLoading // Renamed to avoid conflict with local loading
  } = useAuthStore();

  // Local loading state for the AuthGurd's own async operation
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component

    const checkAuthStatus = async () => {
      setIsCheckingAuth(true); // Start local loading

      // 1. Basic checks: if no tokens strings, definitely not authenticated.
      if (!token || !refreshToken) {
        if (isMounted) {
          clearAuthTokens(); // Ensure store is clean
          setIsAuthenticatedUser(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      // 2. Check refresh token expiry: if refresh token is gone, session is truly over.
      if (isTokenExpire(refreshToken)) {
        if (isMounted) {
          clearAuthTokens();
          setIsAuthenticatedUser(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      // 3. Check access token: if access token is also expired (but refresh token wasn't), try to refresh.
      //    The validateAndRefreshTokens function handles this logic.
      //    It returns true if tokens are valid or successfully refreshed, false otherwise.
      const isValidOrRefreshed = await validateAndRefreshTokens();
      if (isMounted) {
        setIsAuthenticatedUser(isValidOrRefreshed);
        if (!isValidOrRefreshed) {
            // If validation/refresh failed, ensure tokens are cleared.
            // validateAndRefreshTokens should already do this on failure.
        }
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false; // Cleanup to prevent setting state on unmounted component
    };
  }, [token, refreshToken, validateAndRefreshTokens, clearAuthTokens, pathname]); // Rerun on path change or token changes

  // Show a global loading indicator if either the store is busy (e.g. initial hydration) or guard is checking.
  if (authStoreLoading || isCheckingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticatedUser) {
    // Redirect to login, pass current path to redirect back after login
    // Also pass a message if desired (e.g. session_expired)
    return <Navigate to={`/login?redirectTo=${pathname}&message=session_expired`} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default AuthGurdRoute;

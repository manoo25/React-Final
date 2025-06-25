import { logInAPI } from "@/api/auth";
import { logInSchema } from "@/forms/schema"; // Updated to logInSchema
import { useAuthStore } from "@/store/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import qs from "qs";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react"; // Added useEffect

export default function Login() {
  const { search } = useLocation();
  // Destructure email from query params as well
  const { redirectTo, message: queryMessage, email: queryEmail } = qs.parse(search, { ignoreQueryPrefix: true });
  const navigate = useNavigate();
  const { setTokens } = useAuthStore();
  const [apiError, setApiError] = useState("");
  const [notification, setNotification] = useState("");

  const {
    register,
    handleSubmit,
    setValue, // Add setValue from react-hook-form
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(logInSchema), // Ensure this uses logInSchema
    defaultValues: { // Set default values, including email
      email: queryEmail || "", // Prefill email if present in query
      password: "",
    }
  });

  useEffect(() => {
    if (queryEmail) {
      setValue("email", queryEmail); // Explicitly set email value if passed in URL
    }
    if (queryMessage === "session_expired") {
      setNotification("Your session has expired. Please log in again.");
    } else if (queryMessage === "logout_success") {
      setNotification("You have been successfully logged out.");
    } else if (queryMessage === "registration_success") {
      setNotification("Registration successful! Please log in.");
    }

    // Clean up URL: remove message and email query parameters after processing
    const newSearchParams = new URLSearchParams();
    if (redirectTo) newSearchParams.set("redirectTo", redirectTo);
    // Construct the new search string, if there's anything left, prepend '?'
    const newSearch = newSearchParams.toString() ? `?${newSearchParams.toString()}` : "";
    if (search !== newSearch) { // Avoid pushing history if URL is already clean
        navigate(`/login${newSearch}`, { replace: true });
    }

  }, [queryMessage, queryEmail, navigate, redirectTo, setValue, search]);


  // const onSubmit = async (data) => {
  // });

  const onSubmit = async (data) => {
    setApiError("");
    try {
      const res = await logInAPI(data);
      setTokens(res.data);
      navigate(redirectTo ?? "/");
    } catch (e) {
      console.error(e);
      setApiError(e.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card">
          <div className="card-header text-center">
            <h3>Login</h3>
          </div>
          <div className="card-body">
            {notification && <div className="alert alert-info" role="alert">{notification}</div>}
            {apiError && <div className="alert alert-danger" role="alert">{apiError}</div>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label htmlFor="emailInput" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="emailInput"
                  {...register("email")}
                  placeholder="name@example.com"
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="passwordInput" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  id="passwordInput"
                  {...register("password")}
                  placeholder="Password"
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="visually-hidden">Loading...</span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
            <div className="mt-3 text-center">
              <p>
                Don't have an account? <Link to="/register" className="btn-link">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

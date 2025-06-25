import { registerAPI } from "@/api/auth";
import { signUpSchema } from "@/forms/schema"; // Changed to signUpSchema
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset, // Added reset
  } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: { // Added default values
      name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      avatar: "",
    }
  });

  const onSubmit = async (data) => {
    setApiError("");
    try {
      // Data now includes all fields from signUpSchema
      await registerAPI(data);
      reset(); // Reset form on successful registration
      navigate("/login?registration=success&email=" + data.email); // Pass email to prefill login
    } catch (e) {
      console.error("Registration API error:", e);
      if (e.response && e.response.data && e.response.data.message) {
        setApiError(e.response.data.message);
      } else {
        setApiError("Registration failed. Please check your details and try again.");
      }
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card">
          <div className="card-header text-center">
            <h3>Create Account</h3>
          </div>
          <div className="card-body">
            {apiError && <div className="alert alert-danger" role="alert">{apiError}</div>}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Name Field */}
              <div className="mb-3">
                <label htmlFor="nameInput" className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  id="nameInput"
                  {...register("name")}
                  placeholder="John Doe"
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>

              {/* Username Field */}
              <div className="mb-3">
                <label htmlFor="usernameInput" className="form-label">Username</label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? "is-invalid" : ""}`}
                  id="usernameInput"
                  {...register("username")}
                  placeholder="johndoe"
                />
                {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
              </div>

              {/* Email Field */}
              <div className="mb-3">
                <label htmlFor="emailInput" className="form-label">Email address</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="emailInput"
                  {...register("email")}
                  placeholder="name@example.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>

              {/* Password Field */}
              <div className="mb-3">
                <label htmlFor="passwordInput" className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  id="passwordInput"
                  {...register("password")}
                  placeholder="Password (min. 8 characters)"
                />
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>

              {/* Phone Field */}
              <div className="mb-3">
                <label htmlFor="phoneInput" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  id="phoneInput"
                  {...register("phone")}
                  placeholder="e.g., +12345678900 or 1234567890"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
              </div>

              {/* Avatar URL Field (Optional) */}
              <div className="mb-3">
                <label htmlFor="avatarInput" className="form-label">Avatar URL (Optional)</label>
                <input
                  type="url"
                  className={`form-control ${errors.avatar ? "is-invalid" : ""}`}
                  id="avatarInput"
                  {...register("avatar")}
                  placeholder="https://example.com/avatar.jpg"
                />
                {errors.avatar && <div className="invalid-feedback">{errors.avatar.message}</div>}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mt-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="visually-hidden">Loading...</span>
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
            <div className="mt-3 text-center">
              <p>
                Already have an account? <Link to="/login" className="btn-link">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

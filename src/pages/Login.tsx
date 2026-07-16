import { EyeClosed, EyeIcon } from "lucide-react";
import React, { useState } from "react";
import type { FormEvent } from "react";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginPageProps {
  /**
   * Called when the form is submitted with valid input.
   * Should return/throw to indicate success or failure (e.g. an API call).
   */
  onSubmit?: (credentials: LoginCredentials) => Promise<void> | void;
  /** Version string shown in the footer. */
  systemVersion?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onSubmit,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ email, password });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign in failed. Please check your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-surface-container-low login-mesh font-body-md text-on-surface antialiased flex flex-col">
      <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-4 py-8">
    <div className="w-full max-w-[440px] space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-6">
              <div className="">
                <img src="/Logo.jpg"/>
              </div>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-[0.1em]">
              Asset Lifecycle Management
            </p>
          </div>
      

          {/* Auth card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 auth-card">
            <form className="space-y-6" id="loginForm" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="space-y-2">
                <label
                  className="block font-label-md text-label-md text-on-surface-variant"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-3 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="name@sterlingassure.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="block font-label-md text-label-md text-on-surface-variant"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="font-label-sm text-label-sm text-primary hover:underline transition-all"
                    href="#forgot-password"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
               
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-12 py-3 bg-surface border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? <EyeClosed /> : <EyeIcon />}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="bg-error-container text-on-error-container font-label-sm text-label-sm rounded-lg px-3 py-2"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-container text-on-primary-container hover:opacity-90 active:scale-[0.98] transition-all py-3.5 rounded-lg font-title-lg text-title-lg shadow-sm flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">
                      progress_activity
                    </span>
                    Validating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                      login
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer
      <footer className="shrink-0 w-full px-margin-page py-4 border-t border-outline-variant bg-surface-container-low">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-6">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {systemVersion}
            </span>
            <div className="w-px h-4 bg-outline-variant hidden md:block" />
            <div className="flex gap-4">
              <a
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                href="#privacy"
              >
                Privacy Policy
              </a>
              <a
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                href="#terms"
              >
                Terms of Service
              </a>
              <a
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                href="#compliance"
              >
                Contact Compliance
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-surface flex items-center justify-center shadow-sm">
                <span
                  className="material-symbols-outlined text-[14px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  security
                </span>
              </div>
              <div className="w-6 h-8 rounded-full border-2 border-surface-container-low bg-surface flex items-center justify-center shadow-sm">
                <span
                  className="material-symbols-outlined text-[14px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  policy
                </span>
              </div>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              ISO 27001 Certified Environment
            </p>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default LoginPage;

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const validateForm = (): string | null => {
    if (
      !formData.email ||
      !formData.username ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "Please fill in all fields";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    if (formData.username.length < 3) {
      return "Username must be at least 3 characters long";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await register(formData.email, formData.username, formData.password);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-2xl mb-3">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-900 rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600 text-sm">
            Join our AI-powered chat platform
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 mb-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500"
                placeholder="Choose a username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500"
                placeholder="Create a password (min. 6 characters)"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:ring-offset-white mt-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-gray-900 hover:text-gray-700 font-medium transition-colors underline decoration-gray-400 underline-offset-4 hover:decoration-gray-900"
              disabled={isLoading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

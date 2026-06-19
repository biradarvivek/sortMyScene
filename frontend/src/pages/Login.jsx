import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../apiClient";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/login", { email, password });

      login(response.data.user);

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to login. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Welcome Back
        </h2>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="developer@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 transition-all"
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-purple-400 hover:text-purple-300 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

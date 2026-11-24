
import { useEffect, useState } from "react";

import { AuthContext } from "./auth-context";
import api from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing login session
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { access_token, user } = response.data;

    sessionStorage.setItem("access_token", access_token);
    sessionStorage.setItem("user", JSON.stringify(user));

    setUser(user);

    return user;
  };

  // Signup
  const signup = async (full_name, email, password) => {
    await api.post("/auth/register", {
      full_name,
      email,
      password,
    });

    return await login(email, password);
  };

  // Logout
  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

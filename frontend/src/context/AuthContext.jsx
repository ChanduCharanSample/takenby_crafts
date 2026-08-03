import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { userService } from "../services";
import { getMessage } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("craftora_user")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const storeAuth = (token, userData) => {
    localStorage.setItem("craftora_token", token);
    localStorage.setItem("craftora_user", JSON.stringify(userData));
    setUser(userData);
  };

  // --- Registration: step 1 (validate + send OTP) ---
  const registerRequest = async (formData) => {
    setLoading(true);
    try {
      const { data } = await userService.registerRequest(formData);
      return { success: true, message: data.message, dev: data.dev };
    } catch (error) {
      return { success: false, message: getMessage(error, "Could not send verification code") };
    } finally {
      setLoading(false);
    }
  };

  // --- Registration: step 2 (verify OTP + create account) ---
  const registerVerify = async ({ email, otp }) => {
    setLoading(true);
    try {
      const { data } = await userService.registerVerify({ email, otp });
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: getMessage(error, "Verification failed") };
    } finally {
      setLoading(false);
    }
  };

  // --- Customer login (email + password) ---
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await userService.login({ email, password });
      storeAuth(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: getMessage(error, "Login failed") };
    } finally {
      setLoading(false);
    }
  };

  // --- Admin login (email + password) ---
  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await userService.adminLogin({ email, password });
      storeAuth(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: getMessage(error, "Login failed") };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("craftora_token");
    localStorage.removeItem("craftora_user");
    setUser(null);
  }, []);

  const updateUser = async (data) => {
    try {
      const { data: res } = await userService.updateProfile(data);
      const updatedUser = { ...user, ...res.user };
      localStorage.setItem("craftora_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, message: getMessage(error, "Update failed") };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("craftora_token");
    if (token && !user) {
      userService
        .getProfile()
        .then(({ data }) => {
          localStorage.setItem("craftora_user", JSON.stringify(data.user));
          setUser(data.user);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        registerRequest,
        registerVerify,
        login,
        adminLogin,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

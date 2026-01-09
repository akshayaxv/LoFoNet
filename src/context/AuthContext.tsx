import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  User,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  validateSession,
  getCurrentUser,
  LoginCredentials,
  RegisterData,
  AuthResult
} from "@/services/authService";
import { initializeDatabase } from "@/lib/db";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<AuthResult>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const cachedUser = getCurrentUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      initializeDatabase().catch(err =>
        console.error("Error initializing database:", err)
      );

      const cachedUser = getCurrentUser();
      if (cachedUser) {
        setIsLoading(false);
        setIsInitialized(true);

        validateSession()
          .then(result => {
            if (result.success && result.user) {
              setUser(result.user);
            } else {
              setUser(null);
              localStorage.removeItem("murshid_user");
              localStorage.removeItem("murshid_token");
            }
          })
          .catch(err => {
            console.error("Error validating session:", err);
          });
      } else {
        setIsLoading(false);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Error initializing application:", error);
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    const result = await authLogin(credentials);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  const register = async (data: RegisterData): Promise<AuthResult> => {
    const result = await authRegister(data);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const refreshUser = async () => {
    const result = await validateSession();
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    logout,
    register,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

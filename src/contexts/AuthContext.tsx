import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  userRole: string | null;
  signUp: (email: string, password: string, displayName: string, role: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for our token
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUserRole(parsedUser.role);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, displayName: string, role: string) => {
    try {
      let res = await fetch("https://apnaghar-load-balancer.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName, email, password, role })
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch("https://apnaghar-load-balancer.onrender.com/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: displayName, email, password, role })
        }).catch(() => null);
      }

      if (!res) {
        return { error: new Error("Backend service is offline. Please start local microservices.") };
      }
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        return { error: new Error("Server is starting up or temporarily unavailable. Please try again in a minute.") };
      }

      const data = await res.json();
      if (!data.success) {
        return { error: new Error(data.message) };
      }

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setUserRole(data.user.role);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      let res = await fetch("https://apnaghar-load-balancer.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch("https://apnaghar-load-balancer.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }).catch(() => null);
      }

      if (!res) {
        return { error: new Error("Backend service is offline. Please start local microservices.") };
      }
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        return { error: new Error("Server is starting up or temporarily unavailable. Please try again in a minute.") };
      }

      const data = await res.json();
      if (!data.success) {
        return { error: new Error(data.message) };
      }
      
      // Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setUser(data.user);
      setUserRole(data.user.role);
      
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

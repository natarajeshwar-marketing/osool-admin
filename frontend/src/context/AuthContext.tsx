
import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types";
import { apiClient } from "@/lib/api";


interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await apiClient("/auth/profile");
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error("Failed to verify authentication profile", e);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Listen to unauthorized events from fetch interceptor to log out immediately
    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
        };
        window.addEventListener('auth-unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
    };

    const logout = async () => {
        try {
            await apiClient("/auth/logout", {
                method: "POST"
            });
        } catch (e) {
            console.error("Failed to sign out on server", e);
        }
        setUser(null);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-neutral-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#011f5f] border-t-transparent"></div>
                    <p className="text-sm font-medium text-neutral-500">Verifying session...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token: user ? "cookie-authenticated" : null,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
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

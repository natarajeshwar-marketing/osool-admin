
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import heroImage from "@/assets/login-hero.png";
import logoWhite from "@/assets/logo-white.png";
import { apiClient } from "@/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiClient("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await res.json();
            login(data.user);
            toast.success("Logged in successfully");
            navigate("/");
        } catch (error) {
            toast.error("Failed to login. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-neutral-950">
            {/* Left Side - Hero Image */}
            <div className="hidden lg:flex w-1/2 relative bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
                <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
                    <img src={logoWhite} alt="Mserve Logo" className="h-16 w-auto" />
                </div>

                <img
                    src={heroImage}
                    alt="Luxury Home"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />

                <div className="relative z-10 mt-auto p-12 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        Better living, Smart care
                    </h1>
                    <div className="flex gap-2">
                        <div className="w-8 h-1.5 bg-white rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 text-neutral-900 dark:text-neutral-50 relative">
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-muted-foreground">Sign in your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Your Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="h-12 border-neutral-300 dark:border-neutral-700 rounded-lg focus-visible:ring-1 focus-visible:ring-neutral-950 placeholder:text-neutral-400"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-12 border-neutral-300 dark:border-neutral-700 rounded-lg focus-visible:ring-1 focus-visible:ring-neutral-950 pr-10"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium bg-[#f97316] text-white hover:bg-[#ea580c] rounded-lg"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

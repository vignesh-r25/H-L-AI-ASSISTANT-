import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { LoadingTransition } from "./LoadingTransition";


const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

interface AuthFormProps {
  onSuccess: () => void;
  defaultIsLogin?: boolean;
}

export const AuthForm = ({ onSuccess, defaultIsLogin = true }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [authType, setAuthType] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    try {
      if (isLogin) {
        authSchema.pick({ email: true, password: true }).parse(formData);
      } else {
        authSchema.parse({ ...formData, displayName: formData.displayName || undefined });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setShowTransition(true);
    setAuthError(null);
    setAuthType(isLogin ? "login" : "signup");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              display_name: formData.displayName || formData.email.split("@")[0],
            },
          },
        });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Auth error:", error);
      setAuthError(error instanceof Error ? error : new Error("Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  if (showTransition) {
    return (
      <LoadingTransition
        waitingFor={loading}
        onComplete={() => {
          if (authError) {
            setShowTransition(false);
            toast({
              title: "Authentication Failed",
              description: authError.message,
              variant: "destructive",
            });
            return;
          }

          toast({
            title: authType === "login" ? "Welcome back!" : "Account created!",
            description: authType === "login"
              ? "You've successfully logged in."
              : "Welcome to H&L. Let's start learning!",
          });
          onSuccess();
        }}
      />
    );
  }

  // Animation logic for "after user has done email, password"
  const isReady = formData.email.includes("@") && formData.password.length >= 6;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className={`glass-card-elevated p-8 transition-all duration-500 ${isReady ? "shadow-[0_0_40px_rgba(6,182,212,0.15)] border-primary/20" : ""}`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center glow-cyan"
            >
              <Zap className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest opacity-60">
              {isLogin
                ? "Sign in to continue"
                : "Initialize AI link"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Label htmlFor="displayName" className="text-foreground">
                    Display Name
                  </Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      name="displayName"
                      placeholder="Enter your name"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="pl-10 input-dark"
                    />
                  </div>
                  {errors.displayName && (
                    <p className="text-sm text-destructive mt-1">{errors.displayName}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 input-dark"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 input-dark"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className={`w-full transition-all duration-300 ${isReady ? "btn-primary shadow-lg shadow-primary/20 animate-pulse-subtle" : "btn-primary opacity-50"}`}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        {/* Features preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4 font-medium opacity-60">Unlock AI-powered learning</p>
          <div className="flex justify-center gap-6 text-xs text-muted-foreground font-bold tracking-widest opacity-40 uppercase">
            <span className="flex items-center gap-1.5 group">
              <span className="w-1.5 h-1.5 rounded-full bg-xp group-hover:scale-150 transition-transform" />
              PDF Sync
            </span>
            <span className="flex items-center gap-1.5 group">
              <span className="w-1.5 h-1.5 rounded-full bg-streak group-hover:scale-150 transition-transform" />
              Nodes
            </span>
            <span className="flex items-center gap-1.5 group">
              <span className="w-1.5 h-1.5 rounded-full bg-purple group-hover:scale-150 transition-transform" />
              AI Core
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

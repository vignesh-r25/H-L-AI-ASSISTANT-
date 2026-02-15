import { AuthForm } from "@/components/auth/AuthForm";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode");
    const isSignup = mode === "signup";

    useEffect(() => {
        // Check if already authenticated
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate("/dashboard");
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                navigate("/dashboard");
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return <AuthForm onSuccess={() => navigate("/dashboard")} defaultIsLogin={!isSignup} />;
}

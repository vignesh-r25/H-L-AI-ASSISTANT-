import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const location = useLocation();

    useEffect(() => {
        checkRole();
    }, []);

    const checkRole = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching role:', error);
                setLoading(false);
                return;
            }

            // Check if user's role is in the allowedRoles array
            // default to 'student' if null
            const userRole = profile?.role || 'student';

            if (allowedRoles.includes(userRole)) {
                setHasAccess(true);
            } else {
                toast.error("You don't have permission to access this area.");
            }
        } catch (error) {
            console.error('Role check error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

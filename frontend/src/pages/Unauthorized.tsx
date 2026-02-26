import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
                <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground max-w-md">
                You do not have the required permissions to view this page.
                If you believe this is an error, please contact an administrator.
            </p>
            <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
                <Button onClick={() => navigate("/")}>
                    Return Home
                </Button>
            </div>
        </div>
    );
};

export default Unauthorized;

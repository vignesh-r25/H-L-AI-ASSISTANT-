import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
    return (
        <div className="min-h-screen bg-background p-6 md:p-12 max-w-4xl mx-auto">
            <Link to="/">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </Link>

            <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

            <div className="prose dark:prose-invert max-w-none space-y-4 text-muted-foreground">
                <p>Last updated: February 6, 2026</p>

                <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
                <p>By accessing and using H&L Learning Assistant, you accept and agree to be bound by the terms and provision of this agreement.</p>

                <h2 className="text-xl font-semibold text-foreground">2. Use License</h2>
                <p>Permission is granted to temporarily download one copy of the materials (information or software) on H&L Learning Assistant's website for personal, non-commercial transitory viewing only.</p>

                <h2 className="text-xl font-semibold text-foreground">3. User Account</h2>
                <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.</p>

                <h2 className="text-xl font-semibold text-foreground">4. Educational Content</h2>
                <p>The AI-generated content is for educational purposes. While we strive for accuracy, users should verify critical information from primary sources.</p>
            </div>
        </div>
    );
}

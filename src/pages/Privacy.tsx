import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-background p-6 md:p-12 max-w-4xl mx-auto">
            <Link to="/">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </Link>

            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

            <div className="prose dark:prose-invert max-w-none space-y-4 text-muted-foreground">
                <p>Last updated: February 6, 2026</p>

                <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our interactive features.</p>

                <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services, including studying your interaction with our AI learning tools to personalize your experience.</p>

                <h2 className="text-xl font-semibold text-foreground">3. Data Security</h2>
                <p>We implement appropriate technical and organizational measures to protect the security of your personal information.</p>

                <h2 className="text-xl font-semibold text-foreground">4. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at vigneshhavoc54@gmail.com.</p>
            </div>
        </div>
    );
}

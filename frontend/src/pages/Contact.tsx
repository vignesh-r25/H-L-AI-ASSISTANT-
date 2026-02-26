import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Instagram, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function Contact() {
    return (
        <div className="min-h-screen bg-background p-6 md:p-12 max-w-4xl mx-auto">
            <Link to="/">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </Link>

            <div className="space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-2">Get in Touch</h1>
                    <p className="text-muted-foreground text-lg">We'd love to hear from you.</p>
                </div>

                <Card className="glass-card max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-xl text-center">Contact Us</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Emails */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 p-4 rounded-lg bg-secondary/50 flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                                    <a href="mailto:muthuraj.k@cmr.edu.in" className="text-foreground hover:text-primary transition-colors font-medium break-all">
                                        muthuraj.k@cmr.edu.in
                                    </a>
                                </div>
                                <div className="flex-1 p-4 rounded-lg bg-secondary/50 flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                                    <a href="mailto:vigneshhavoc54@gmail.com" className="text-foreground hover:text-primary transition-colors font-medium break-all">
                                        vigneshhavoc54@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Instagram */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 justify-center">
                                <Instagram className="h-5 w-5 text-pink-500" />
                                Connect on Instagram
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <a
                                    href="https://instagram.com/Vignesh.r.25"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                                >
                                    <span className="font-medium group-hover:text-pink-500 transition-colors">@Vignesh.r.25</span>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </a>
                                <a
                                    href="https://www.instagram.com/_saiiii____?igsh=MXBmYjEwMzE0bXl3Zg=="
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                                >
                                    <span className="font-medium group-hover:text-pink-500 transition-colors">@_saiiii____</span>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </a>
                                <a
                                    href="https://instagram.com/hi_ai_assistant25.08"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                                >
                                    <span className="font-medium group-hover:text-pink-500 transition-colors">@hi_ai_assistant25.08</span>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

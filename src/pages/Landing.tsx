import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, Zap, Users, BookOpen, Layers, BarChart3, Lock, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Brain className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">H&L Learning</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/auth">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link to="/auth?mode=signup">
                            <Button>Create Free Account</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-[-1] overflow-hidden">
                    <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
                    <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
                </div>

                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        <motion.div variants={item} className="inline-flex items-center px-4 py-1.5 rounded-full border bg-background/50 backdrop-blur-sm text-sm font-medium text-muted-foreground">
                            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                            <span>Experience the Future of Education</span>
                        </motion.div>

                        <motion.h1 variants={item} className="text-5xl lg:text-7xl font-bold tracking-tight">
                            Master Your Learning with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                                AI Intelligence
                            </span>
                        </motion.h1>

                        <motion.p variants={item} className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Unlock your full potential with personal AI tutoring, gamified progress tracking, and distraction-free study zones.
                        </motion.p>

                        <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/auth?mode=signup">
                                <Button size="lg" className="h-12 px-8 text-lg rounded-full group">
                                    Start Learning Now
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full" onClick={scrollToFeatures}>
                                View Features
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-secondary/30 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything You Need to Excel</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            We combine cognitive science with cutting-edge AI to create the ultimate learning environment.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <FeatureCard
                            icon={<Layers className="w-8 h-8 text-orange-500" />}
                            title="Smart Flashcards"
                            description="Master any subject with AI-generated flashcards that adapt to your retention rate using spaced repetition."
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-8 h-8 text-blue-500" />}
                            title="AI Chat Tutor"
                            description="24/7 access to a subject-matter expert. Ask complex questions and get instant, simplified explanations."
                        />
                        <FeatureCard
                            icon={<Brain className="w-8 h-8 text-purple-500" />}
                            title="Focus Mode"
                            description="Enter a dedicated, distraction-free chamber designed to maximize deep work and retention."
                        />
                        <FeatureCard
                            icon={<BookOpen className="w-8 h-8 text-green-500" />}
                            title="Study Materials"
                            description="Upload your PDFs and notes. Our AI organizes, summarizes, and extracts key concepts for you."
                        />
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-yellow-500" />}
                            title="Interactive Quizzes"
                            description="Test your knowledge with dynamic quizzes that evolve based on your performance history."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-8 h-8 text-pink-500" />}
                            title="Progress Tracking"
                            description="Visualize your growth with detailed analytics, streaks, and XP milestones to stay motivated."
                        />
                    </div>
                </div>
            </section>

            {/* User Experience / How it Helps */}
            <section className="py-24 border-y bg-background">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                                Designed for the Modern Student Experience
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Traditional studying is passive and boring. H&L Learning makes it active, engaging, and personalized.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-green-500" />
                                    </div>
                                    <span className="font-medium">Personalized to your learning style</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="font-medium">Private and secure data handling</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="font-medium">Instant gratification through gamification</span>
                                </li>
                            </ul>
                        </div>
                        <div className="relative h-[400px] rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary border flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
                            <div className="relative z-10 p-8 text-center max-w-sm glass-card rounded-xl">
                                <div className="text-4xl font-bold text-primary mb-2">3x</div>
                                <div className="text-lg font-medium">Faster Retention</div>
                                <p className="text-sm text-muted-foreground mt-2">Students using our active recall methods retain information significantly longer than passive readers.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t bg-secondary/10">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Brain className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-foreground">H&L Learning</span>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Empowering students with AI-driven tools for a smarter, more efficient learning journey.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                        <div>&copy; 2026 H&L Learning Inc. All rights reserved.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-background border shadow-sm hover:shadow-lg transition-all"
        >
            <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}

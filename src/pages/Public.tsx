import { motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Brain,
  BookOpen,
  BarChart3,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";

// Color mapping for Tailwind classes
const colorClasses = {
  cyan: {
    bg: "bg-cyan-500/10",
    icon: "text-cyan-400"
  },
  orange: {
    bg: "bg-orange-500/10",
    icon: "text-orange-400"
  },
  purple: {
    bg: "bg-purple-500/10",
    icon: "text-purple-400"
  },
  green: {
    bg: "bg-green-500/10",
    icon: "text-green-400"
  }
};

export const Public = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: "materials",
      title: "Smart Materials",
      description: "Upload PDFs and organize YouTube links. Build your personal knowledge base with intelligent organization.",
      icon: FileText,
      color: "cyan" as const,
      benefits: ["PDF uploads", "YouTube links", "Organize by topic"]
    },
    {
      id: "chat",
      title: "AI Chat Assistant",
      description: "Chat with your study materials using AI. Get instant answers and insights using Retrieval-Augmented Generation.",
      icon: MessageSquare,
      color: "purple" as const,
      benefits: ["RAG technology", "Context-aware", "Instant answers"]
    },
    {
      id: "flashcards",
      title: "Adaptive Flashcards",
      description: "Create, study, and master concepts with intelligent spaced repetition. Track your progress and mastery.",
      icon: Brain,
      color: "cyan" as const,
      benefits: ["Create custom cards", "Spaced repetition", "Mastery tracking"]
    },
    {
      id: "quizzes",
      title: "Interactive Quizzes",
      description: "Test your knowledge with dynamic quizzes. Earn XP and unlock achievements as you progress.",
      icon: BookOpen,
      color: "orange" as const,
      benefits: ["Earn XP", "Track scores", "Unlock achievements"]
    },
    {
      id: "analytics",
      title: "Progress Analytics",
      description: "Visualize your learning journey. Track streaks, milestones, and overall progress with detailed analytics.",
      icon: BarChart3,
      color: "green" as const,
      benefits: ["Track progress", "View streaks", "See milestones"]
    }
  ];

  const stats = [
    { label: "Active Learners", value: "500+", icon: Zap, color: "cyan" as const },
    { label: "Materials Studied", value: "10K+", icon: FileText, color: "cyan" as const },
    { label: "Quiz Completed", value: "50K+", icon: BookOpen, color: "orange" as const },
    { label: "XP Earned", value: "2M+", icon: Sparkles, color: "green" as const }
  ];

  const reviews = [
    {
      name: "Sarah Johnson",
      role: "Medical Student",
      type: "student",
      avatar: "SJ",
      rating: 5,
      review: "H&L has completely transformed how I study. The AI chat feature helps me understand complex topics instantly, and the spaced repetition flashcards ensure I retain everything for exams.",
      highlight: "Perfect for medical school"
    },
    {
      name: "Dr. Michael Chen",
      role: "Physics Professor",
      type: "teacher",
      avatar: "MC",
      rating: 5,
      review: "I recommend H&L to all my students. The ability to upload lecture PDFs and create interactive quizzes saves me hours of work. The analytics help me see where students struggle.",
      highlight: "Game-changer for educators"
    },
    {
      name: "Emily Rodriguez",
      role: "Law Student",
      type: "student",
      avatar: "ER",
      rating: 5,
      review: "The RAG technology is incredible. I can chat with hundreds of case law PDFs and get precise answers instantly. It's like having a study partner available 24/7.",
      highlight: "Essential study tool"
    },
    {
      name: "Prof. David Thompson",
      role: "Computer Science Instructor",
      type: "teacher",
      avatar: "DT",
      rating: 5,
      review: "My students' engagement has skyrocketed since using H&L. The gamification with XP and streaks motivates them to study consistently. Best educational tool I've seen.",
      highlight: "Boosts student engagement"
    },
    {
      name: "Aisha Patel",
      role: "MBA Candidate",
      type: "student",
      avatar: "AP",
      rating: 5,
      review: "Managing hundreds of business case studies was overwhelming until H&L. Now I can organize, search, and quiz myself efficiently. My grades have improved significantly!",
      highlight: "Massive time saver"
    },
    {
      name: "Jennifer Williams",
      role: "High School Teacher",
      type: "teacher",
      avatar: "JW",
      rating: 5,
      review: "H&L makes differentiated learning possible. I can create custom flashcard decks for different skill levels and track each student's progress. It's revolutionized my classroom.",
      highlight: "Perfect for differentiation"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">H&L Learning</span>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            variant="outline"
            className="gap-2"
          >
            Sign In / Register <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="relative">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative py-24 px-6 overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-20" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-20" />
          </div>

          <div className="max-w-5xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
            >
              Learn Smarter, <span className="gradient-text">Not Harder</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              H&L is an AI-powered learning assistant that transforms how you study. From intelligent materials management to interactive quizzes, unlock your full potential.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const featuresSection = document.getElementById("features");
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Explore Features
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="py-16 px-6 border-y border-white/5"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-4"
                >
                  <div className="flex justify-center mb-3">
                    <stat.icon className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          id="features"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="py-24 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div variants={item} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need for effective, modern learning
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {features.map((feature) => (
                <motion.div key={feature.id} variants={item}>
                  <Card className="h-full hover:border-cyan-500/30 transition-colors duration-300 bg-gradient-to-br from-card to-card/50">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${colorClasses[feature.color].bg} ${colorClasses[feature.color].icon}`}>
                          <feature.icon className="w-6 h-6" />
                        </div>
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardContent className="text-base mt-2">
                        {feature.description}
                      </CardContent>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Dashboard Preview Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="py-24 px-6 border-t border-white/5"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Learning Dashboard</h2>
              <p className="text-xl text-muted-foreground">
                Track your progress with detailed analytics and streak achievements
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard
                title="Your XP"
                value="12,450"
                subtitle="Points earned"
                icon={Zap}
                glowColor="cyan"
              />
              <StatCard
                title="Current Streak"
                value="28"
                subtitle="Days in a row"
                icon={Sparkles}
                glowColor="orange"
              />
              <StatCard
                title="Materials Studied"
                value="42"
                subtitle="PDFs & resources"
                icon={FileText}
                glowColor="cyan"
              />
              <StatCard
                title="Quizzes Completed"
                value="156"
                subtitle="Knowledge tests"
                icon={BookOpen}
                glowColor="green"
              />
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="py-24 px-6 bg-white/5 border-y border-white/5"
        >
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-center mb-16"
            >
              How It Works
            </motion.h2>

            <div className="space-y-8">
              {[
                {
                  step: 1,
                  title: "Upload Your Materials",
                  description: "Add PDFs, YouTube videos, or links to begin building your study collection."
                },
                {
                  step: 2,
                  title: "Create Study Aids",
                  description: "Generate flashcards and quizzes from your materials with AI assistance."
                },
                {
                  step: 3,
                  title: "Learn with AI",
                  description: "Chat with your documents, ask questions, and get instant clarifications."
                },
                {
                  step: 4,
                  title: "Track Progress",
                  description: "Monitor your learning journey with detailed analytics and achievements."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Reviews Section - Scrolling Carousel */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="py-24 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Loved by Students & Teachers
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of learners and educators who trust H&L for their educational journey
              </p>
            </motion.div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 w-20 pointer-events-none bg-gradient-to-r from-white dark:from-slate-900 to-transparent" />
                <div className="absolute inset-y-0 right-0 w-20 pointer-events-none bg-gradient-to-l from-white dark:from-slate-900 to-transparent" />

                <div className="overflow-hidden group"> {/* single track carousel */}
                  <div
                    className="flex gap-6 will-change-transform animate-scroll-left group-hover:[animation-play-state:paused] flex-nowrap items-center"
                    aria-hidden="true"
                  >
                    {[...reviews, ...reviews].map((review, i) => (
                      <Card
                        key={`single-${i}`}
                        className="w-[320px] sm:w-[360px] lg:w-[380px] flex-shrink-0 bg-white/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm"
                      >
                        <div className="absolute top-3 right-3 opacity-10 pointer-events-none">
                          <Quote className="w-10 h-10" />
                        </div>

                        <CardHeader className="p-0 mb-2">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {review.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-foreground text-sm">{review.name}</h3>
                                  <p className="text-xs text-muted-foreground">{review.role}</p>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  review.type === 'student' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'
                                }`}>
                                  {review.type === 'student' ? 'Student' : 'Teacher'}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                {[...Array(review.rating)].map((_, si) => (
                                  <Star key={si} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0 pt-2">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            "{review.review}"
                          </p>
                          <div className="pt-2 border-t border-white/5 mt-3">
                            <p className="text-xs font-medium text-cyan-400">
                              {review.highlight}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Summary (unchanged) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <span className="text-lg font-semibold">4.9/5</span>
                <span className="text-muted-foreground">from 500+ reviews</span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="py-24 px-6 border-t border-white/5"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of learners who are already mastering their subjects with H&L.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white gap-2 cursor-pointer"
            >
              Start Learning Now <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-white/2 py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-cyan-500" />
                  <span className="font-semibold">H&L Learning</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered learning for the modern student.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <button 
                      onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                      className="hover:text-foreground transition text-left"
                    >
                      Materials
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                      className="hover:text-foreground transition text-left"
                    >
                      AI Chat
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                      className="hover:text-foreground transition text-left"
                    >
                      Flashcards
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                      className="hover:text-foreground transition text-left"
                    >
                      Quizzes
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <button 
                      onClick={() => navigate("/auth")}
                      className="hover:text-foreground transition text-left"
                    >
                      Sign In
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate("/auth")}
                      className="hover:text-foreground transition text-left"
                    >
                      Register
                    </button>
                  </li>
                  <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition">About</a></li>
                  <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                  <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm text-muted-foreground">
                © 2026 H&L Learning Assistant. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground mt-4 md:mt-0">
                Made for learners, by learners.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Public;
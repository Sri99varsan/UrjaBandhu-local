"use client";

// import { useAuth } from '@/components/auth/AuthProvider' - removed for direct access
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSpeechServices } from "@/hooks/useSpeechServices";
import {
  generateFestivalPrompt,
  getCurrentAndUpcomingFestivals,
} from "@/lib/festivals/festival-utils";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Calendar,
  Gift,
  IndianRupee,
  Mic,
  Send,
  Sparkles,
  TrendingUp,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

// Helper function to communicate with Gemini 2.5 Flash API
const callGeminiAPI = async (prompt: string): Promise<string> => {
  try {
    console.log(
      "Calling Gemini API with prompt:",
      prompt.substring(0, 100) + "..."
    );

    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      console.error("Gemini API error response:", errorData);
      throw new Error(
        `Failed to get response from Gemini API: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
};

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

export default function ChatbotLandingPage({
  initialQuery,
}: {
  initialQuery?: string | null;
}) {
  // User auth removed for direct access testing
  // const { user } = useAuth()
  const router = useRouter();
  const [animationPhase, setAnimationPhase] = useState<
    "entrance" | "analyzing" | "results"
  >("entrance");

  // Chat state
  const [inputMessage, setInputMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; text: string; sender: "user" | "bot" }>
  >([]);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);
  const [festivalSuggestions, setFestivalSuggestions] = useState<
    ReturnType<typeof getCurrentAndUpcomingFestivals>
  >([]);
  const [hasShownFestivalPrompt, setHasShownFestivalPrompt] = useState(false);

  // Enhanced speech services
  const speechServices = useSpeechServices();

  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      id: "power-usage",
      title: "Power Usage Analysis",
      description: "Analyzing current device consumption patterns",
      value: "2.4 kWh today",
      icon: Zap,
      completed: false,
    },
    {
      id: "spending",
      title: "Current Spending",
      description: "Calculating electricity costs and trends",
      value: "₹127 this month",
      icon: IndianRupee,
      completed: false,
    },
    {
      id: "prediction",
      title: "Month-end Prediction",
      description: "Forecasting usage and costs",
      value: "₹380 estimated",
      icon: TrendingUp,
      completed: false,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [initialBotResponse, setInitialBotResponse] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Load festival suggestions when component mounts
    const suggestions = getCurrentAndUpcomingFestivals();
    setFestivalSuggestions(suggestions);
  }, []);

  useEffect(() => {
    // If there's an initial query, skip entrance and go directly to analyzing
    if (initialQuery) {
      setAnimationPhase("analyzing");
      return;
    }

    // Entrance animation sequence
    const timer1 = setTimeout(() => {
      setAnimationPhase("analyzing");
    }, 2000);

    return () => clearTimeout(timer1);
  }, [initialQuery]); // Auto-show festival prompt when chat becomes available
  useEffect(() => {
    if (showChat && !hasShownFestivalPrompt && festivalSuggestions.length > 0) {
      const nearestFestival = festivalSuggestions[0];

      // Show festival prompt only if festival is within 7 days
      if (nearestFestival.daysUntil <= 7 && nearestFestival.daysUntil >= -1) {
        setTimeout(async () => {
          try {
            // Generate festival prompt using Gemini instead of static text
            const festivalPrompt = await callGeminiAPI(
              `Generate energy saving tips specific to the Indian festival ${nearestFestival.festival.name} 
              which is ${
                nearestFestival.daysUntil <= 0
                  ? "today"
                  : nearestFestival.daysUntil === 1
                    ? "tomorrow"
                    : `in ${nearestFestival.daysUntil} days`
              }. 
              Focus on practical ways to save electricity during festival celebrations. 
              Keep it concise (under 200 words) and friendly.`
            );

            const botMessage = {
              id: Date.now().toString(),
              text: festivalPrompt,
              sender: "bot" as const,
            };

            setChatMessages((prev) => [...prev, botMessage]);
            setHasShownFestivalPrompt(true);
          } catch (error) {
            console.error("Error generating festival prompt:", error);
            // Fall back to static prompt if Gemini fails
            const staticPrompt = generateFestivalPrompt();
            const botMessage = {
              id: Date.now().toString(),
              text: staticPrompt,
              sender: "bot" as const,
            };
            setChatMessages((prev) => [...prev, botMessage]);
            setHasShownFestivalPrompt(true);
          }
        }, 1500); // Delay to let user see the interface first
      }
    }
  }, [showChat, hasShownFestivalPrompt, festivalSuggestions]);

  useEffect(() => {
    if (animationPhase === "analyzing") {
      // Simulate analysis steps
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = prev + 1;

          // Mark current step as completed
          setAnalysisSteps((steps) =>
            steps.map((step, index) =>
              index === prev ? { ...step, completed: true } : step
            )
          );

          if (nextStep >= analysisSteps.length) {
            clearInterval(stepInterval);
            setTimeout(() => {
              setAnimationPhase("results");
              setShowChat(true);

              // Get initial response from Gemini
              getInitialResponse();
            }, 1000);
            return prev;
          }

          return nextStep;
        });
      }, 1500);

      return () => clearInterval(stepInterval);
    }
  }, [animationPhase, analysisSteps.length]);

  const navigateToFullDashboard = () => {
    // For testing purposes, navigate directly to dashboard without auth
    router.push("/dashboard");
    // Show a note about testing mode
    toast.success(
      "Navigating to dashboard in test mode (no authentication required)"
    );
  };

  // Function to get initial welcome response from Gemini
  const getInitialResponse = async () => {
    try {
      let prompt;
      if (initialQuery) {
        prompt = `The user has asked: "${initialQuery}". 
        Provide a friendly, informative initial response addressing their question about energy usage.
        Include some analysis of fictional energy usage data for an Indian household: current consumption (around 2.4 kWh today),
        monthly spending (around ₹127 so far), and a month-end prediction (around ₹380).
        Format your response to include these metrics with <strong> HTML tags around the numbers.
        Keep it under 150 words and make it sound like you've just analyzed their personal data.`;
      } else {
        prompt = `Provide a friendly welcome message as if you've just analyzed the user's energy usage data.
        Include some analysis of fictional energy usage data for an Indian household: current consumption (around 2.4 kWh today),
        monthly spending (around ₹127 so far), and a month-end prediction (around ₹380).
        Format your response to include these metrics with <strong> HTML tags around the numbers.
        Offer to help them reduce their electricity bill.
        Keep it under 150 words and make it sound like you've just analyzed their personal data.`;
      }

      const response = await callGeminiAPI(prompt);
      setInitialBotResponse(response);
    } catch (error) {
      console.error("Error getting initial response:", error);
      setInitialBotResponse(
        "Hello! I'm your energy assistant. I can help you analyze your energy usage and provide tips to reduce your electricity bill. What would you like to know?"
      );
    }
  };

  // Sync speech transcript with input message
  useEffect(() => {
    if (speechServices.transcript) {
      setInputMessage(speechServices.transcript);
      speechServices.clearTranscript();
    }
  }, [speechServices]);

  // Handle text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  // Handle sending message with optional TTS
  const handleSendMessage = async (withTTS: boolean = false) => {
    if (!inputMessage.trim() || isProcessingMessage) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user" as const,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsProcessingMessage(true);

    // Clear input
    const messageText = inputMessage;
    setInputMessage("");

    try {
      // Call Gemini API with just the user's message - no history/context
      const response = await callGeminiAPI(messageText);

      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "bot" as const,
      };

      setChatMessages((prev) => [...prev, botResponse]);

      // Optional: Speak the bot response
      if (withTTS) {
        setTimeout(() => {
          speechServices.speakText(response);
        }, 500);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "I'm having trouble connecting right now. Please try again in a moment.";

      const errorResponse = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: "bot" as const,
      };
      setChatMessages((prev) => [...prev, errorResponse]);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsProcessingMessage(false);
    }
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Handle speech input toggle
  const handleSpeechToggle = () => {
    if (speechServices.isListening) {
      speechServices.stopSpeechToText();
    } else {
      speechServices.startSpeechToText();
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/5 rounded-full blur-[100px]" />
      </div>
      <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0deg,rgba(34,197,94,0.05)_360deg)]" />

      {/* Main Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {/* Entrance Animation */}
        <AnimatePresence>
          {animationPhase === "entrance" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-center"
            >
              <div className="relative">
                {/* Glowing Effect */}
                <motion.div
                  className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 rounded-full scale-150"
                  animate={{
                    scale: [1.5, 1.8, 1.5],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Main Text */}
                <motion.div
                  className="relative bg-black/80 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 shadow-2xl"
                  initial={{ rotateX: -15 }}
                  animate={{ rotateX: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <motion.h1
                    className="text-4xl md:text-6xl font-bold text-white mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    Let&apos;s make{" "}
                    <motion.span
                      className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ backgroundSize: "200% 200%" }}
                    >
                      a miracle
                    </motion.span>
                  </motion.h1>
                </motion.div>
              </div>

              {/* User Avatar and Search Bar */}
              <motion.div
                className="flex items-center justify-center gap-4 mt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar className="h-12 w-12 border-2 border-green-400/50">
                    <AvatarFallback className="bg-green-500 text-black font-semibold">
                      {/* User avatar fallback - replaced with static content for testing */}
                      {"U"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 min-w-[300px]"
                  whileHover={{ scale: 1.02 }}
                >
                  <Brain className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300 flex-1">
                    Initializing energy analysis...
                  </span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-green-400" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Phase */}
        <AnimatePresence>
          {animationPhase === "analyzing" && (
            <motion.div
              className="w-full max-w-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-white mb-2">
                  Analyzing Your Energy Profile
                </h2>
                <p className="text-slate-400">
                  Please wait while I examine your electricity usage patterns
                </p>
              </motion.div>

              <div className="space-y-4">
                {analysisSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = step.completed;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.6 }}
                    >
                      <Card
                        className={cn(
                          "bg-black/60 backdrop-blur-sm border transition-all duration-500",
                          isActive
                            ? "border-green-400/50 shadow-lg shadow-green-400/20"
                            : "border-white/20",
                          isCompleted && "border-green-400/50"
                        )}
                      >
                        <CardContent className="p-6">
                          <motion.div
                            className="flex items-center gap-4"
                            animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            <motion.div
                              className={cn(
                                "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                                isCompleted
                                  ? "bg-green-500"
                                  : isActive
                                    ? "bg-green-500"
                                    : "bg-gray-700"
                              )}
                              animate={
                                isActive
                                  ? {
                                      boxShadow: [
                                        "0 0 0 0 rgba(34, 197, 94, 0.7)",
                                        "0 0 0 10px rgba(34, 197, 94, 0)",
                                        "0 0 0 0 rgba(34, 197, 94, 0)",
                                      ],
                                    }
                                  : {}
                              }
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </motion.div>

                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">
                                {step.title}
                              </h3>
                              <p className="text-slate-400 text-sm">
                                {step.description}
                              </p>
                            </div>

                            {isCompleted && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, ease: "backOut" }}
                              >
                                <Badge
                                  variant="secondary"
                                  className="bg-green-500/20 text-green-400 border-green-400/50"
                                >
                                  {step.value}
                                </Badge>
                              </motion.div>
                            )}

                            {isActive && (
                              <motion.div
                                className="flex items-center gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0,
                                  }}
                                />
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0.2,
                                  }}
                                />
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0.4,
                                  }}
                                />
                              </motion.div>
                            )}
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Phase with Chat Interface */}
        {animationPhase === "results" && (
          <motion.div
            className="w-full max-w-4xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Analysis Results */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.h2
                className="text-3xl font-bold text-white mb-2"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5, ease: "backOut" }}
              >
                Analysis Complete!
              </motion.h2>
              <p className="text-slate-400">
                Here&apos;s what I found about your energy usage
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {analysisSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 50, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      delay: 0.8 + index * 0.1,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      scale: 1.05,
                      rotateY: 5,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Card className="bg-black/60 backdrop-blur-sm border border-white/20">
                      <CardContent className="p-4 text-center">
                        <motion.div
                          whileHover={{ rotate: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-white">
                          {step.value}
                        </h3>
                        <p className="text-slate-400 text-sm">{step.title}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <Card className="bg-black/80 backdrop-blur-sm border border-white/20">
                <CardContent className="p-6">
                  <motion.div
                    className="flex items-start gap-4 mb-6"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    <motion.div
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(34, 197, 94, 0.4)",
                          "0 0 0 8px rgba(34, 197, 94, 0)",
                          "0 0 0 0 rgba(34, 197, 94, 0)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Brain className="h-5 w-5 text-black" />
                    </motion.div>
                    <div className="flex-1">
                      <motion.div
                        className="bg-gray-800/50 rounded-lg p-4 mb-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.6, duration: 0.5 }}
                      >
                        <motion.p
                          className="text-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.8, duration: 1 }}
                        >
                          {initialBotResponse ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: initialBotResponse,
                              }}
                            />
                          ) : initialQuery ? (
                            <>
                              Great question: &ldquo;
                              <em className="text-green-300">{initialQuery}</em>
                              &rdquo; <br />
                              <br />
                              I&apos;m analyzing your energy usage in response
                              to your query...
                              <div className="flex space-x-1 mt-2">
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0,
                                  }}
                                />
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0.2,
                                  }}
                                />
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0.4,
                                  }}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              Hello! I&apos;m analyzing your energy usage...
                              <div className="flex space-x-1 mt-2">
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0,
                                  }}
                                />
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0.2,
                                  }}
                                />
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0.4,
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </motion.p>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    className="flex flex-wrap gap-2 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.6 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setInputMessage(
                            "How can I save energy during festivals?"
                          )
                        }
                        className="bg-gray-800/50 border-white/20 hover:bg-gray-700 text-white"
                      >
                        <Gift className="h-4 w-4 mr-1" />
                        Festival Tips
                      </Button>
                    </motion.div>
                    {festivalSuggestions.length > 0 &&
                      festivalSuggestions[0].daysUntil <= 7 && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setInputMessage(
                                `Give me energy tips for ${festivalSuggestions[0].festival.name}`
                              )
                            }
                            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30 hover:from-purple-600/30 hover:to-pink-600/30 text-white"
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            {festivalSuggestions[0].festival.name} Tips
                            {festivalSuggestions[0].daysUntil <= 0 && (
                              <Badge className="ml-1 bg-green-500 text-black text-xs">
                                Today!
                              </Badge>
                            )}
                            {festivalSuggestions[0].daysUntil === 1 && (
                              <Badge className="ml-1 bg-yellow-500 text-black text-xs">
                                Tomorrow!
                              </Badge>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setInputMessage("Show me energy saving tips")
                        }
                        className="bg-gray-800/50 border-white/20 hover:bg-gray-700 text-white"
                      >
                        Show savings tips
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setInputMessage("Device breakdown analysis")
                        }
                        className="bg-gray-800/50 border-white/20 hover:bg-gray-700 text-white"
                      >
                        Device breakdown
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-800/50 border-white/20 hover:bg-gray-700 text-white"
                        onClick={navigateToFullDashboard}
                      >
                        Full dashboard
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Chat Messages Display */}
                  {chatMessages.length > 0 && (
                    <motion.div
                      className="mb-4 max-h-64 overflow-y-auto space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {chatMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{
                            opacity: 0,
                            x: message.sender === "user" ? 50 : -50,
                          }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.sender === "user"
                                ? "bg-green-500 text-black"
                                : "bg-gray-800/50 text-white"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              {message.sender === "user" ? (
                                <p className="text-sm flex-1">{message.text}</p>
                              ) : (
                                <div className="text-sm flex-1 prose prose-sm prose-invert max-w-none markdown-content">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                    components={{
                                      // Custom styling for markdown elements
                                      h1: ({ node, ...props }) => (
                                        <h1
                                          className="text-lg font-bold text-green-400 mb-2"
                                          {...props}
                                        />
                                      ),
                                      h2: ({ node, ...props }) => (
                                        <h2
                                          className="text-base font-semibold text-green-300 mb-2"
                                          {...props}
                                        />
                                      ),
                                      h3: ({ node, ...props }) => (
                                        <h3
                                          className="text-sm font-medium text-green-200 mb-1"
                                          {...props}
                                        />
                                      ),
                                      p: ({ node, ...props }) => (
                                        <p
                                          className="mb-2 last:mb-0"
                                          {...props}
                                        />
                                      ),
                                      ul: ({ node, ...props }) => (
                                        <ul
                                          className="list-disc list-inside mb-2 space-y-1"
                                          {...props}
                                        />
                                      ),
                                      ol: ({ node, ...props }) => (
                                        <ol
                                          className="list-decimal list-inside mb-2 space-y-1"
                                          {...props}
                                        />
                                      ),
                                      strong: ({ node, ...props }) => (
                                        <strong
                                          className="font-semibold text-green-300"
                                          {...props}
                                        />
                                      ),
                                      em: ({ node, ...props }) => (
                                        <em
                                          className="italic text-green-200"
                                          {...props}
                                        />
                                      ),
                                      code: ({ node, ...props }) => (
                                        <code
                                          className="bg-gray-700 text-green-300 px-1 py-0.5 rounded text-xs"
                                          {...props}
                                        />
                                      ),
                                      pre: ({ node, ...props }) => (
                                        <pre
                                          className="bg-gray-700 p-2 rounded text-xs overflow-x-auto"
                                          {...props}
                                        />
                                      ),
                                      blockquote: ({ node, ...props }) => (
                                        <blockquote
                                          className="border-l-2 border-green-400 pl-3 italic text-gray-300"
                                          {...props}
                                        />
                                      ),
                                      a: ({ node, ...props }) => (
                                        <a
                                          className="text-green-400 hover:text-green-300 underline"
                                          {...props}
                                        />
                                      ),
                                    }}
                                  >
                                    {message.text}
                                  </ReactMarkdown>
                                </div>
                              )}
                              {message.sender === "bot" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="ml-2 p-1 h-6 w-6 flex-shrink-0"
                                  onClick={() =>
                                    speechServices.speakText(message.text)
                                  }
                                  disabled={speechServices.isSpeaking}
                                >
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {isProcessingMessage && (
                        <motion.div
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-start"
                        >
                          <div className="bg-gray-800/50 text-white p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0,
                                  }}
                                />
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0.2,
                                  }}
                                />
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0.4,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-400">
                                AI is thinking...
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Speech Status Indicator */}
                  {(speechServices.isListening ||
                    speechServices.isProcessingAudio ||
                    speechServices.isSpeaking) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 flex items-center justify-center"
                    >
                      <div className="bg-gray-800/50 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        {speechServices.isListening && (
                          <>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                            >
                              <Mic className="h-4 w-4 text-red-400" />
                            </motion.div>
                            <span className="text-sm">Listening...</span>
                          </>
                        )}
                        {speechServices.isProcessingAudio && (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: "linear",
                              }}
                            >
                              <Brain className="h-4 w-4 text-blue-400" />
                            </motion.div>
                            <span className="text-sm">
                              Processing speech...
                            </span>
                          </>
                        )}
                        {speechServices.isSpeaking && (
                          <>
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                            >
                              <Volume2 className="h-4 w-4 text-purple-400" />
                            </motion.div>
                            <span className="text-sm">Speaking...</span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Input Area */}
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2, duration: 0.6 }}
                  >
                    <div className="flex-1 flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-3">
                      <input
                        type="text"
                        placeholder="Ask me anything about your energy usage..."
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        disabled={isProcessingMessage}
                        className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none disabled:opacity-50"
                      />
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`p-1 ${speechServices.isListening ? "bg-red-500/20" : ""}`}
                          onClick={handleSpeechToggle}
                          disabled={isProcessingMessage}
                          title={
                            speechServices.isListening
                              ? "Stop listening"
                              : "Start speech-to-text"
                          }
                        >
                          <Mic
                            className={`h-4 w-4 ${speechServices.isListening ? "text-red-400" : "text-green-400"}`}
                          />
                        </Button>
                      </motion.div>
                      {speechServices.isSpeaking && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1 bg-blue-500/20"
                            onClick={() => speechServices.stopSpeaking()}
                            title="Stop speaking"
                          >
                            <VolumeX className="h-4 w-4 text-blue-400" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 disabled:opacity-50"
                          onClick={() => handleSendMessage()}
                          disabled={!inputMessage.trim() || isProcessingMessage}
                          title="Send message"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-purple-500/20 border-purple-400/30 hover:bg-purple-500/30 disabled:opacity-50"
                          onClick={() => handleSendMessage(true)}
                          disabled={!inputMessage.trim() || isProcessingMessage}
                          title="Send message with speech response"
                        >
                          <Volume2 className="h-4 w-4 text-purple-400" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Continue to Dashboard */}
              <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={navigateToFullDashboard}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold shadow-lg shadow-green-500/25"
                  >
                    Continue to Full Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1f2937",
            color: "#ffffff",
            border: "1px solid rgba(34, 197, 94, 0.2)",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </div>
  );
}

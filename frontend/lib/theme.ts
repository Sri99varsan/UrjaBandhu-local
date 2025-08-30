// Global theme configuration for consistent UI/UX across the application

export const theme = {
    // Background patterns and base
    background: {
        base: "min-h-screen bg-black relative overflow-hidden",
        grid: "absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]",
        orbs: {
            topLeft: "absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse",
            bottomRight: "absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]",
            center: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/5 rounded-full blur-[100px]"
        },
        conic: "absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0deg,rgba(34,197,94,0.05)_360deg)]"
    },

    // Card styles for consistent glass morphism (dashboard pattern)
    cards: {
        primary: "bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl",
        secondary: "bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg",
        glass: "bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl",
        subtle: "bg-gray-800/50 backdrop-blur-sm rounded-lg border border-white/10",
        interactive: "hover:bg-gray-800/40 hover:border-green-500/40 transition-all duration-300"
    },

    // Text styles
    text: {
        primary: "text-white",
        secondary: "text-gray-300",
        muted: "text-gray-400",
        accent: "text-green-400",
        gradient: "bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent"
    },

    // Button styles
    buttons: {
        primary: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold rounded-lg shadow-lg shadow-green-500/25 transition-all duration-200",
        secondary: "bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500/50 hover:bg-white/15 hover:border-white/30 transition-all duration-200 shadow-lg",
        ghost: "bg-green-500/20 text-green-400 border-green-400/50 hover:bg-green-500/30 transition-all duration-200"
    },

    // Input styles
    inputs: {
        default: "bg-black/60 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500/50 placeholder-gray-400"
    },

    // Progress and status colors
    status: {
        success: "text-green-400 border-green-400/50 bg-green-500/20",
        warning: "text-yellow-400 border-yellow-400/50 bg-yellow-500/20",
        error: "text-red-400 border-red-400/50 bg-red-500/20",
        info: "text-blue-400 border-blue-400/50 bg-blue-500/20"
    },

    // Animation classes
    animations: {
        fadeIn: "animate-in fade-in duration-500",
        slideIn: "animate-in slide-in-from-bottom-4 duration-500",
        scaleIn: "animate-in zoom-in-95 duration-300"
    }
} as const
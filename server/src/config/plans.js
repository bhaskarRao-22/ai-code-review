export const PLANS = {
    free: {
      name: "Free",
      price: 0,
      monthlyCredits: 50,
      features: [
        "50 code reviews / month",
        "Basic AI (Gemini-Pro)",
        "Syntax + Quality checks"
      ]
    },
  
    pro: {
      name: "Pro",
      price: 999, // future Razorpay/Stripe integration
      monthlyCredits: 500,
      features: [
        "500 code reviews / month",
        "Advanced AI selection (Gemini, OpenAI, Claude, DeepSeek)",
        "Security + Performance checks",
        "Auto unit test generation",
        "Priority review queue"
      ]
    },
  
    team: {
      name: "Team",
      price: 2999,
      monthlyCredits: 3000,
      features: [
        "3000 credits shared across team",
        "All AI models enabled",
        "Team analytics",
        "Priority support"
      ]
    }
  };
  
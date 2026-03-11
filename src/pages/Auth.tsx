import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Phone, LogIn, UserPlus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/church/Header";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { otpService } from "@/lib/otpService";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORY_LABELS: Record<string, string> = {
  church_member: "Church Member",
  student: "Student",
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "church_member";
  const categoryLabel = CATEGORY_LABELS[category] ?? "Church Member";
  const { refreshProfile, isSimulated, loading: authLoading, signInSimulated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already in simulation mode or when auth finishes loading
  useEffect(() => {
    if (!authLoading && isSimulated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSimulated, authLoading, navigate]);

  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"details" | "otp">("details");
  
  // User details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  // OTP state
  const [otp, setOtp] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Handle signup with OTP verification
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || fullName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    
    if (!phone || phone.length < 9) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await otpService.generateOTP(phone, fullName.trim());
      
      if (result.success) {
        setGeneratedOTP(result.otp || "");
        setStep("otp");
        setOtpCountdown(300);
        startCountdown();
        toast.success(`Verification code: ${result.otp}`);
      } else {
        toast.error(result.error || "Failed to generate code");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle phone-only login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 9) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await otpService.loginWithPhone(phone);
      
      if (result.success && result.session_token) {
        // update context so AuthProvider knows we're logged in
        await signInSimulated(result.user, result.session_token);
        toast.success("Welcome back!");
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(result.error || "User not found. Please sign up first.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    
    try {
      const result = await otpService.verifyOTP(phone, otp);
      
      if (result.success && result.session_token) {
        await signInSimulated(result.user, result.session_token);
        toast.success("Account created! Welcome!");
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(result.error || "Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    const countdown = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (otpCountdown > 0) return;
    
    setLoading(true);
    try {
      const result = await otpService.generateOTP(phone, fullName.trim());
      
      if (result.success) {
        setGeneratedOTP(result.otp || "");
        setOtp("");
        setOtpCountdown(300);
        toast.success(`New code: ${result.otp}`);
        startCountdown();
      } else {
        toast.error(result.error || "Failed to resend");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetForm = () => {
    setStep("details");
    setFullName("");
    setPhone("");
    setOtp("");
    setGeneratedOTP("");
    setOtpCountdown(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <motion.div
          className="relative w-[90vw] sm:w-full max-w-md p-8 rounded-3xl text-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{
            backgroundImage: 'url(/sda_clean_super.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-church-blue/90 via-church-blue/85 to-church-blue-dark/90" />
          
          <div className="relative z-10">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-white/95 flex items-center justify-center mx-auto mb-6 shadow-lg overflow-hidden"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <img src="/sda_clean_super.png" alt="SDA Logo" className="w-10 h-10 object-contain" />
            </motion.div>

            <h1 className="text-2xl font-display text-white mb-1 drop-shadow-lg">
              Welcome
            </h1>
            <p className="text-xs font-semibold text-gold-light mb-1">Signing in as {categoryLabel}</p>
            <p className="text-sm text-white/80 mb-4">
              {step === "otp" ? "Verify your phone" : authMode === "login" ? "Sign in with your phone" : "Create your account"}
            </p>

            {step === "details" && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); resetForm(); }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                    authMode === "login" 
                      ? "bg-gold text-primary font-semibold" 
                      : "bg-white/20 text-white/70"
                  }`}
                >
                  <LogIn className="w-3 h-3" />
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); resetForm(); }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                    authMode === "signup" 
                      ? "bg-gold text-primary font-semibold" 
                      : "bg-white/20 text-white/70"
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  Sign Up
                </button>
              </div>
            )}

            <div className="space-y-4">
              {step === "details" ? (
                authMode === "signup" ? (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-3">
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="text-center text-lg h-14 rounded-xl border-border/50 bg-white/95 backdrop-blur-sm"
                      />
                      <Input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-center text-lg h-14 rounded-xl border-border/50 bg-white/95 backdrop-blur-sm"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 h-14 rounded-xl gradient-gold text-white font-semibold text-lg transition-transform disabled:opacity-50 shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? "Sending Code..." : "Send Verification Code"}
                      {!loading && <MessageCircle className="w-5 h-5" />}
                    </motion.button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Phone className="w-5 h-5 text-white/80" />
                        <span className="text-white/80 text-sm">Phone Number</span>
                      </div>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-center text-lg h-14 rounded-xl border-border/50 bg-white/95 backdrop-blur-sm"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 h-14 rounded-xl gradient-gold text-white font-semibold text-lg transition-transform disabled:opacity-50 shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </motion.button>
                  </form>
                )
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-white/80">
                      Enter the code sent to {phone}
                    </p>
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={(value) => setOtp(value)}
                        maxLength={6}
                        className="gap-2"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="h-12 w-10 bg-white/95" />
                          <InputOTPSlot index={1} className="h-12 w-10 bg-white/95" />
                          <InputOTPSlot index={2} className="h-12 w-10 bg-white/95" />
                          <InputOTPSlot index={3} className="h-12 w-10 bg-white/95" />
                          <InputOTPSlot index={4} className="h-12 w-10 bg-white/95" />
                          <InputOTPSlot index={5} className="h-12 w-10 bg-white/95" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 h-14 rounded-xl gradient-gold text-white font-semibold text-lg transition-transform disabled:opacity-50 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? "Verifying..." : "Verify & Sign Up"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </motion.button>
                  
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-white/60">Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={otpCountdown > 0 || loading}
                      className="text-gold-light hover:text-gold transition-colors disabled:opacity-50"
                    >
                      {otpCountdown > 0 ? `Resend in ${formatCountdown(otpCountdown)}` : "Resend Code"}
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => { setStep("details"); setOtp(""); setGeneratedOTP(""); }}
                    className="text-white/60 text-sm hover:text-white transition-colors"
                  >
                    Go Back
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;


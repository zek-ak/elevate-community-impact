import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/church/Header";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { otpService } from "@/lib/otpService";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "church_member";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      toast.error("Enter valid phone (255XXXXXXXXX)");
      return;
    }
    setLoading(true);
    const result = await otpService.generateOTP(phone);
    setLoading(false);
    if (result.success) {
      setStep("otp");
      setOtpCountdown(300);
      startCountdown();
      toast.success("OTP sent!");
    } else {
      toast.error(result.error);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const result = await otpService.verifyOTP(phone, otp);
      if (result.success) {
        toast.success("Logged in!");
        // navigation will cause AuthContext to fetch profile automatically
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      } else {
        toast.error(result.error || "Invalid OTP");
      }
    } catch (err) {
      toast.error("An error occurred during verification.");
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

  const resendOTP = async () => {
    if (otpCountdown > 0) return;
    await sendOTP({ preventDefault: () => {} } as any);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <motion.div
          className="w-full max-w-sm p-8 rounded-3xl shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
              <Phone className="w-8 h-8 text-blue-200" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === "otp" ? "Enter Code" : "Phone Verification"}
            </h1>
            <p className="text-blue-200 text-sm">
              {step === "otp" ? `Sent to ${phone}` : "Enter phone to receive OTP"}
            </p>

          {step === "phone" ? (
            <form onSubmit={sendOTP} className="space-y-4">
              <Input
                type="tel"
                placeholder="255712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="h-14 text-lg text-center rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-white/30 focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-gold to-amber-500 text-white font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div className="flex justify-center mb-4">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  className="gap-2"
                >
                  <InputOTPGroup>
                    <InputOTPSlot className="h-14 w-12 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/30 text-lg font-mono tracking-widest" />
                    <InputOTPSlot className="h-14 w-12 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/30 text-lg font-mono tracking-widest" />
                    <InputOTPSlot className="h-14 w-12 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/30 text-lg font-mono tracking-widest" />
                    <InputOTPSlot className="h-14 w-12 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/30 text-lg font-mono tracking-widest" />
                    <InputOTPSlot className="h-14 w-12 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/30 text-lg font-mono tracking-widest" />
                    <InputOTPSlot className="h-14 w-12 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/30 text-lg font-mono tracking-widest" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <motion.button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Continue to Dashboard"
                )}
              </motion.button>
              <div className="flex items-center justify-center gap-2 text-xs text-white/70">
                <span>Didn't get code?</span>
                <button
                  type="button"
                  onClick={resendOTP}
                  disabled={otpCountdown > 0 || loading}
                  className="text-gold hover:text-gold/80 font-semibold transition-colors disabled:opacity-50"
                >
                  {otpCountdown > 0 ? formatCountdown(otpCountdown) : "Resend"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-white/70 hover:text-white text-sm transition-colors py-2"
              >
                Change Phone
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  </div>
  );
};

export default Auth;

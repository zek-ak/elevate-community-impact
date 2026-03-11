
import { supabase } from "./supabase";

export interface OTPResponse {
  success: boolean;
  otp?: string;
  expires_at?: string;
  phone?: string;
  error?: string;
}

export interface VerifyResponse {
  success: boolean;
  session_token?: string;
  user_id?: string;
  user?: {
    id: string;
    full_name: string;
    phone: string;
    category: string;
  };
  expires_at?: string;
  error?: string;
}

export interface SessionValidation {
  valid: boolean;
  user_id?: string;
  user?: {
    id: string;
    full_name: string;
    phone: string;
    category: string;
  };
  expires_at?: string;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  session_token?: string;
  user_id?: string;
  user?: {
    id: string;
    full_name: string;
    phone: string;
    category: string;
  };
  expires_at?: string;
  error?: string;
}

class OTPService {
  /**
   * Generate internal OTP for signup verification
   */
  async generateOTP(phone: string, fullName?: string): Promise<OTPResponse> {
    try {
      const { data, error } = await supabase.rpc("generate_otp", {
        _phone: phone,
        _full_name: fullName || null,
      });

      if (error) {
        console.error("OTP generation error:", error);
        return { success: false, error: error.message };
      }

      return data as OTPResponse;
    } catch (error) {
      console.error("OTP generation error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate OTP" 
      };
    }
  }

  /**
   * Verify the OTP code and create a session (for signup)
   */
  async verifyOTP(phone: string, otpCode: string): Promise<VerifyResponse> {
    try {
      const { data, error } = await supabase.rpc("verify_otp", {
        _phone: phone,
        _otp_code: otpCode,
      });

      if (error) {
        console.error("OTP verification error:", error);
        return { success: false, error: error.message };
      }

      return data as VerifyResponse;
    } catch (error) {
      console.error("OTP verification error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to verify OTP" 
      };
    }
  }

  /**
   * Login with phone number only (no OTP required after signup)
   */
  async loginWithPhone(phone: string): Promise<LoginResponse> {
    try {
      const { data, error } = await supabase.rpc("login_with_phone", {
        _phone: phone,
      });

      if (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
      }

      return data as LoginResponse;
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to login" 
      };
    }
  }

  /**
   * Validate an existing session token
   */
  async validateSession(token: string): Promise<SessionValidation> {
    try {
      const { data, error } = await supabase.rpc("validate_session", {
        _token: token,
      });

      if (error) {
        console.error("Session validation error:", error);
        return { valid: false, error: error.message };
      }

      return data as SessionValidation;
    } catch (error) {
      console.error("Session validation error:", error);
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : "Failed to validate session" 
      };
    }
  }

  /**
   * Invalidate a session (logout)
   */
  async invalidateSession(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc("invalidate_session", {
        _token: token,
      });

      if (error) {
        console.error("Session invalidation error:", error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error("Session invalidation error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to invalidate session" 
      };
    }
  }

  /**
   * Check if a user exists for the given phone number
   */
  async getUserByPhone(phone: string): Promise<{ exists: boolean; user?: any }> {
    try {
      const { data, error } = await supabase.rpc("get_user_by_phone", {
        _phone: phone,
      });

      if (error) {
        console.error("Get user error:", error);
        return { exists: false };
      }

      return data;
    } catch (error) {
      console.error("Get user error:", error);
      return { exists: false };
    }
  }

  /**
   * Store session token in localStorage
   */
  setSessionToken(token: string): void {
    localStorage.setItem("session_token", token);
  }

  /**
   * Get session token from localStorage
   */
  getSessionToken(): string | null {
    return localStorage.getItem("session_token");
  }

  /**
   * Clear session token from localStorage
   */
  clearSessionToken(): void {
    localStorage.removeItem("session_token");
  }

  /**
   * Store user data in localStorage for simulation mode
   */
  setSimulatedUser(phone: string, userData: any): void {
    localStorage.setItem("simulated_phone", phone);
    localStorage.setItem("simulated_user", JSON.stringify(userData));
  }

  /**
   * Get simulated user from localStorage
   */
  getSimulatedUser(): { phone: string; user: any } | null {
    const phone = localStorage.getItem("simulated_phone");
    const userStr = localStorage.getItem("simulated_user");
    
    if (phone && userStr) {
      return { phone, user: JSON.parse(userStr) };
    }
    return null;
  }

  /**
   * Clear simulated user from localStorage
   */
  clearSimulatedUser(): void {
    localStorage.removeItem("simulated_phone");
    localStorage.removeItem("simulated_user");
  }

  /**
   * Check if running in simulation mode
   */
  isSimulationMode(): boolean {
    return localStorage.getItem("simulation_mode") === "true";
  }

  /**
   * Enable/disable simulation mode
   */
  setSimulationMode(enabled: boolean): void {
    if (enabled) {
      localStorage.setItem("simulation_mode", "true");
    } else {
      localStorage.removeItem("simulation_mode");
    }
  }
}

export const otpService = new OTPService();


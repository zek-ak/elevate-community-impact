import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { otpService } from "@/lib/otpService";
import type { Tables } from "@/types/supabase";

type Profile = Tables<"profiles">;
type AppRole = "super_admin" | "finance_admin" | "group_leader" | "member";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // new helper for OTP-based logins
  signInSimulated: (userData: any, token: string) => Promise<void>;
  isSimulated: boolean;
  sessionToken: string | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  roles: [],
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  isSimulated: false,
  sessionToken: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles(data?.map((r) => r.role) || []);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    // Invalidate the session token on the backend
    if (sessionToken) {
      await otpService.invalidateSession(sessionToken);
    }
    
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
    setIsSimulated(false);
    setSessionToken(null);
    localStorage.removeItem("simulated_phone");
    localStorage.removeItem("session_token");
    localStorage.removeItem("simulation_mode");
  };

  // helper to establish a simulated login (used by OTP flows)
  const signInSimulated = async (userData: any, token: string) => {
    const simulatedUser = {
      id: userData.id,
      email: null,
      phone: userData.phone,
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as User;

    setUser(simulatedUser);
    setIsSimulated(true);
    setSessionToken(token);
    localStorage.setItem("simulated_phone", userData.phone);
    localStorage.setItem("simulated_user", JSON.stringify(userData));
    localStorage.setItem("session_token", token);

    await fetchProfile(userData.id);
    setRoles([]); // no roles for simulated users
    setLoading(false);
  };

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check for simulation mode first
      const simulationMode = localStorage.getItem("simulation_mode") === "true";
      const simulatedPhone = localStorage.getItem("simulated_phone");
      
      if (simulationMode && simulatedPhone) {
        // Restore simulated session
        const simulatedUserData = localStorage.getItem("simulated_user");
        if (simulatedUserData) {
          const userData = JSON.parse(simulatedUserData);
          const simulatedUser = {
            id: userData.id,
            email: null,
            phone: simulatedPhone,
            app_metadata: {},
            user_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
          } as unknown as User;
          
          setUser(simulatedUser);
          setIsSimulated(true);
          setLoading(false);
          return;
        }
      }

      // Check for session token (non-Supabase session)
      const storedToken = localStorage.getItem("session_token");
      if (storedToken) {
        try {
          const validation = await otpService.validateSession(storedToken);
          if (validation.valid && validation.user) {
            // Restore session from token
            const tokenUser = {
              id: validation.user_id,
              email: null,
              phone: validation.user.phone,
              app_metadata: {},
              user_metadata: {},
              aud: "authenticated",
              created_at: new Date().toISOString(),
            } as unknown as User;
            
            setUser(tokenUser);
            setSessionToken(storedToken);
            await fetchProfile(validation.user_id!);
            setLoading(false);
            return;
          } else {
            // Token invalid/expired, clear it
            otpService.clearSessionToken();
          }
        } catch (error) {
          // Session token validation failed, clear it
          otpService.clearSessionToken();
        }
      }

      // Try Supabase's default session handling
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              setIsSimulated(false);
              // Use setTimeout to avoid Supabase client deadlock
              setTimeout(async () => {
                await fetchProfile(session.user.id);
                await fetchRoles(session.user.id);
                setLoading(false);
              }, 0);
            } else {
              setProfile(null);
              setRoles([]);
              setLoading(false);
            }
          }
        );

        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
          fetchRoles(session.user.id);
        }
        setLoading(false);

        return () => subscription.unsubscribe();
      } catch (error) {
        // Supabase is not available - enable demo mode automatically
        console.log("Supabase unavailable, enabling demo mode");
        otpService.setSimulationMode(true);
        
        // Create a demo user
        const demoUser = {
          id: "demo-user-001",
          full_name: "Demo User",
          phone: "+254700000000",
          category: "church_member",
        };
        
        localStorage.setItem("simulated_phone", demoUser.phone);
        localStorage.setItem("simulated_user", JSON.stringify(demoUser));
        
        const simulatedUser = {
          id: demoUser.id,
          email: null,
          phone: demoUser.phone,
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as unknown as User;
        
        setUser(simulatedUser);
        setIsSimulated(true);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile, 
      roles, 
      loading, 
      signOut, 
      refreshProfile, 
      isSimulated,
      sessionToken,
      signInSimulated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};


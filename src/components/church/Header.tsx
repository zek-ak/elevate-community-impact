import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, LayoutDashboard, Trophy, LogIn, LogOut, Shield, DollarSign, Users, Church } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const { user, roles, signOut } = useAuth();

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    ...(user
      ? [
          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
          ...(roles.includes("group_leader") || roles.includes("super_admin")
            ? [{ to: "/group-leader", label: "My Group", icon: Users }]
            : []),
          ...(roles.includes("finance_admin") || roles.includes("super_admin")
            ? [{ to: "/finance", label: "Finance", icon: DollarSign }]
            : []),
          ...(roles.includes("super_admin")
            ? [{ to: "/admin", label: "Admin", icon: Shield }]
            : []),
        ]
      : []),
  ];

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200"
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-church-blue flex items-center justify-center">
            <Church className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-lg text-church-blue hidden sm:block">Chuo Kikuu SDA</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "text-church-blue bg-church-blue/5" : "text-slate-600 hover:text-church-blue hover:bg-slate-50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-church-blue/10"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          {!user ? (
            <Link
              to="/auth"
              className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-church-blue text-white text-sm font-semibold transition-all hover:bg-church-blue-light hover:shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          ) : (
            <button
              onClick={signOut}
              className="ml-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-church-blue hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;

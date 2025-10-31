"use client";

import useAuth from "@/utils/useAuth";
import { LogOut } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -top-32 -left-32 animate-pulse"></div>
        <div
          className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl -bottom-32 -right-32 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full">
              <LogOut className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Sign Out</h1>
          <p className="text-slate-400 mb-8">
            Are you sure you want to sign out from your account?
          </p>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-300"
          >
            Sign Out
          </button>

          <p className="text-center text-slate-400 text-sm mt-4">
            <a
              href="/dashboard"
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Go back to dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

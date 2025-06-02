import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";

const DiscussionTab = () => (
  <div
    style={{
      borderRadius: "18px",
      overflow: "hidden",
      padding: "0",
      background:
        "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.85))",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
      position: "relative",
      transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
    }}
    className="dark:!bg-gradient-to-br dark:!from-gray-900/95 dark:!to-slate-900/90 dark:!border-slate-700/40 dark:!shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.2)]"
  >
    {/* Premium top accent bar */}
    <div
      style={{
        height: "3px",
        width: "100%",
        background: "linear-gradient(to right, #6366f1, #8b5cf6, #d946ef)",
        opacity: 0.8,
      }}
    ></div>
    <div className="p-5">
      <div className="relative w-16 h-16 mb-4 mx-auto">
        <div className="absolute inset-0 rounded-full bg-purple-100 dark:bg-purple-900/30 animate-pulse"></div>
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 opacity-20 blur-lg animate-pulse delay-100"></div>
        <div className="absolute inset-0 rounded-full flex items-center justify-center">
          <MessageSquare className="h-10 w-10 relative z-10 text-purple-500 dark:text-purple-400 animate-float" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 text-center">
        Join the Discussion
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mx-auto">
        Connect with other developers, share your approach, and learn
        alternative solutions.
      </p>
      <div className="mt-6 flex justify-center">
        <Button className="gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md shadow-purple-500/20">
          <MessageSquare className="h-3.5 w-3.5 mr-1" />
          View Discussion
        </Button>
      </div>
      <div className="mt-4 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 gap-1">
        <Users className="h-3 w-3 mr-1" />
        <span>328 developers participating</span>
      </div>
    </div>
  </div>
);

export default DiscussionTab;

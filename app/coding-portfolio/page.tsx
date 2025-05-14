"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CodingStatsCard } from "@/components/coding-portfolio/stats-card"
import { motion } from "framer-motion"
import { 
  ArrowRight, 
  Code, 
  Sparkles, 
  Laptop, 
  Globe, 
  Trophy,
  Shield,
  ChevronRight,
  GraduationCap,
  Star,
  ExternalLink
} from "lucide-react"

export default function CodingPortfolioPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-black">
        {/* Hero section with animated elements */}
        <div className="relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl transform rotate-12"></div>
          <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="container max-w-7xl py-12 md:py-16 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
                  Your Coding Portfolio
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed mb-6">
                  Showcase your expertise across multiple platforms with a unified coding portfolio
                  that highlights your achievements and growth.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/coding-portfolio/connect">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
                      <span>Manage Connections</span>
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/coding-portfolio/dashboard">
                    <Button size="lg" variant="outline" className="border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300">
                      <ExternalLink className="mr-2 h-4 w-4 text-indigo-500" />
                      <span>View Portfolio</span>
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Decorative coding illustration */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative hidden md:flex"
              >
                <div className="relative w-64 h-64 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/30 p-6 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 shadow-lg">
                  <div className="absolute -top-4 -right-4 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-indigo-100 dark:border-indigo-900/50">
                    <Sparkles className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="w-12 h-4 rounded-full bg-indigo-200 dark:bg-indigo-700 mb-2"></div>
                      <div className="w-20 h-4 rounded-full bg-purple-200 dark:bg-purple-700 mb-6"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-8 h-6 rounded bg-green-200 dark:bg-green-700 mr-2 flex items-center justify-center">
                          <Code className="h-3 w-3 text-green-700 dark:text-green-300" />
                        </div>
                        <div className="w-32 h-4 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-6 rounded bg-blue-200 dark:bg-blue-700 mr-2 flex items-center justify-center">
                          <Trophy className="h-3 w-3 text-blue-700 dark:text-blue-300" />
                        </div>
                        <div className="w-36 h-4 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-6 rounded bg-amber-200 dark:bg-amber-700 mr-2 flex items-center justify-center">
                          <Star className="h-3 w-3 text-amber-700 dark:text-amber-300" />
                        </div>
                        <div className="w-24 h-4 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Second decorative card */}
                <div className="absolute -right-16 bottom-8 w-52 h-40 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/30 p-4 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 shadow-lg transform rotate-6">
                  <div className="absolute -bottom-3 -left-3 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-purple-100 dark:border-purple-900/50">
                    <Shield className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex flex-col h-full">
                    <div className="w-16 h-3 rounded-full bg-purple-200 dark:bg-purple-700 mb-2"></div>
                    <div className="w-10 h-3 rounded-full bg-pink-200 dark:bg-pink-700 mb-3"></div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-24 h-16 rounded bg-white/50 dark:bg-slate-800/50 flex items-center justify-center">
                        <GraduationCap className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Divider with gradient and icon */}
        <div className="relative py-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-800 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-white dark:bg-black px-4 py-1">
              <Laptop className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
        </div>
        
        {/* Feature highlights */}
        <div className="container max-w-7xl py-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-indigo-400/5 rounded-bl-full transform -translate-y-4 translate-x-4 group-hover:-translate-y-2 group-hover:translate-x-2 transition-all duration-500"></div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl inline-flex mb-4">
                <Code className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-Platform Integration</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Connect all your coding profiles from major competitive platforms in one unified dashboard.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-purple-400/5 rounded-bl-full transform -translate-y-4 translate-x-4 group-hover:-translate-y-2 group-hover:translate-x-2 transition-all duration-500"></div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl inline-flex mb-4">
                <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Achievement Tracking</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Visualize your progress and track accomplishments across different coding platforms.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-blue-400/5 rounded-bl-full transform -translate-y-4 translate-x-4 group-hover:-translate-y-2 group-hover:translate-x-2 transition-all duration-500"></div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl inline-flex mb-4">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sharable Portfolio</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Create a professional portfolio to showcase your coding expertise to potential employers.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
} 
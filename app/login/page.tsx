"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Lock, LogIn, Shield, Sparkles, Users, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"

const demoAccounts = [
  {
    username: "superadmin",
    password: "super123",
    role: "Super Administrator",
    description: "Akses penuh ke semua fitur sistem",
    color: "bg-gradient-to-r from-red-500 to-pink-500",
    icon: Shield,
  },
  {
    username: "form_user",
    password: "form123",
    role: "Form User",
    description: "Dapat mengajukan konten baru",
    color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    icon: Users,
  },
  {
    username: "reviewer",
    password: "review123",
    role: "Content Reviewer",
    description: "Review dan approve konten",
    color: "bg-gradient-to-r from-green-500 to-emerald-500",
    icon: Settings,
  },
  {
    username: "validator",
    password: "validasi123",
    role: "Content Validator",
    description: "Validasi final konten",
    color: "bg-gradient-to-r from-yellow-500 to-orange-500",
    icon: Sparkles,
  },
  {
    username: "rekap_user",
    password: "rekap123",
    role: "Report User",
    description: "Akses laporan dan statistik",
    color: "bg-gradient-to-r from-purple-500 to-indigo-500",
    icon: Users,
  },
]

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const { isMobile, isInitialized } = useMobile()

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      router.push(isMobile ? "/mobile" : "/desktop")
    }
  }, [isAuthenticated, router, isMobile, isInitialized])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login({ username, password })
      if (result.success) {
        // Wait for mobile detection to be initialized before redirecting
        if (isInitialized) {
          router.push(isMobile ? "/mobile" : "/desktop")
        }
      } else {
        setError(result.error || "Login gagal")
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoAccount = (account: (typeof demoAccounts)[0]) => {
    setUsername(account.username)
    setPassword(account.password)
    setError("")
  }

  // Don't render until mobile detection is initialized to prevent hydration mismatch
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
          <span className="text-blue-600 font-medium">Memuat aplikasi...</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Platform Layanan Publik
              </h1>
              <p className="text-gray-600 mt-2">Diskominfo - Sistem Multi Role</p>
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Masuk ke Sistem</CardTitle>
                <CardDescription className="text-gray-600">
                  Gunakan akun demo di bawah atau masukkan kredensial Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-medium">
                      Username
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Masukkan username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 pr-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <LogIn className="h-4 w-4" />
                        <span>Masuk</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Demo Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <span>Akun Demo</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Klik untuk mengisi otomatis dan coba berbagai role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {demoAccounts.map((account, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    onClick={() => fillDemoAccount(account)}
                    className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 ${account.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200`}
                      >
                        <account.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {account.role}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{account.description}</div>
                        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                          {account.username} / {account.password}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center text-sm text-gray-500"
          >
            <p>© 2024 Diskominfo. Semua hak dilindungi.</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  Eye,
  Crown,
  Calendar,
  Activity,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import Swal from "sweetalert2"

interface User {
  id: number
  name: string
  username: string
  email: string
  email_verified_at: string
  role: "superadmin" | "admin" | "form" | "review" | "validasi" | "rekap"
  created_at: string
  updated_at: string
}

interface ApiUserResponse {
  success: boolean
  data: {
    current_page: number
    data: User[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

interface CreateUserRequest {
  name: string
  email: string
  username: string
  password: string
  role: string
}

const roleColors = {
  superadmin: "bg-purple-100 text-purple-800 border-purple-200",
  admin: "bg-red-100 text-red-800 border-red-200",
  form: "bg-gray-100 text-gray-800 border-gray-200",
  review: "bg-blue-100 text-blue-800 border-blue-200",
  validasi: "bg-green-100 text-green-800 border-green-200",
  rekap: "bg-yellow-100 text-yellow-800 border-yellow-200",
}

const roleIcons = {
  superadmin: Crown,
  admin: Crown,
  form: UserCheck,
  review: Eye,
  validasi: Shield,
  rekap: Activity,
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://be-savana.budiutamamandiri.com/api"

export default function RoleManagementPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "form" as User["role"],
  })

  // Get token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Create user via API
  const createUser = async (userData: CreateUserRequest) => {
    const token = getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  // Update user via API
  const updateUser = async (userId: number, userData: Partial<CreateUserRequest>) => {
    const token = getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  // Delete user via API
  const deleteUser = async (userId: number) => {
    const token = getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  // Fetch users from API
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)
      const token = getAuthToken()
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiUserResponse = await response.json()
      
      if (data.success && data.data) {
        setUsers(data.data.data)
        setCurrentPage(data.data.current_page)
        setTotalPages(data.data.last_page)
        setTotalUsers(data.data.total)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      Swal.fire({
        title: "Error",
        text: "Gagal memuat data pengguna. Menggunakan data contoh.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      })
      
      // Fallback to sample data if API fails
      const sampleUsers: User[] = [
        {
          id: 1,
          name: "Super Administrator",
          username: "superadmin",
          email: "superadmin@diskominfo.go.id",
          email_verified_at: "2024-01-15T00:00:00.000000Z",
          role: "superadmin",
          created_at: "2024-01-15T00:00:00.000000Z",
          updated_at: "2024-01-15T00:00:00.000000Z",
        },
        {
          id: 2,
          name: "Admin Utama",
          username: "admin_utama",
          email: "admin@diskominfo.go.id",
          email_verified_at: "2024-01-15T00:00:00.000000Z",
          role: "admin",
          created_at: "2024-01-15T00:00:00.000000Z",
          updated_at: "2024-01-15T00:00:00.000000Z",
        },
        {
          id: 3,
          name: "Content Reviewer",
          username: "reviewer_content",
          email: "reviewer@diskominfo.go.id",
          email_verified_at: "2024-01-16T00:00:00.000000Z",
          role: "review",
          created_at: "2024-01-16T00:00:00.000000Z",
          updated_at: "2024-01-16T00:00:00.000000Z",
        },
        {
          id: 4,
          name: "Validator Output",
          username: "validator_output",
          email: "validator@diskominfo.go.id",
          email_verified_at: "2024-01-17T00:00:00.000000Z",
          role: "validasi",
          created_at: "2024-01-17T00:00:00.000000Z",
          updated_at: "2024-01-17T00:00:00.000000Z",
        },
      ]
      setUsers(sampleUsers)
      setTotalUsers(sampleUsers.length)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.email || !newUser.password) {
      await Swal.fire({
        title: "Data Tidak Lengkap",
        text: "Nama, username, email, dan password harus diisi",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      })
      return
    }

    try {
      setCreating(true)
      
      const userData: CreateUserRequest = {
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
      }

      await createUser(userData)
      
      // Refresh the users list
      await fetchUsers()
      
      setNewUser({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "form",
      })
      setIsAddDialogOpen(false)

      await Swal.fire({
        title: "User Berhasil Ditambahkan",
        text: `${userData.name} telah ditambahkan sebagai ${userData.role}`,
        icon: "success",
        confirmButtonColor: "#10b981",
      })
    } catch (error) {
      console.error('Error creating user:', error)
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Gagal membuat user",
        icon: "error",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setNewUser({
      name: user.name,
      username: user.username,
      email: user.email,
      password: "", // Don't show existing password
      role: user.role,
    })
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      setCreating(true)
      
      const userData: Partial<CreateUserRequest> = {
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      }

      // Only include password if a new one was provided
      if (newUser.password) {
        userData.password = newUser.password
      }

      await updateUser(editingUser.id, userData)
      
      // Refresh the users list
      await fetchUsers()

      setEditingUser(null)
      setNewUser({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "form",
      })

      await Swal.fire({
        title: "User Berhasil Diupdate",
        text: "Data user telah berhasil diperbarui",
        icon: "success",
        confirmButtonColor: "#10b981",
      })
    } catch (error) {
      console.error('Error updating user:', error)
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Gagal mengupdate user",
        icon: "error",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    const result = await Swal.fire({
      title: "Hapus User?",
      text: `Apakah Anda yakin ingin menghapus ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    })

    if (result.isConfirmed) {
      try {
        await deleteUser(user.id)
        
        // Refresh the users list
        await fetchUsers()
        
        await Swal.fire({
          title: "User Dihapus",
          text: `${user.name} telah dihapus dari sistem`,
          icon: "success",
          confirmButtonColor: "#10b981",
        })
      } catch (error) {
        console.error('Error deleting user:', error)
        await Swal.fire({
          title: "Error",
          text: error instanceof Error ? error.message : "Gagal menghapus user",
          icon: "error",
          confirmButtonColor: "#ef4444",
        })
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Responsive Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={() => router.back()}
              className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 border-2 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>
            <Separator orientation="vertical" className="hidden sm:block h-4 sm:h-6" />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate">
                  Manajemen Role
                </h1>
                <p className="hidden sm:block text-sm lg:text-base text-gray-600 truncate">
                  Kelola pengguna dan hak akses sistem
                </p>
                <p className="sm:hidden text-xs text-gray-600 truncate">Kelola pengguna sistem</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size={isMobile ? "sm" : "default"}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Tambah User</span>
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
        >
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total User</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {totalUsers}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Admin</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.role === "admin" || u.role === "superadmin").length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Reviewer</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.role === "review").length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Validator</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.role === "validasi").length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur border-0 shadow-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur border-0 shadow-lg">
                <SelectValue placeholder="Semua Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="form">Form</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="validasi">Validasi</SelectItem>
                <SelectItem value="rekap">Rekap</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5" />
                Daftar Pengguna ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <span className="ml-3 text-gray-600">Memuat data pengguna...</span>
                </div>
              ) : (
                <>
                  {/* Mobile View */}
                  <div className="lg:hidden space-y-4 p-4">
                    {filteredUsers.map((user) => {
                      const RoleIcon = roleIcons[user.role]
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                <RoleIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-600">@{user.username}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={cn("text-xs", roleColors[user.role])}>{user.role}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(user.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} className="flex-1">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Hapus
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 font-semibold text-gray-700">User</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Role</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Dibuat</th>
                          <th className="text-center p-4 font-semibold text-gray-700">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => {
                          const RoleIcon = roleIcons[user.role]
                          return (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <RoleIcon className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-600">@{user.username}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="p-4">
                                <Badge className={cn("text-xs", roleColors[user.role])}>{user.role}</Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(user.created_at)}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredUsers.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada pengguna</h3>
                      <p className="text-gray-600">Belum ada pengguna yang sesuai dengan kriteria pencarian.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Add/Edit User Dialog */}
        <Dialog
          open={isAddDialogOpen || editingUser !== null}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false)
              setEditingUser(null)
              setNewUser({
                name: "",
                username: "",
                email: "",
                password: "",
                role: "form",
              })
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Tambah User Baru"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Perbarui informasi pengguna" : "Masukkan informasi pengguna baru"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Masukkan email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value: User["role"]) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="validasi">Validasi</SelectItem>
                    <SelectItem value="rekap">Rekap</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setEditingUser(null)
                  setNewUser({
                    name: "",
                    username: "",
                    email: "",
                    password: "",
                    role: "form",
                  })
                }}
                className="flex-1"
                disabled={creating}
              >
                Batal
              </Button>
              <Button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingUser ? "Memperbarui..." : "Menambahkan..."}
                  </>
                ) : (
                  editingUser ? "Update" : "Tambah User"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

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
import { Switch } from "@/components/ui/switch"
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
  UserX,
  Eye,
  Crown,
  Mail,
  Phone,
  Calendar,
  Activity,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import Swal from "sweetalert2"

interface User {
  id: number
  name: string
  email: string
  phone: string
  role: "admin" | "reviewer" | "validator" | "user"
  status: "active" | "inactive"
  createdAt: string
  lastLogin?: string
  permissions: string[]
}

const roleColors = {
  admin: "bg-red-100 text-red-800 border-red-200",
  reviewer: "bg-blue-100 text-blue-800 border-blue-200",
  validator: "bg-green-100 text-green-800 border-green-200",
  user: "bg-gray-100 text-gray-800 border-gray-200",
}

const roleIcons = {
  admin: Crown,
  reviewer: Eye,
  validator: Shield,
  user: UserCheck,
}

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-red-100 text-red-800 border-red-200",
}

export default function RoleManagementPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user" as User["role"],
    status: "active" as User["status"],
    permissions: [] as string[],
  })

  // Sample data
  useEffect(() => {
    const sampleUsers: User[] = [
      {
        id: 1,
        name: "Admin Utama",
        email: "admin@diskominfo.go.id",
        phone: "081234567890",
        role: "admin",
        status: "active",
        createdAt: "2024-01-15",
        lastLogin: "2024-01-20",
        permissions: ["create", "read", "update", "delete", "manage_users"],
      },
      {
        id: 2,
        name: "Reviewer Content",
        email: "reviewer@diskominfo.go.id",
        phone: "081234567891",
        role: "reviewer",
        status: "active",
        createdAt: "2024-01-16",
        lastLogin: "2024-01-19",
        permissions: ["read", "review_content"],
      },
      {
        id: 3,
        name: "Validator Output",
        email: "validator@diskominfo.go.id",
        phone: "081234567892",
        role: "validator",
        status: "active",
        createdAt: "2024-01-17",
        lastLogin: "2024-01-18",
        permissions: ["read", "validate_output"],
      },
      {
        id: 4,
        name: "User Biasa",
        email: "user@diskominfo.go.id",
        phone: "081234567893",
        role: "user",
        status: "inactive",
        createdAt: "2024-01-18",
        permissions: ["read"],
      },
    ]
    setUsers(sampleUsers)
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      await Swal.fire({
        title: "Data Tidak Lengkap",
        text: "Nama dan email harus diisi",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      })
      return
    }

    const user: User = {
      id: Date.now(),
      ...newUser,
      createdAt: new Date().toISOString().split("T")[0],
      permissions: getDefaultPermissions(newUser.role),
    }

    setUsers([...users, user])
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "user",
      status: "active",
      permissions: [],
    })
    setIsAddDialogOpen(false)

    await Swal.fire({
      title: "User Berhasil Ditambahkan",
      text: `${user.name} telah ditambahkan sebagai ${user.role}`,
      icon: "success",
      confirmButtonColor: "#10b981",
    })
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      permissions: user.permissions,
    })
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    const updatedUsers = users.map((user) =>
      user.id === editingUser.id ? { ...user, ...newUser, permissions: getDefaultPermissions(newUser.role) } : user,
    )

    setUsers(updatedUsers)
    setEditingUser(null)
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "user",
      status: "active",
      permissions: [],
    })

    await Swal.fire({
      title: "User Berhasil Diupdate",
      text: "Data user telah berhasil diperbarui",
      icon: "success",
      confirmButtonColor: "#10b981",
    })
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
      setUsers(users.filter((u) => u.id !== user.id))
      await Swal.fire({
        title: "User Dihapus",
        text: `${user.name} telah dihapus dari sistem`,
        icon: "success",
        confirmButtonColor: "#10b981",
      })
    }
  }

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active"
    const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    setUsers(updatedUsers)

    await Swal.fire({
      title: `User ${newStatus === "active" ? "Diaktifkan" : "Dinonaktifkan"}`,
      text: `${user.name} telah ${newStatus === "active" ? "diaktifkan" : "dinonaktifkan"}`,
      icon: "success",
      confirmButtonColor: "#10b981",
    })
  }

  const getDefaultPermissions = (role: User["role"]): string[] => {
    switch (role) {
      case "admin":
        return ["create", "read", "update", "delete", "manage_users"]
      case "reviewer":
        return ["read", "review_content"]
      case "validator":
        return ["read", "validate_output"]
      default:
        return ["read"]
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
                {/* Mobile subtitle */}
                <p className="sm:hidden text-xs text-gray-600 truncate">Kelola pengguna sistem</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size={isMobile ? "sm" : "default"}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg self-start sm:self-auto"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline sm:hidden lg:inline">Tambah User</span>
            <span className="xs:hidden sm:inline lg:hidden">Tambah</span>
            <span className="hidden xs:inline sm:hidden">+</span>
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total User</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Admin</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Aktif</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.status === "active").length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Tidak Aktif</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.status === "inactive").length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <UserX className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama atau email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] border-gray-200">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Role</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="validator">Validator</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] border-gray-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table/Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Daftar Pengguna ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isMobile ? (
                // Mobile Card Layout
                <div className="space-y-4 p-4">
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => {
                      const RoleIcon = roleIcons[user.role]
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                <RoleIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.status === "active"}
                                onCheckedChange={() => toggleUserStatus(user)}
                                size="sm"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex gap-2">
                              <Badge className={cn("text-xs", roleColors[user.role])}>{user.role}</Badge>
                              <Badge className={cn("text-xs", statusColors[user.status])}>{user.status}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(user.createdAt)}</span>
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                // Desktop Table Layout
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">User</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Role</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Kontak</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Bergabung</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Login Terakhir</th>
                        <th className="text-center p-4 font-semibold text-gray-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredUsers.map((user, index) => {
                          const RoleIcon = roleIcons[user.role]
                          return (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <RoleIcon className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-600">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge className={cn("text-xs", roleColors[user.role])}>{user.role}</Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Badge className={cn("text-xs", statusColors[user.status])}>{user.status}</Badge>
                                  <Switch
                                    checked={user.status === "active"}
                                    onCheckedChange={() => toggleUserStatus(user)}
                                    size="sm"
                                  />
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Mail className="h-3 w-3" />
                                    <span>{user.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    <span>{user.phone}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(user.createdAt)}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-gray-600">
                                  {user.lastLogin ? formatDate(user.lastLogin) : "Belum pernah"}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada user ditemukan</h3>
                  <p className="text-gray-600">Coba ubah filter pencarian atau tambah user baru</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Add/Edit User Dialog */}
        <Dialog
          open={isAddDialogOpen || !!editingUser}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false)
              setEditingUser(null)
              setNewUser({
                name: "",
                email: "",
                phone: "",
                role: "user",
                status: "active",
                permissions: [],
              })
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Tambah User Baru"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Ubah informasi user" : "Masukkan informasi user baru"}
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
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: User["role"]) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="validator">Validator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newUser.status}
                  onValueChange={(value: User["status"]) => setNewUser({ ...newUser, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
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
                    email: "",
                    phone: "",
                    role: "user",
                    status: "active",
                    permissions: [],
                  })
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {editingUser ? "Update" : "Tambah"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

import { Monitor, Loader2 } from "lucide-react"

export default function DesktopLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mx-auto w-20 h-20 flex items-center justify-center">
          <Monitor className="h-10 w-10 text-white" />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Memuat Desktop Dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">Menyiapkan antarmuka desktop</p>
      </div>
    </div>
  )
}

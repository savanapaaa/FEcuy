export default function RoleManagementLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Stats Skeleton */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
                <div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  <div className="mt-3">
                    <div className="w-20 h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="flex space-x-2">
                      <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-20 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

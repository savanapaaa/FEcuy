"use client"

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { checkApiHealth } from '@/lib/api-tester'
import { Wifi, WifiOff, Database, HardDrive } from 'lucide-react'

interface DataSourceStatusProps {
  className?: string
}

export default function DataSourceStatus({ className = "" }: DataSourceStatusProps) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkStatus = async () => {
    const serverStatus = await checkApiHealth()
    setIsServerAvailable(serverStatus)
    setIsOnline(navigator.onLine)
    setLastCheck(new Date())
  }

  useEffect(() => {
    // Initial check
    checkStatus()

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      checkStatus()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setIsServerAvailable(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getStatus = () => {
    if (isOnline === false) {
      return {
        variant: "destructive" as const,
        icon: <WifiOff className="h-3 w-3" />,
        text: "Offline - Using Cache",
        color: "bg-red-100 text-red-800"
      }
    }
    
    if (isServerAvailable === true) {
      return {
        variant: "default" as const,
        icon: <Database className="h-3 w-3" />,
        text: "Server Connected",
        color: "bg-green-100 text-green-800"
      }
    }
    
    if (isServerAvailable === false) {
      return {
        variant: "secondary" as const,
        icon: <HardDrive className="h-3 w-3" />,
        text: "Server Unavailable - Cache Only",
        color: "bg-yellow-100 text-yellow-800"
      }
    }
    
    return {
      variant: "outline" as const,
      icon: <Wifi className="h-3 w-3 animate-pulse" />,
      text: "Checking...",
      color: "bg-gray-100 text-gray-800"
    }
  }

  const status = getStatus()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={status.variant} className={`flex items-center gap-1 ${status.color}`}>
        {status.icon}
        {status.text}
      </Badge>
      
      {lastCheck && (
        <span className="text-xs text-gray-500">
          Last check: {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}

// Hook untuk menggunakan status koneksi
export function useDataSourceStatus() {
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(true)

  useEffect(() => {
    const checkStatus = async () => {
      const serverStatus = await checkApiHealth()
      setIsServerAvailable(serverStatus)
      setIsOnline(navigator.onLine)
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    isServerAvailable,
    isUsingCache: !isOnline || !isServerAvailable
  }
}

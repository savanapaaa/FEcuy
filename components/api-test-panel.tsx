"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiTester, checkApiHealth, logApiConfig } from '@/lib/api-tester'
import { Badge } from '@/components/ui/badge'

export default function ApiTestPanel() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testConnection = async () => {
    setIsLoading(true)
    addLog('Testing API connection...')
    
    const connected = await checkApiHealth()
    setIsConnected(connected)
    
    if (connected) {
      addLog('✅ API connection successful!')
    } else {
      addLog('❌ API connection failed!')
    }
    
    setIsLoading(false)
  }

  const runFullTest = async () => {
    setIsLoading(true)
    setLogs([])
    
    // Override console.log to capture logs
    const originalLog = console.log
    const originalError = console.error
    
    console.log = (...args) => {
      addLog(args.join(' '))
      originalLog(...args)
    }
    
    console.error = (...args) => {
      addLog('ERROR: ' + args.join(' '))
      originalError(...args)
    }
    
    try {
      await ApiTester.runTestSuite()
    } catch (error) {
      addLog('Test suite failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
    
    // Restore console
    console.log = originalLog
    console.error = originalError
    
    setIsLoading(false)
  }

  const showConfig = () => {
    setLogs([])
    logApiConfig()
    
    addLog('🔧 API Configuration:')
    addLog(`- Base URL: ${process.env.NEXT_PUBLIC_API_URL}`)
    addLog(`- Max File Size: ${process.env.NEXT_PUBLIC_MAX_FILE_SIZE || 'Not set'}`)
    addLog(`- Allowed File Types: ${process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'Not set'}`)
    addLog(`- Default Page Size: ${process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || 'Not set'}`)
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 API Integration Test Panel
          {isConnected !== null && (
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Test backend API connectivity and endpoints for development
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testConnection} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
          
          <Button 
            onClick={runFullTest} 
            disabled={isLoading}
            variant="default"
          >
            {isLoading ? "Running..." : "Run Full Test"}
          </Button>
          
          <Button 
            onClick={showConfig} 
            variant="secondary"
          >
            Show Config
          </Button>
          
          <Button 
            onClick={clearLogs} 
            variant="ghost"
          >
            Clear Logs
          </Button>
        </div>

        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          <p className="font-semibold mb-2">Quick Integration Checklist:</p>
          <ul className="space-y-1">
            <li>✅ Environment variables configured</li>
            <li>✅ CORS headers added to Next.js config</li>
            <li>✅ API client with proper error handling</li>
            <li>✅ Authentication token management</li>
            <li>🔍 Test all endpoints accessibility</li>
            <li>🔍 Verify response formats match frontend expectations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

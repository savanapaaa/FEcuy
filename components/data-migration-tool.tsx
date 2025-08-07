"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { loadSubmissionsFromStorage, saveSubmissionsToStorage } from '@/lib/utils'
import { createSubmission } from '@/lib/api-client'
import { CheckCircle, XCircle, Upload, Database } from 'lucide-react'

interface MigrationResult {
  total: number
  success: number
  failed: number
  errors: string[]
}

export default function DataMigrationTool() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const migrateLocalDataToServer = async () => {
    setIsLoading(true)
    setProgress(0)
    setResult(null)
    setLogs([])

    try {
      // Load all local data
      const localSubmissions = loadSubmissionsFromStorage()
      
      if (localSubmissions.length === 0) {
        addLog("No local data found to migrate")
        setIsLoading(false)
        return
      }

      addLog(`Found ${localSubmissions.length} submissions in local storage`)

      const migrationResult: MigrationResult = {
        total: localSubmissions.length,
        success: 0,
        failed: 0,
        errors: []
      }

      // Migrate each submission
      for (let i = 0; i < localSubmissions.length; i++) {
        const submission = localSubmissions[i]
        
        try {
          addLog(`Migrating submission ${i + 1}/${localSubmissions.length}: ${submission.judul || submission.title || 'Untitled'}`)
          
          // Remove local-only fields
          const cleanSubmission = { ...submission }
          delete cleanSubmission.id // Let server generate new ID
          delete cleanSubmission.createdAt
          delete cleanSubmission.updatedAt
          delete cleanSubmission.lastModified

          // Create on server
          const response = await createSubmission(cleanSubmission)
          
          if (response.success) {
            migrationResult.success++
            addLog(`✅ Successfully migrated: ${submission.judul || submission.title || 'Untitled'}`)
          } else {
            migrationResult.failed++
            migrationResult.errors.push(`Failed to migrate: ${submission.judul || submission.title || 'Untitled'}`)
            addLog(`❌ Failed to migrate: ${submission.judul || submission.title || 'Untitled'}`)
          }
        } catch (error) {
          migrationResult.failed++
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          migrationResult.errors.push(`Error migrating ${submission.judul || submission.title || 'Untitled'}: ${errorMsg}`)
          addLog(`❌ Error migrating: ${errorMsg}`)
        }

        // Update progress
        setProgress(((i + 1) / localSubmissions.length) * 100)
      }

      setResult(migrationResult)
      addLog(`Migration completed: ${migrationResult.success} success, ${migrationResult.failed} failed`)

      // If all successful, optionally clear local storage
      if (migrationResult.failed === 0) {
        addLog("All data migrated successfully! Local storage can be cleared.")
      }

    } catch (error) {
      addLog(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setIsLoading(false)
  }

  const clearLocalStorage = () => {
    saveSubmissionsToStorage([])
    addLog("Local storage cleared")
    setResult(null)
  }

  const localData = loadSubmissionsFromStorage()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Migration Tool
        </CardTitle>
        <CardDescription>
          Migrate data from localStorage to backend server
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Local Data Status */}
        <Alert>
          <Upload className="h-4 w-4" />
          <AlertDescription>
            Found <strong>{localData.length}</strong> submissions in local storage that can be migrated to server.
          </AlertDescription>
        </Alert>

        {/* Migration Controls */}
        <div className="flex gap-4">
          <Button 
            onClick={migrateLocalDataToServer} 
            disabled={isLoading || localData.length === 0}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isLoading ? "Migrating..." : "Migrate to Server"}
          </Button>
          
          {result && result.failed === 0 && (
            <Button 
              onClick={clearLocalStorage} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Clear Local Storage
            </Button>
          )}
        </div>

        {/* Progress */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Migration Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{result.total}</div>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-5 w-5" />
                  {result.success}
                </div>
                <p className="text-xs text-muted-foreground">Successful</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
                  <XCircle className="h-5 w-5" />
                  {result.failed}
                </div>
                <p className="text-xs text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
          <h4 className="font-semibold mb-2">Migration Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>This tool will migrate all localStorage data to your backend server</li>
            <li>Each submission will be created as a new record on the server</li>
            <li>Local IDs will be replaced with server-generated IDs</li>
            <li>After successful migration, you can clear local storage</li>
            <li>Future operations will use the server as primary storage</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

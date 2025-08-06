# Laravel Sanctum Login Test Script for PowerShell
# This script demonstrates the correct workflow for Laravel Sanctum authentication

Write-Host "=== Laravel Sanctum Login Test ===" -ForegroundColor Green
Write-Host

# Step 1: Get CSRF Cookie
Write-Host "Step 1: Getting CSRF Cookie..." -ForegroundColor Yellow

try {
    # Create a session to persist cookies
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    
    # Get CSRF cookie
    $csrfResponse = Invoke-WebRequest -Uri 'https://be-savana.budiutamamandiri.com/sanctum/csrf-cookie' `
        -Method GET `
        -Headers @{
            'Accept' = 'application/json'
            'Content-Type' = 'application/json'
        } `
        -WebSession $session
    
    Write-Host "CSRF Response Status: $($csrfResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "Cookies received: $($session.Cookies.Count)" -ForegroundColor Cyan
    
    # Find XSRF-TOKEN cookie
    $xsrfCookie = $null
    foreach ($cookie in $session.Cookies.GetCookies('https://be-savana.budiutamamandiri.com')) {
        if ($cookie.Name -eq 'XSRF-TOKEN') {
            $xsrfCookie = $cookie
            break
        }
    }
    
    if ($null -eq $xsrfCookie) {
        Write-Host "❌ XSRF-TOKEN not found in cookies!" -ForegroundColor Red
        exit 1
    }
    
    # URL decode the token
    $decodedToken = [System.Web.HttpUtility]::UrlDecode($xsrfCookie.Value)
    Write-Host "Extracted XSRF-TOKEN: $($decodedToken.Substring(0, [Math]::Min(20, $decodedToken.Length)))..." -ForegroundColor Cyan
    Write-Host
    
    # Step 2: Login with CSRF token
    Write-Host "Step 2: Logging in with CSRF token..." -ForegroundColor Yellow
    
    $loginBody = @{
        username = "superadmin"
        password = "super123"
    } | ConvertTo-Json
    
    $loginHeaders = @{
        'Accept' = 'application/json'
        'Content-Type' = 'application/json'
        'X-Requested-With' = 'XMLHttpRequest'
        'X-XSRF-TOKEN' = $decodedToken
        'X-CSRF-TOKEN' = $decodedToken
    }
    
    Write-Host "Login headers:" -ForegroundColor Cyan
    $loginHeaders | Format-Table
    
    $loginResponse = Invoke-WebRequest -Uri 'https://be-savana.budiutamamandiri.com/api/auth/login' `
        -Method POST `
        -Headers $loginHeaders `
        -Body $loginBody `
        -WebSession $session
    
    Write-Host "Login Response Status: $($loginResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Login Response Body:" -ForegroundColor Cyan
    Write-Host $loginResponse.Content
    
} catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Response Content: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

Write-Host
Write-Host "=== Test Complete ===" -ForegroundColor Green

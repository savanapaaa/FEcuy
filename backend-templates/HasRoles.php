<?php

namespace App\Traits;

trait HasRoles
{
    /**
     * Check if user has a specific role
     */
    public function hasRole(string|array $roles): bool
    {
        if (is_string($roles)) {
            return $this->role === $roles;
        }
        
        return in_array($this->role, $roles);
    }
    
    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole(['admin', 'superadmin']);
    }
    
    /**
     * Check if user is reviewer
     */
    public function isReviewer(): bool
    {
        return $this->hasRole(['reviewer', 'admin', 'superadmin']);
    }
    
    /**
     * Check if user is validator
     */
    public function isValidator(): bool
    {
        return $this->hasRole(['validator', 'admin', 'superadmin']);
    }
    
    /**
     * Get role display name
     */
    public function getRoleDisplayName(): string
    {
        return match($this->role) {
            'admin' => 'Administrator',
            'superadmin' => 'Super Administrator',
            'user' => 'User',
            'reviewer' => 'Content Reviewer',
            'validator' => 'Content Validator',
            'form' => 'Form Manager',
            'review' => 'Review Manager',
            'validasi' => 'Validation Manager',
            'rekap' => 'Report Manager',
            default => ucfirst($this->role)
        };
    }
}

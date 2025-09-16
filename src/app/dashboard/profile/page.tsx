'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import CountrySelect from '@/components/CountrySelect'
import { User, CountryCode } from '@/types'
import { validateEmail, validatePhone, validatePassword } from '@/lib/validation'
import { countryCodes } from '@/lib/countries'

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find(c => c.code === 'US') || countryCodes[0]
  )

  const [editForm, setEditForm] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setEditForm({
            fullName: data.user.fullName,
            businessName: data.user.businessName,
            email: data.user.email,
            phone: data.user.phone.replace(/^\+\d+/, '') // Remove country code
          })
          
          // Set country based on phone number
          const phoneCountry = countryCodes.find(c => data.user.phone.startsWith(c.dialCode))
          if (phoneCountry) {
            setSelectedCountry(phoneCountry)
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: { [key: string]: string } = {}
    
    if (!editForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!editForm.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    }
    
    if (!validateEmail(editForm.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!validatePhone(editForm.phone)) {
      newErrors.phone = 'Invalid phone number'
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsSaving(true)

    try {
      const token = localStorage.getItem('authToken')
      const fullPhoneNumber = `${selectedCountry.dialCode}${editForm.phone}`
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editForm,
          phone: fullPhoneNumber
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsEditing(false)
        alert('Profile updated successfully!')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: { [key: string]: string } = {}
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    
    const passwordValidation = validatePassword(passwordForm.newPassword)
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.errors[0]
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsSaving(true)

    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordForm)
      })

      if (response.ok) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setIsChangingPassword(false)
        alert('Password changed successfully!')
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to change password')
      }
    } catch (error: any) {
      console.error('Failed to change password:', error)
      alert(error.message || 'Failed to change password. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
                    disabled={isSaving}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Business Name</label>
                  <input
                    type="text"
                    value={editForm.businessName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, businessName: e.target.value }))}
                    className={`form-input ${errors.businessName ? 'border-red-500' : ''}`}
                    disabled={isSaving}
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                    disabled={isSaving}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                  {!user.isEmailVerified && (
                    <p className="mt-1 text-sm text-amber-600">Email not verified</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <div className="flex">
                    <CountrySelect
                      selectedCountry={selectedCountry}
                      onCountryChange={setSelectedCountry}
                    />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className={`form-input rounded-l-none flex-1 ${errors.phone ? 'border-red-500' : ''}`}
                      disabled={isSaving}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                  {!user.isPhoneVerified && (
                    <p className="mt-1 text-sm text-amber-600">Phone not verified</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setErrors({})
                  }}
                  className="btn-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Full Name</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{user.fullName}</div>
              </div>

              <div>
                <label className="form-label">Business Name</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{user.businessName}</div>
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center justify-between">
                  <span>{user.email}</span>
                  {user.isEmailVerified ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-600 text-sm">Not verified</span>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center justify-between">
                  <span>{user.phone}</span>
                  {user.isPhoneVerified ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-600 text-sm">Not verified</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-600">Manage your password and security settings</p>
            </div>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="btn-secondary"
              >
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              <div>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className={`form-input ${errors.currentPassword ? 'border-red-500' : ''}`}
                  disabled={isSaving}
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={`form-input ${errors.newPassword ? 'border-red-500' : ''}`}
                  disabled={isSaving}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={isSaving}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })
                    setErrors({})
                  }}
                  className="btn-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSaving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-600">Last changed: Never</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">Subscription Plan</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 capitalize">
                {user.subscriptionPlan}
              </div>
            </div>

            <div>
              <label className="form-label">Status</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.subscriptionStatus === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : user.subscriptionStatus === 'trial'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.subscriptionStatus}
                </span>
              </div>
            </div>

            <div>
              <label className="form-label">Expires</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                {new Date(user.subscriptionExpiry).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Actions */}
        {(!user.isEmailVerified || !user.isPhoneVerified) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-4">Verification Required</h2>
            <p className="text-amber-800 mb-4">
              Please verify your contact information to ensure account security and receive important updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {!user.isEmailVerified && (
                <button className="btn-primary bg-amber-600 hover:bg-amber-700">
                  Verify Email
                </button>
              )}
              {!user.isPhoneVerified && (
                <button className="btn-primary bg-amber-600 hover:bg-amber-700">
                  Verify Phone
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage

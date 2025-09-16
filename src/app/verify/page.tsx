'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const VerifyPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const verificationType = searchParams.get('type') || 'registration'

  useEffect(() => {
    // Mark verification as sent when page loads
    setVerificationSent(true)
  }, [])

  const handleEmailVerification = async () => {
    if (!emailCode.trim()) {
      setErrors({ email: 'Please enter the verification code' })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: emailCode })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Email verified successfully!')
        // Check if phone is also verified, then redirect to dashboard
        checkBothVerifications()
      } else {
        setErrors({ email: result.message || 'Invalid verification code. Please try again.' })
      }
    } catch (error) {
      setErrors({ email: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneVerification = async () => {
    if (!phoneCode.trim()) {
      setErrors({ phone: 'Please enter the verification code' })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: phoneCode })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Phone verified successfully!')
        // Check if email is also verified, then redirect to dashboard
        checkBothVerifications()
      } else {
        setErrors({ phone: result.message || 'Invalid verification code. Please try again.' })
      }
    } catch (error) {
      setErrors({ phone: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const checkBothVerifications = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const result = await response.json()
      if (result.success && result.user.isEmailVerified && result.user.isPhoneVerified) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
    }
  }

  const handleSkipVerification = () => {
    // Allow users to skip verification for now and go to dashboard
    router.push('/dashboard')
  }

  const resendEmailCode = async () => {
    try {
      // TODO: Implement resend email API
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      alert('Verification email sent!')
    } catch (error) {
      alert('Failed to resend email. Please try again.')
    }
  }

  const resendPhoneCode = async () => {
    try {
      // TODO: Implement resend phone API
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      alert('Verification SMS sent!')
    } catch (error) {
      alert('Failed to resend SMS. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">QR Menu</span>
          </Link>

          <h2 className="text-3xl font-bold text-gray-900">Verify Your Account</h2>
          <p className="mt-2 text-gray-600">
            {verificationType === 'registration' 
              ? 'Please verify your email and phone number to complete registration'
              : 'Please verify your identity to continue'
            }
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Success Message */}
          {verificationSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">Verification codes sent!</p>
                  <p className="text-sm text-green-700">Check your email and phone for verification codes.</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Verification */}
          <div className="space-y-4">
            <div>
              <label className="form-label flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Verification Code
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  className="form-input flex-1"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleEmailVerification}
                  disabled={isLoading}
                  className="btn-primary px-4 py-2 whitespace-nowrap"
                >
                  Verify Email
                </button>
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
              <button
                type="button"
                onClick={resendEmailCode}
                className="text-sm text-primary-600 hover:text-primary-700 mt-2"
              >
                Didn't receive the code? Resend email
              </button>
            </div>
          </div>

          {/* Phone Verification */}
          <div className="space-y-4">
            <div>
              <label className="form-label flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone Verification Code
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  className="form-input flex-1"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handlePhoneVerification}
                  disabled={isLoading}
                  className="btn-primary px-4 py-2 whitespace-nowrap"
                >
                  Verify Phone
                </button>
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
              )}
              <button
                type="button"
                onClick={resendPhoneCode}
                className="text-sm text-primary-600 hover:text-primary-700 mt-2"
              >
                Didn't receive the code? Resend SMS
              </button>
            </div>
          </div>

          {/* Skip Verification Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSkipVerification}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800 py-2"
            >
              Skip verification for now and continue to dashboard
            </button>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <p className="text-gray-600">
            Need to use a different account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyPage

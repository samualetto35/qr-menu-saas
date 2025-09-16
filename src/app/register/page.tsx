'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CountrySelect from '@/components/CountrySelect'
import { RegisterData, CountryCode, FormErrors } from '@/types'
import { validateEmail, validatePhone, validatePassword, validateRequired, validateConfirmPassword } from '@/lib/validation'
import { countryCodes } from '@/lib/countries'

const RegisterPage: React.FC = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find(c => c.code === 'US') || countryCodes[0]
  )

  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field: keyof RegisterData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field])
  }

  const validateField = (field: keyof RegisterData, value: string) => {
    let error: string | undefined

    switch (field) {
      case 'fullName':
        error = validateRequired(value, 'Full name')
        break
      case 'businessName':
        error = validateRequired(value, 'Business name')
        break
      case 'email':
        error = validateRequired(value, 'Email')
        if (!error && !validateEmail(value)) {
          error = 'Please enter a valid email address'
        }
        break
      case 'phone':
        error = validateRequired(value, 'Phone number')
        if (!error && !validatePhone(value)) {
          error = 'Please enter a valid phone number'
        }
        break
      case 'password':
        const passwordValidation = validatePassword(value)
        if (!passwordValidation.isValid) {
          error = passwordValidation.errors[0]
        }
        break
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value)
        break
    }

    setErrors(prev => ({ ...prev, [field]: error }))
    return !error
  }

  const validateForm = (): boolean => {
    const fields: (keyof RegisterData)[] = [
      'fullName',
      'businessName', 
      'email',
      'phone',
      'password',
      'confirmPassword'
    ]

    let isValid = true
    const newErrors: FormErrors = {}
    const validationResults: { [key: string]: any } = {}

    fields.forEach(field => {
      const fieldValid = validateField(field, formData[field])
      validationResults[field] = {
        value: formData[field],
        valid: fieldValid,
        error: errors[field]
      }
      if (!fieldValid) {
        isValid = false
      }
    })

    console.log('Form validation results:', validationResults)
    console.log('Overall form valid:', isValid)

    // Show the first validation error to user
    if (!isValid) {
      const firstError = Object.values(validationResults).find(result => !result.valid)
      if (firstError) {
        setErrors({ submit: `Validation failed: ${firstError.error || 'Please check your input'}` })
      }
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted!', formData)
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    setIsLoading(true)
    console.log('Starting registration...')

    try {
      // Simulate API call
      const fullPhoneNumber = `${selectedCountry.dialCode}${formData.phone}`
      
      console.log('Sending request to API...')
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phone: fullPhoneNumber,
          countryCode: selectedCountry.code
        }),
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('API result:', result)

      if (result.success) {
        // Store token and redirect to verification
        if (result.token) {
          localStorage.setItem('authToken', result.token)
          console.log('Token stored, redirecting to verification...')
        }
        router.push('/verify?type=registration')
      } else {
        console.log('Registration failed:', result.message)
        setErrors({ submit: result.message || 'Registration failed' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldError = (field: keyof RegisterData) => {
    return touched[field] ? errors[field] : undefined
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
            <span className="text-xl font-bold text-gray-900">QR Menu</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Start your 7-day free trial today
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="form-label">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                className={`form-input ${getFieldError('fullName') ? 'border-red-500' : ''}`}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {getFieldError('fullName') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('fullName')}</p>
              )}
            </div>

            {/* Business Name */}
            <div>
              <label className="form-label">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                onBlur={() => handleBlur('businessName')}
                className={`form-input ${getFieldError('businessName') ? 'border-red-500' : ''}`}
                placeholder="Enter your business name"
                disabled={isLoading}
              />
              {getFieldError('businessName') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('businessName')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`form-input ${getFieldError('email') ? 'border-red-500' : ''}`}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {getFieldError('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="form-label">
                Phone Number
              </label>
              <div className="flex">
                <CountrySelect
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={`form-input rounded-l-none flex-1 ${getFieldError('phone') ? 'border-red-500' : ''}`}
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                />
              </div>
              {getFieldError('phone') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`form-input pr-12 ${getFieldError('password') ? 'border-red-500' : ''}`}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    className="w-5 h-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`form-input pr-12 ${getFieldError('confirmPassword') ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <svg
                    className="w-5 h-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showConfirmPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {getFieldError('confirmPassword') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Terms */}
            <p className="text-sm text-gray-600 text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

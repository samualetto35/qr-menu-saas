export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  // Relaxed requirements - just need length
  // You can uncomment these for stronger security:
  
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter')
  // }
  
  // if (!/[a-z]/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter')
  // }
  
  // if (!/\d/.test(password)) {
  //   errors.push('Password must contain at least one number')
  // }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateRequired = (value: string, fieldName: string): string | undefined => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`
  }
  return undefined
}

export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  return undefined
}

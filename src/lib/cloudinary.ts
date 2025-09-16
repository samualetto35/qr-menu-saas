// Cloudinary configuration (server-side only)
let cloudinary: any = null

// Only import on server side
if (typeof window === 'undefined') {
  const { v2 } = require('cloudinary')
  cloudinary = v2
}

// Configure Cloudinary (only on server side)
if (cloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

/**
 * Upload a QR code image to Cloudinary
 */
export async function uploadQRCode(
  imageBuffer: Buffer,
  menuId: string
): Promise<string> {
  if (!cloudinary) {
    throw new Error('Cloudinary not available on client side')
  }

  try {
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'qr-menu-saas/qr-codes',
      public_id: `qr-${menuId}`,
      format: 'png',
      overwrite: true,
      resource_type: 'image'
    })

    return result.secure_url
  } catch (error) {
    console.error('Failed to upload QR code to Cloudinary:', error)
    throw new Error('Failed to upload QR code')
  }
}

/**
 * Upload a menu item image to Cloudinary
 */
export async function uploadMenuItemImage(
  imageBuffer: Buffer,
  menuId: string,
  itemId: string
): Promise<string> {
  if (!cloudinary) {
    throw new Error('Cloudinary not available on client side')
  }

  try {
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `qr-menu-saas/menu-items/${menuId}`,
      public_id: `item-${itemId}`,
      format: 'jpg',
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 300, crop: 'fill', quality: 'auto' }
      ]
    })

    return result.secure_url
  } catch (error) {
    console.error('Failed to upload menu item image to Cloudinary:', error)
    throw new Error('Failed to upload menu item image')
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  if (!cloudinary) {
    return // Skip on client side
  }

  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error)
    // Don't throw error for deletion failures
  }
}

/**
 * Generate a signed upload URL for client-side uploads
 */
export function generateSignedUploadUrl(folder: string): {
  uploadUrl: string
  uploadPreset: string
  signature: string
  timestamp: number
} {
  if (!cloudinary) {
    throw new Error('Cloudinary not available on client side')
  }

  const timestamp = Math.round(new Date().getTime() / 1000)
  const params = {
    timestamp,
    folder,
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'qr-menu-saas'
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    uploadPreset: params.upload_preset,
    signature,
    timestamp
  }
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
    format?: string
  } = {}
): string {
  if (!cloudinary) {
    return publicId // Return as-is if cloudinary not available
  }

  const {
    width = 400,
    height = 300,
    quality = 'auto',
    format = 'auto'
  } = options

  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality,
    format,
    fetch_format: 'auto'
  })
}

export default cloudinary

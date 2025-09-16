import QRCode from 'qrcode'

// Check if we should use cloud storage
function useCloudStorage() {
  return !!process.env.CLOUDINARY_CLOUD_NAME
}

// Server-side only imports
let fs: any = null
let path: any = null
let QR_DIR: string = ''
let uploadQRCode: any = null

if (typeof window === 'undefined') {
  fs = require('fs')
  path = require('path')
  QR_DIR = path.join(process.cwd(), 'public', 'qr-codes')
  
  // Only setup local storage if not using cloud
  if (!useCloudStorage()) {
    // Ensure QR codes directory exists
    if (!fs.existsSync(QR_DIR)) {
      fs.mkdirSync(QR_DIR, { recursive: true })
    }
  } else {
    // Import cloud storage function
    import('./cloudinary').then(module => {
      uploadQRCode = module.uploadQRCode
    })
  }
}

export interface QRCodeOptions {
  size?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

// Generate QR code as base64 data URL
export const generateQRCodeBase64 = async (
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> => {
  try {
    const qrOptions = {
      width: options.size || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      }
    }

    const dataURL = await QRCode.toDataURL(text, qrOptions)
    return dataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

// Generate QR code and save as file (server-side only)
export const generateQRCodeFile = async (
  text: string,
  filename: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  if (typeof window !== 'undefined') {
    throw new Error('QR code file generation can only be used on the server side')
  }

  try {
    const qrOptions = {
      width: options.size || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      }
    }

    const filePath = path.join(QR_DIR, `${filename}.png`)
    await QRCode.toFile(filePath, text, qrOptions)
    
    // Return the public URL
    return `/qr-codes/${filename}.png`
  } catch (error) {
    console.error('Error generating QR code file:', error)
    throw new Error('Failed to generate QR code file')
  }
}

// Generate menu QR code with custom styling
export const generateMenuQRCode = async (
  menuId: string,
  menuName: string
): Promise<{ base64: string; fileUrl: string }> => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const menuUrl = `${baseUrl}/menu/${menuId}`
  
  const options: QRCodeOptions = {
    size: 400,
    margin: 3,
    color: {
      dark: '#1f2937', // Gray-800
      light: '#ffffff'
    }
  }

  try {
    // Always generate base64 for immediate display
    const base64 = await generateQRCodeBase64(menuUrl, options)
    
    let fileUrl: string
    
    if (useCloudStorage()) {
      // Production: Upload to Cloudinary
      if (!uploadQRCode) {
        const cloudinaryModule = await import('./cloudinary')
        uploadQRCode = cloudinaryModule.uploadQRCode
      }
      
      // Convert base64 to buffer for upload
      const base64Data = base64.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      
      fileUrl = await uploadQRCode(buffer, menuId)
    } else {
      // Development: Save to local file
      const filename = `menu-${menuId}-${Date.now()}`
      fileUrl = await generateQRCodeFile(menuUrl, filename, options)
    }

    return { base64, fileUrl }
  } catch (error) {
    console.error('Error generating menu QR code:', error)
    throw new Error('Failed to generate menu QR code')
  }
}

// Client-side functions for download and print
export const downloadQRCode = (dataUrl: string, filename: string = 'qr-code.png') => {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const printQRCode = (dataUrl: string, menuName: string) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>QR Code - ${menuName}</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .qr-container {
          text-align: center;
          border: 2px solid #000;
          padding: 20px;
          background: white;
        }
        .qr-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        .qr-subtitle {
          font-size: 16px;
          margin-bottom: 20px;
          color: #666;
        }
        .qr-image {
          display: block;
          margin: 0 auto 20px;
          border: 1px solid #ddd;
        }
        .qr-instructions {
          font-size: 14px;
          color: #888;
          max-width: 300px;
        }
        @media print {
          body { margin: 0; }
          .qr-container { border: 2px solid #000; }
        }
      </style>
    </head>
    <body>
      <div class="qr-container">
        <div class="qr-title">${menuName}</div>
        <div class="qr-subtitle">Scan to View Menu</div>
        <img src="${dataUrl}" alt="QR Code" class="qr-image" />
        <div class="qr-instructions">
          Point your phone camera at this QR code to view our digital menu
        </div>
      </div>
    </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.focus()
  
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}

// Clean up old QR code files (optional utility - server-side only)
export const cleanupOldQRCodes = async (maxAgeHours: number = 24): Promise<void> => {
  if (typeof window !== 'undefined') {
    return // Can't run on client side
  }

  try {
    if (!fs || !path) return
    
    const files = fs.readdirSync(QR_DIR)
    const maxAge = Date.now() - (maxAgeHours * 60 * 60 * 1000)

    for (const file of files) {
      const filePath = path.join(QR_DIR, file)
      const stats = fs.statSync(filePath)
      
      if (stats.mtime.getTime() < maxAge) {
        fs.unlinkSync(filePath)
        console.log(`Cleaned up old QR code: ${file}`)
      }
    }
  } catch (error) {
    console.error('Error cleaning up QR codes:', error)
  }
}
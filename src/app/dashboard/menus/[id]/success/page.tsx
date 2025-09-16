'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Menu } from '@/types'
import { generateQRCodeBase64, downloadQRCode, printQRCode } from '@/lib/qr-generator'

const MenuSuccessPage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const [menu, setMenu] = useState<Menu | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  useEffect(() => {
    const loadMenuAndGenerateQR = async () => {
      try {
        const menuId = params.id as string
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          router.push('/login')
          return
        }

        // Fetch menu from API
        const response = await fetch('/api/menus', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const result = await response.json()
        
        if (!result.success) {
          router.push('/dashboard/menus')
          return
        }

        const foundMenu = result.menus.find((m: Menu) => m.id === menuId)
        
        if (!foundMenu) {
          router.push('/dashboard/menus')
          return
        }

        setMenu(foundMenu)
        
        // Use the QR code that was already generated when menu was created
        if (foundMenu.qrCode) {
          setQrCodeDataUrl(foundMenu.qrCode)
        } else {
          // Fallback: generate QR code if not present
          setIsGeneratingQR(true)
          const qrCode = await generateQRCodeBase64(foundMenu.url, {
            size: 256,
            margin: 4,
            color: {
              dark: '#1f2937',
              light: '#ffffff'
            }
          })
          
          setQrCodeDataUrl(qrCode)
        }
        
      } catch (error) {
        console.error('Failed to load menu or generate QR:', error)
      } finally {
        setIsLoading(false)
        setIsGeneratingQR(false)
      }
    }

    loadMenuAndGenerateQR()
  }, [params.id, router])

  const handleDownload = () => {
    if (qrCodeDataUrl && menu) {
      downloadQRCode(qrCodeDataUrl, `${menu.name}-qr-code.png`)
    }
  }

  const handlePrint = () => {
    if (qrCodeDataUrl && menu) {
      printQRCode(qrCodeDataUrl, menu.name)
    }
  }

  const handleCopyUrl = async () => {
    if (menu) {
      try {
        await navigator.clipboard.writeText(menu.url)
        alert('Menu URL copied to clipboard!')
      } catch (error) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = menu.url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Menu URL copied to clipboard!')
      }
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your menu...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!menu) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Menu Not Found</h1>
          <p className="text-gray-600 mb-6">The menu you're looking for doesn't exist.</p>
          <Link href="/dashboard/menus" className="btn-primary">
            Back to Menus
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Menu Created Successfully!</h1>
          <p className="text-lg text-gray-600">
            Your QR menu is ready to use. Download or print the QR code below.
          </p>
        </div>

        {/* QR Code Display */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* QR Code */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your QR Code</h2>
              
              {isGeneratingQR ? (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Generating QR...</p>
                  </div>
                </div>
              ) : qrCodeDataUrl ? (
                <div className="w-64 h-64 border border-gray-200 rounded-lg p-4 mx-auto mb-6 bg-white">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <p className="text-gray-500">Failed to generate QR code</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleDownload}
                  disabled={!qrCodeDataUrl}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-8V4" />
                  </svg>
                  Download QR
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!qrCodeDataUrl}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print QR
                </button>
              </div>
            </div>

            {/* Menu Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Menu Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Menu Name</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                    {menu.name}
                  </div>
                </div>

                {menu.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700">
                      {menu.description}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Menu URL</label>
                  <div className="mt-1 flex gap-2">
                    <div className="flex-1 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm break-all">
                      {menu.url}
                    </div>
                    <button
                      onClick={handleCopyUrl}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Copy URL"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Categories</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-2xl font-bold text-primary-600">
                      {menu.categories.length}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Items</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-2xl font-bold text-primary-600">
                      {menu.categories.reduce((sum, cat) => sum + cat.items.length, 0)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Template</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700">
                    {menu.template.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Print Your QR Code</h4>
                <p className="text-sm text-gray-600">Download and print the QR code to place on your tables, walls, or anywhere customers can see it.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Test Your Menu</h4>
                <p className="text-sm text-gray-600">Scan the QR code with your phone to see how customers will view your menu.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Track Analytics</h4>
                <p className="text-sm text-gray-600">Monitor how many people scan your QR code and view your menu in the analytics dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={menu.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-center"
          >
            Preview Menu
          </Link>
          
          <Link
            href={`/dashboard/menus/${menu.id}`}
            className="btn-secondary text-center"
          >
            Edit Menu
          </Link>
          
          <Link
            href="/dashboard/menus"
            className="btn-secondary text-center"
          >
            Back to Menus
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MenuSuccessPage

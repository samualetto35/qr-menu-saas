'use client'

import { useEffect } from 'react'
import { FontOption } from '@/types'

interface FontLoaderProps {
  fonts: FontOption[]
}

const FontLoader: React.FC<FontLoaderProps> = ({ fonts }) => {
  useEffect(() => {
    // Load Google Fonts dynamically
    const loadedFonts = new Set<string>()

    fonts.forEach(font => {
      if (!loadedFonts.has(font.id)) {
        const link = document.createElement('link')
        link.href = font.googleFontUrl
        link.rel = 'stylesheet'
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
        loadedFonts.add(font.id)
      }
    })

    // Cleanup function to remove fonts when component unmounts
    return () => {
      fonts.forEach(font => {
        if (loadedFonts.has(font.id)) {
          const existingLink = document.querySelector(`link[href="${font.googleFontUrl}"]`)
          if (existingLink) {
            document.head.removeChild(existingLink)
          }
        }
      })
    }
  }, [fonts])

  return null // This component doesn't render anything
}

export default FontLoader

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { CountryCode } from '@/types'
import { countryCodes } from '@/lib/countries'

interface CountrySelectProps {
  selectedCountry: CountryCode
  onCountryChange: (country: CountryCode) => void
  className?: string
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  selectedCountry,
  onCountryChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-l-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg">{getFlagEmoji(selectedCountry.code)}</span>
        <span className="text-sm font-medium text-gray-700">
          {selectedCountry.dialCode}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl mt-1">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-3 text-center text-gray-500">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                    selectedCountry.code === country.code
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-900'
                  }`}
                  onClick={() => {
                    onCountryChange(country)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                >
                  <span className="text-lg">{getFlagEmoji(country.code)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{country.name}</div>
                    <div className="text-sm text-gray-500">{country.dialCode}</div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <svg
                      className="w-4 h-4 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CountrySelect

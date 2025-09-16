'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Hero: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Create your restaurant's{' '}
                <span className="text-primary-600">QR menu</span> in minutes
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                No coding. No stress. Just sign up, build, and print your QR.
                Transform your restaurant with contactless digital menus that customers love.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/register"
                  className="btn-primary text-center text-lg px-8 py-4"
                >
                  Get Started Free
                </Link>
                <button className="btn-secondary text-center text-lg px-8 py-4 flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V17M9 10v4a4 4 0 008 0v-2M9 10V9a4 4 0 118 0v1M9 10H8a4 4 0 000 8v-2"
                    />
                  </svg>
                  Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No setup fees
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  7-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Cancel anytime
                </div>
              </div>
            </div>

            {/* Right Content - Mock Screenshots */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Phone Mockup */}
                <div className="bg-gray-900 rounded-3xl p-2 mx-auto max-w-sm transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-white rounded-2xl p-6 space-y-4">
                    <div className="text-center">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Bella Vista Restaurant</h3>
                      <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Menu Categories */}
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 mb-2">🍝 Main Dishes</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Spaghetti Carbonara</span>
                            <span className="font-medium">$18</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Grilled Salmon</span>
                            <span className="font-medium">$24</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 mb-2">🍷 Beverages</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>House Wine</span>
                            <span className="font-medium">$8</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Craft Beer</span>
                            <span className="font-medium">$6</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Mockup */}
                <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-4 transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                  <div className="w-20 h-20 bg-gray-900 rounded-lg mb-2"></div>
                  <div className="text-xs text-gray-600 text-center">Scan Me!</div>
                </div>

                {/* Analytics Mockup */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="text-xs text-gray-600 mb-2">Today's Scans</div>
                  <div className="text-2xl font-bold text-primary-600">247</div>
                  <div className="text-xs text-green-600">↗ +12%</div>
                </div>
              </div>

              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-100 rounded-3xl transform rotate-6 -z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-accent-50 to-primary-50 rounded-3xl transform -rotate-3 -z-20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

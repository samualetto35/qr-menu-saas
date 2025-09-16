'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Menu, MenuAnalytics } from '@/types'

const AnalyticsPage: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [analytics, setAnalytics] = useState<MenuAnalytics[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          console.error('No auth token found')
          return
        }

        // Fetch real menus and analytics
        const [menusResponse, analyticsResponse] = await Promise.all([
          fetch('/api/menus', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/analytics/summary', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        const [menusData, analyticsData] = await Promise.all([
          menusResponse.json(),
          analyticsResponse.json()
        ])

        if (menusData.success) {
          setMenus(menusData.menus || [])
        }

        if (analyticsData.success) {
          setAnalytics(analyticsData.analytics || [])
        }

      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredAnalytics = selectedMenuId === 'all' 
    ? analytics 
    : analytics.filter(a => a.menuId === selectedMenuId)

  const totalStats = filteredAnalytics.reduce((acc, curr) => ({
    totalScans: acc.totalScans + curr.totalScans,
    uniqueScans: acc.uniqueScans + curr.uniqueScans,
    scansToday: acc.scansToday + curr.scansToday,
    scansThisWeek: acc.scansThisWeek + curr.scansThisWeek,
    scansThisMonth: acc.scansThisMonth + curr.scansThisMonth,
    mobile: acc.mobile + curr.deviceBreakdown.mobile,
    tablet: acc.tablet + curr.deviceBreakdown.tablet,
    desktop: acc.desktop + curr.deviceBreakdown.desktop
  }), {
    totalScans: 0,
    uniqueScans: 0,
    scansToday: 0,
    scansThisWeek: 0,
    scansThisMonth: 0,
    mobile: 0,
    tablet: 0,
    desktop: 0
  })

  const getCurrentRangeScans = () => {
    switch (timeRange) {
      case 'today': return totalStats.scansToday
      case 'week': return totalStats.scansThisWeek
      case 'month': return totalStats.scansThisMonth
      case 'year': return totalStats.totalScans
      default: return totalStats.scansThisMonth
    }
  }

  // Mock chart data generation
  const generateChartData = () => {
    const days = timeRange === 'today' ? 24 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365
    const baseValue = getCurrentRangeScans()
    
    return Array.from({ length: days }, (_, i) => ({
      name: timeRange === 'today' ? `${i}:00` : `Day ${i + 1}`,
      scans: Math.floor(Math.random() * (baseValue / days * 2))
    }))
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-full overflow-hidden space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600">Track your menu performance and customer engagement</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Menu Filter */}
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="form-input text-sm sm:text-base"
            >
              <option value="all">All Menus</option>
              {menus.map(menu => (
                <option key={menu.id} value={menu.id}>{menu.name}</option>
              ))}
            </select>

            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="form-input text-sm sm:text-base"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 truncate">{totalStats.totalScans.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-1 sm:ml-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 sm:mt-4">
              <span className="text-green-600 text-xs sm:text-sm font-medium">+12.5%</span>
              <span className="text-gray-500 text-xs sm:text-sm ml-1">vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 truncate">{totalStats.uniqueScans.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-1 sm:ml-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 sm:mt-4">
              <span className="text-green-600 text-xs sm:text-sm font-medium">+8.2%</span>
              <span className="text-gray-500 text-xs sm:text-sm ml-1">vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Current Period</p>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 truncate">{getCurrentRangeScans().toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-1 sm:ml-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-2 sm:mt-4">
              <span className="text-green-600 text-xs sm:text-sm font-medium">+15.3%</span>
              <span className="text-gray-500 text-xs sm:text-sm ml-1">vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. per Day</p>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 truncate">
                  {Math.round(totalStats.scansThisMonth / 30).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-1 sm:ml-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 sm:mt-4">
              <span className="text-green-600 text-xs sm:text-sm font-medium">+5.7%</span>
              <span className="text-gray-500 text-xs sm:text-sm ml-1">vs last period</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Scans Over Time */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Scans Over Time</h3>
            <div className="h-40 sm:h-48 lg:h-64 flex items-end justify-between gap-1 overflow-hidden">
              {generateChartData().slice(0, 8).map((item, index) => {
                const maxScans = Math.max(...generateChartData().map(d => d.scans))
                const heightPercentage = Math.max((item.scans / maxScans) * 100, 3)
                return (
                  <div key={index} className="flex-1 flex flex-col items-center min-w-0">
                    <div 
                      className="w-full bg-primary-600 rounded-t hover:bg-primary-700 transition-colors cursor-pointer"
                      style={{ height: `${heightPercentage}%` }}
                      title={`${item.name}: ${item.scans} scans`}
                    />
                    <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                      {index + 1}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm sm:text-base text-gray-700">Mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {Math.round((totalStats.mobile / (totalStats.mobile + totalStats.tablet + totalStats.desktop)) * 100)}%
                  </span>
                  <span className="font-semibold text-sm sm:text-base">{totalStats.mobile.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(totalStats.mobile / (totalStats.mobile + totalStats.tablet + totalStats.desktop)) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
                  <span className="text-sm sm:text-base text-gray-700">Tablet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {Math.round((totalStats.tablet / (totalStats.mobile + totalStats.tablet + totalStats.desktop)) * 100)}%
                  </span>
                  <span className="font-semibold text-sm sm:text-base">{totalStats.tablet.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(totalStats.tablet / (totalStats.mobile + totalStats.tablet + totalStats.desktop)) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm sm:text-base text-gray-700">Desktop</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {Math.round((totalStats.desktop / (totalStats.mobile + totalStats.tablet + totalStats.desktop)) * 100)}%
                  </span>
                  <span className="font-semibold text-sm sm:text-base">{totalStats.desktop.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(totalStats.desktop / (totalStats.mobile + totalStats.tablet + totalStats.desktop)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Menu Performance */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Menu Performance</h3>
          
          {/* Mobile: Card Layout */}
          <div className="block sm:hidden space-y-3">
            {menus.map((menu) => {
              const menuAnalytics = analytics.find(a => a.menuId === menu.id)
              return (
                <div key={menu.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">{menu.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{menu.description}</p>
                    </div>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      menu.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {menu.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Total Scans</span>
                      <div className="font-semibold text-gray-900">{menuAnalytics?.totalScans.toLocaleString() || '0'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">This Month</span>
                      <div className="font-semibold text-gray-900">{menuAnalytics?.scansThisMonth.toLocaleString() || '0'}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Menu</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Total Scans</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Unique Visitors</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">This Month</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((menu) => {
                  const menuAnalytics = analytics.find(a => a.menuId === menu.id)
                  return (
                    <tr key={menu.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{menu.name}</div>
                          <div className="text-sm text-gray-500">{menu.description}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold">
                        {menuAnalytics?.totalScans.toLocaleString() || '0'}
                      </td>
                      <td className="py-4 px-4">
                        {menuAnalytics?.uniqueScans.toLocaleString() || '0'}
                      </td>
                      <td className="py-4 px-4">
                        {menuAnalytics?.scansThisMonth.toLocaleString() || '0'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          menu.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {menu.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Recent Activity</h3>
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-100 rounded-lg">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base text-gray-900">Menu scan from mobile device</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {menus[i % menus.length]?.name} • {Math.floor(Math.random() * 60)} minutes ago
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                  +{Math.floor(Math.random() * 10) + 1} scans
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AnalyticsPage

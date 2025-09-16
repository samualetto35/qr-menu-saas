'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Menu } from '@/types'

const MenusPage: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch('/api/menus', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setMenus(data.menus || [])
        }
      } catch (error) {
        console.error('Failed to load menus:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMenus()
  }, [])

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && menu.isActive) ||
      (filterStatus === 'inactive' && !menu.isActive)
    
    return matchesSearch && matchesFilter
  })

  const handleToggleStatus = async (menuId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/menus/${menuId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        setMenus(prev => prev.map(menu => 
          menu.id === menuId ? { ...menu, isActive: !isActive } : menu
        ))
      }
    } catch (error) {
      console.error('Failed to toggle menu status:', error)
    }
  }

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/menus/${menuId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMenus(prev => prev.filter(menu => menu.id !== menuId))
      }
    } catch (error) {
      console.error('Failed to delete menu:', error)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Menus</h1>
            <p className="text-gray-600">Manage your digital restaurant menus</p>
          </div>
          <Link
            href="/dashboard/menus/new"
            className="btn-primary text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap"
          >
            + New Menu
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search menus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="form-input w-full sm:w-auto"
            >
              <option value="all">All Menus</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Menus Grid */}
        {filteredMenus.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {menus.length === 0 ? 'No menus yet' : 'No menus found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {menus.length === 0 
                ? 'Create your first digital menu to get started'
                : 'Try adjusting your search or filters'
              }
            </p>
            {menus.length === 0 && (
              <Link
                href="/dashboard/menus/new"
                className="btn-primary"
              >
                Create Your First Menu
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenus.map((menu) => (
              <div key={menu.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                {/* Menu Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {menu.name}
                    </h3>
                    {menu.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {menu.description}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleToggleStatus(menu.id, menu.isActive)}
                    className={`ml-3 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      menu.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {menu.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Menu Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {menu.categories.length}
                    </div>
                    <div className="text-sm text-gray-500">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {menu.categories.reduce((sum, cat) => sum + cat.items.length, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Items</div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-xs text-gray-500 mb-6">
                  Last updated: {new Date(menu.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/menus/${menu.id}`}
                    className="btn-secondary text-sm px-4 py-2 flex-1 text-center"
                  >
                    Edit Menu
                  </Link>
                  
                  <Link
                    href={menu.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    title="Preview Menu"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>

                  <button
                    onClick={() => navigator.clipboard.writeText(menu.url)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    title="Copy Link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDeleteMenu(menu.id)}
                    className="p-2 text-red-400 hover:text-red-600 rounded-lg border border-gray-200 hover:bg-red-50 transition-colors"
                    title="Delete Menu"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* QR Code Preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">QR Code</span>
                    <div className="flex gap-2">
                      <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        Download
                      </button>
                      <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        Print
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 w-16 h-16 bg-gray-900 rounded border border-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MenusPage

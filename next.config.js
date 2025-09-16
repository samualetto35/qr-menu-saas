/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'qrmenus.com'],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  }
}

module.exports = nextConfig
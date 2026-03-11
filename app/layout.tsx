import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: 'Thies Mining AI Platform',
  description: 'Intelligent Mining Operations Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("dark", inter.variable)}>
      <body className={inter.className}>
        <div className="min-h-screen bg-dark-bg">
          {/* Top Navigation */}
          <nav className="border-b border-dark-border bg-dark-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-[1920px] mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <div>
                    <h1 className="text-white font-semibold text-lg">Thies Mining</h1>
                    <p className="text-gray-400 text-xs">AI Platform</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-6">
                  <a href="#" className="text-white font-medium hover:text-accent-blue transition-colors">
                    Overview
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Documents
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Weather
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Analytics
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Reports
                  </a>
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-4">
                  <button className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-dark-hover rounded-lg transition-colors relative">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full"></span>
                  </button>
                  <div className="flex items-center space-x-3 pl-4 border-l border-dark-border">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-full"></div>
                    <div className="hidden lg:block">
                      <p className="text-white text-sm font-medium">Site Manager</p>
                      <p className="text-gray-400 text-xs">Lake Vermont Mine</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-[1920px] mx-auto px-6 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

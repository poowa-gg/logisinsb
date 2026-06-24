import React from 'react'
import { Package, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[Logistix Error Boundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 bg-[#E6F3EF] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-[#0F6E56]" />
          </div>
          <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6">
            The page ran into an unexpected error. Try refreshing — it usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full justify-center"
          >
            <RefreshCw size={15} /> Refresh Page
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full mt-3 py-3 text-sm text-gray-400 hover:text-[#0F6E56] transition-colors"
          >
            Go to Home
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 text-left text-xs bg-gray-50 rounded-lg p-3 overflow-auto text-red-500 max-h-32">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      </div>
    )
  }
}

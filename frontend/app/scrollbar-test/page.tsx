import React from 'react'

export default function ScrollbarTestPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-400 mb-8">Custom Scrollbar Showcase</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Style Scrollbar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Sidebar Style</h2>
            <div className="h-64 overflow-y-auto sidebar-scroll bg-black/50 p-4 rounded border border-green-400/30">
              <div className="space-y-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="text-green-400 p-3 bg-white/5 rounded">
                    Navigation Item {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Style Scrollbar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Content Style</h2>
            <div className="h-64 overflow-y-auto content-scroll bg-black/50 p-4 rounded border border-green-400/30">
              <div className="space-y-3">
                {Array.from({ length: 25 }, (_, i) => (
                  <div key={i} className="text-gray-300 p-2 bg-white/5 rounded text-sm">
                    Content line {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Style Scrollbar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Modal Style</h2>
            <div className="h-64 overflow-y-auto modal-scroll bg-black/50 p-4 rounded border border-green-400/30">
              <div className="space-y-2">
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="text-gray-300 p-1 bg-white/5 rounded text-xs">
                    Modal item {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Scrollbar Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div>
              <h3 className="text-green-400 font-semibold mb-2">Sidebar (.sidebar-scroll):</h3>
              <ul className="space-y-1 text-sm">
                <li>• 8px width for easy grabbing</li>
                <li>• Green gradient with glow</li>
                <li>• Border and shadow effects</li>
                <li>• Perfect for navigation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-green-400 font-semibold mb-2">Content (.content-scroll):</h3>
              <ul className="space-y-1 text-sm">
                <li>• 6px width for subtlety</li>
                <li>• Lighter green gradient</li>
                <li>• Less prominent styling</li>
                <li>• Ideal for content areas</li>
              </ul>
            </div>
            <div>
              <h3 className="text-green-400 font-semibold mb-2">Modal (.modal-scroll):</h3>
              <ul className="space-y-1 text-sm">
                <li>• 4px width for minimal UI</li>
                <li>• Clean, simple styling</li>
                <li>• Perfect for dropdowns</li>
                <li>• Consistent theme</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded">
            <h3 className="text-green-400 font-semibold mb-2">Available Classes:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm font-mono">
              <code className="text-green-300">.sidebar-scroll</code>
              <code className="text-green-300">.content-scroll</code>
              <code className="text-green-300">.modal-scroll</code>
              <code className="text-green-300">.scroll-hidden</code>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Custom scrollbars automatically applied to sidebar and ScrollArea components
          </p>
        </div>
      </div>
    </div>
  )
}

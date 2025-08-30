'use client';

import React, { useState } from 'react';
import DeviceOCRComponent from '@/components/ocr/DeviceOCRComponent';
import { Zap, Camera, FileImage, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeBackground, ThemeCard } from '@/components/ui/ThemeBackground';

export default function OCRTestPage() {
  const [detectedDevices, setDetectedDevices] = useState<any[]>([]);

  const handleDeviceDetected = (result: any) => {
    console.log('Device detected:', result);
    
    // Add to detected devices list
    const newDevice = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      ...result
    };
    
    setDetectedDevices(prev => [newDevice, ...prev]);
  };

  const handleError = (error: string) => {
    console.error('OCR Error:', error);
    toast.error(error);
  };

  const clearHistory = () => {
    setDetectedDevices([]);
    toast.success('Detection history cleared');
  };

  return (
    <ThemeBackground>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">
              Device OCR Testing
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Test Tesseract.js OCR functionality for device detection. Upload images or take photos 
            to extract device information automatically.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ThemeCard className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Camera className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">
                Camera Capture
              </h3>
            </div>
            <p className="text-gray-300">
              Take photos directly with your device camera for instant OCR processing.
            </p>
          </ThemeCard>

          <ThemeCard className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <FileImage className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">
                File Upload
              </h3>
            </div>
            <p className="text-gray-300">
              Upload existing images from your device with drag-and-drop support.
            </p>
          </ThemeCard>

          <ThemeCard className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">
                Smart Detection
              </h3>
            </div>
            <p className="text-gray-300">
              Automatically identify device brands, categories, and specifications.
            </p>
          </ThemeCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* OCR Component */}
          <ThemeCard className="p-6">
            <DeviceOCRComponent
              onDeviceDetected={handleDeviceDetected}
              onError={handleError}
              className="w-full"
            />
          </ThemeCard>

          {/* Detection History */}
          <ThemeCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Detection History
              </h3>
              {detectedDevices.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Clear History
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {detectedDevices.length === 0 ? (
                <div className="text-center py-8">
                  <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-300">
                    No devices detected yet. Upload an image to get started.
                  </p>
                </div>
              ) : (
                detectedDevices.map((device, index) => (
                  <div
                    key={device.id}
                    className="border border-gray-600 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {device.timestamp}
                      </span>
                      <span className="text-sm font-medium text-green-400">
                        {Math.round(device.confidence * 100)}% confidence
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Detected Text
                      </label>
                      <p className="text-sm text-white bg-gray-700 p-2 rounded">
                        {device.deviceText}
                      </p>
                    </div>

                    {device.detectedBrands.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Brands
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {device.detectedBrands.map((brand: string, brandIndex: number) => (
                            <span
                              key={brandIndex}
                              className="px-2 py-1 bg-blue-600 text-blue-200 text-xs rounded-full"
                            >
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {device.detectedCategories.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Categories
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {device.detectedCategories.map((category: string, catIndex: number) => (
                            <span
                              key={catIndex}
                              className="px-2 py-1 bg-green-600 text-green-200 text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ThemeCard>
        </div>

        {/* Usage Instructions */}
        <ThemeCard className="mt-8 p-6 border border-green-500/20">
          <h3 className="text-lg font-semibold text-green-400 mb-3">
            💡 How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium mb-2 text-white">📱 For Best Results:</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Use clear, well-lit images</li>
                <li>• Ensure text is visible and readable</li>
                <li>• Avoid blurry or low-resolution photos</li>
                <li>• Focus on device labels or nameplates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-white">🎯 Detection Features:</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Automatic brand recognition</li>
                <li>• Device category classification</li>
                <li>• Power rating extraction</li>
                <li>• Model number detection</li>
              </ul>
            </div>
          </div>
        </ThemeCard>
      </div>
    </ThemeBackground>
  );
}

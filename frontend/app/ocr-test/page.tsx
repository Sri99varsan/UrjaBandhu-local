'use client';

import React, { useState } from 'react';
import DeviceOCRComponent from '@/components/ocr/DeviceOCRComponent';
import { Zap, Camera, FileImage, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Device OCR Testing
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Test Tesseract.js OCR functionality for device detection. Upload images or take photos 
            to extract device information automatically.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Camera className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Camera Capture
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Take photos directly with your device camera for instant OCR processing.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <FileImage className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                File Upload
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Upload existing images from your device with drag-and-drop support.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Smart Detection
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Automatically identify device brands, categories, and specifications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* OCR Component */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <DeviceOCRComponent
              onDeviceDetected={handleDeviceDetected}
              onError={handleError}
              className="w-full"
            />
          </div>

          {/* Detection History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Detection History
              </h3>
              {detectedDevices.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear History
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {detectedDevices.length === 0 ? (
                <div className="text-center py-8">
                  <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No devices detected yet. Upload an image to get started.
                  </p>
                </div>
              ) : (
                detectedDevices.map((device, index) => (
                  <div
                    key={device.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {device.timestamp}
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {Math.round(device.confidence * 100)}% confidence
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Detected Text
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        {device.deviceText}
                      </p>
                    </div>

                    {device.detectedBrands.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Brands
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {device.detectedBrands.map((brand: string, brandIndex: number) => (
                            <span
                              key={brandIndex}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                            >
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {device.detectedCategories.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Categories
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {device.detectedCategories.map((category: string, catIndex: number) => (
                            <span
                              key={catIndex}
                              className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
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
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">📱 For Best Results:</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Use clear, well-lit images</li>
                <li>• Ensure text is visible and readable</li>
                <li>• Avoid blurry or low-resolution photos</li>
                <li>• Focus on device labels or nameplates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Detection Features:</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Automatic brand recognition</li>
                <li>• Device category classification</li>
                <li>• Power rating extraction</li>
                <li>• Model number detection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

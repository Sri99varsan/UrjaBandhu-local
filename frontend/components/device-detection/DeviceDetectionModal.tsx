'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface DetectedDevice {
  device_name: string
  device_type: string
  power_rating: number
  confidence: number
}

interface DeviceMatch {
  id: string
  name: string
  category: string
  power_rating: number
  match_confidence: number
}

interface OCRResult {
  detected_text: string
  confidence: number
  device_matches: DeviceMatch[]
}

interface DeviceDetectionModalProps {
  isOpen: boolean
  onClose: () => void
  onDeviceDetected: (device: DetectedDevice) => void
}

export default function DeviceDetectionModal({ 
  isOpen, 
  onClose, 
  onDeviceDetected 
}: DeviceDetectionModalProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [detectionResult, setDetectionResult] = useState<OCRResult | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<DeviceMatch | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error('Please sign in to upload images')
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB')
      }

      // Upload image to Supabase Storage
      const fileName = `device-images/${user.id}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('device-images')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('device-images')
        .getPublicUrl(fileName)

      setUploadedImage(publicUrl)
      
      // Automatically start device detection
      await performDeviceDetection(publicUrl)

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const performDeviceDetection = async (imageUrl: string) => {
    if (!user) return

    try {
      setIsDetecting(true)
      setError(null)

      // Call the Supabase Edge Function for device detection
      const { data, error } = await supabase.functions.invoke('ocr-device-detection', {
        body: {
          image_url: imageUrl,
          user_id: user.id
        }
      })

      if (error) {
        throw new Error(`Detection failed: ${error.message}`)
      }

      if (data.device_matches && data.device_matches.length > 0) {
        setDetectionResult(data)
        // Auto-select the highest confidence match
        setSelectedDevice(data.device_matches[0])
        toast.success('Device detected successfully!')
      } else {
        setDetectionResult(data)
        throw new Error('No matching devices found in catalog')
      }

    } catch (error) {
      console.error('Detection error:', error)
      setError(error instanceof Error ? error.message : 'Detection failed')
      toast.error('Failed to detect device')
    } finally {
      setIsDetecting(false)
    }
  }

  const handleConfirmDetection = () => {
    if (selectedDevice) {
      onDeviceDetected({
        device_name: selectedDevice.name,
        device_type: selectedDevice.category,
        power_rating: selectedDevice.power_rating,
        confidence: selectedDevice.match_confidence
      })
      onClose()
      resetModal()
    }
  }

  const resetModal = () => {
    setUploadedImage(null)
    setDetectionResult(null)
    setSelectedDevice(null)
    setError(null)
    setIsUploading(false)
    setIsDetecting(false)
  }

  const handleClose = () => {
    onClose()
    resetModal()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Detect Device from Image
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Upload Section */}
          {!uploadedImage && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Take a photo or upload an image of your electrical device to automatically detect its type and power consumption.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Camera Upload */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Camera className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Take Photo</span>
                </button>

                {/* File Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Upload Image</span>
                </button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className="hidden"
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className="hidden"
              />

              {isUploading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Uploading image...</span>
                </div>
              )}
            </div>
          )}

          {/* Image Preview and Detection */}
          {uploadedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded device"
                  className="w-full h-48 object-cover rounded-lg"
                />
                {isDetecting && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Analyzing device...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Detection Results */}
              {detectionResult && (
                <div className="space-y-4">
                  {/* OCR Text */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Detected Text</h4>
                    <p className="text-sm text-gray-600 italic">"{detectionResult.detected_text}"</p>
                    <p className="text-xs text-gray-500 mt-1">
                      OCR Confidence: {Math.round(detectionResult.confidence * 100)}%
                    </p>
                  </div>

                  {/* Device Matches */}
                  {detectionResult.device_matches.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-3">
                        Found {detectionResult.device_matches.length} matching device{detectionResult.device_matches.length !== 1 ? 's' : ''}
                      </h4>
                      <div className="space-y-2">
                        {detectionResult.device_matches.map((device) => (
                          <div
                            key={device.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              selectedDevice?.id === device.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedDevice(device)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-800">{device.name}</h5>
                                <p className="text-sm text-gray-600 capitalize">
                                  {device.category} • {device.power_rating}W
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-700">
                                  {Math.round(device.match_confidence * 100)}%
                                </div>
                                <div className="text-xs text-gray-500">match</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">No devices matched</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            The detected text didn't match any devices in our catalog. You can add the device manually.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            
            {uploadedImage && !isDetecting && (
              <button
                onClick={() => {
                  setUploadedImage(null)
                  setDetectionResult(null)
                  setSelectedDevice(null)
                  setError(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Another Image
              </button>
            )}

            {selectedDevice && (
              <button
                onClick={handleConfirmDetection}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Zap className="h-4 w-4 mr-2 inline" />
                Add Device
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

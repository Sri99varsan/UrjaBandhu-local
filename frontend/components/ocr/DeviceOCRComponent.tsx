'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, FileImage, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { detectDeviceFromImage, OCRResult } from '@/lib/ocr/tesseract-ocr';
import toast from 'react-hot-toast';

interface DeviceOCRProps {
  onDeviceDetected?: (result: {
    deviceText: string;
    confidence: number;
    detectedBrands: string[];
    detectedCategories: string[];
    rawText: string;
  }) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function DeviceOCRComponent({ 
  onDeviceDetected, 
  onError, 
  className = '' 
}: DeviceOCRProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please drop an image file');
      }
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      toast.error('Camera access denied. Please allow camera access or use file upload.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Convert to blob and create file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            setImagePreview(canvas.toDataURL());
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  }, [stopCamera]);

  // Process OCR
  const processOCR = useCallback(async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading('Analyzing image for device information...', { id: 'ocr-processing' });
      
      const result = await detectDeviceFromImage(selectedImage);
      
      toast.dismiss('ocr-processing');
      
      if (result.confidence > 0.5) {
        toast.success(`Device detected with ${Math.round(result.confidence * 100)}% confidence`);
        setOcrResult(result);
        onDeviceDetected?.(result);
      } else {
        toast.error('Could not reliably detect device information from image');
        onError?.('Low confidence in OCR result');
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      toast.dismiss('ocr-processing');
      toast.error('Failed to process image. Please try again.');
      onError?.(error instanceof Error ? error.message : 'OCR processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedImage, onDeviceDetected, onError]);

  // Reset component
  const reset = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setOcrResult(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [stopCamera]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Device OCR Scanner
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Upload an image or take a photo to detect device information
        </p>
      </div>

      {/* Camera Section */}
      {showCamera && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button
              onClick={capturePhoto}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Capture</span>
            </button>
            <button
              onClick={stopCamera}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Upload Section */}
      {!showCamera && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
        >
          {imagePreview ? (
            <div className="space-y-4">
              <img
                src={imagePreview}
                alt="Selected image"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
              />
              <div className="flex justify-center space-x-2">
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Change Image
                </button>
                <button
                  onClick={processOCR}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileImage className="w-4 h-4" />
                  )}
                  <span>{isProcessing ? 'Processing...' : 'Analyze Image'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileImage className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Drop image here or click to upload
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                </button>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {ocrResult && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Detection Results
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Detected Text
              </label>
              <p className="text-sm bg-white dark:bg-gray-700 p-3 rounded border">
                {ocrResult.deviceText || 'No text detected'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confidence
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${ocrResult.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(ocrResult.confidence * 100)}%
                </span>
              </div>
            </div>
            
            {ocrResult.detectedBrands.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Detected Brands
                </label>
                <div className="flex flex-wrap gap-1">
                  {ocrResult.detectedBrands.map((brand: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {ocrResult.detectedCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Detected Categories
                </label>
                <div className="flex flex-wrap gap-1">
                  {ocrResult.detectedCategories.map((category: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

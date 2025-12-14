'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  children?: React.ReactNode;
  maxSize?: number;
  acceptedFileTypes?: Record<string, string[]>;
}

export function FileUpload({ 
  onFileSelect, 
  children,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp']
  }
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

const onDrop = useCallback((acceptedFiles: File[]) => {
  setUploadError(null);
  
  if (acceptedFiles.length > 0) {
    const file = acceptedFiles[0];
    
    // Early return if file doesn't exist
    if (!file) {
      setUploadError('No file selected');
      return;
    }
    
    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
      setUploadError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    // Validate file type
    const fileType = file.type;
    const isValidType = Object.keys(acceptedFileTypes).some(type => {
      if (type === 'image/*') {
        return fileType.startsWith('image/');
      }
      return fileType === type;
    });
    
    if (!isValidType) {
      setUploadError('Invalid file type. Please upload an image file.');
      return;
    }
    
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 50);
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    
    // Complete upload
    setTimeout(() => {
      setUploadProgress(100);
      clearInterval(interval);
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
      
      onFileSelect(file);
    }, 1000);
  }
}, [onFileSelect, maxSize, acceptedFileTypes]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: maxSize,
    multiple: false,
    disabled: uploadProgress > 0
  });

  const handleRemovePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);

  return (
    <div className="w-full">
      {uploadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer transition-all duration-200",
          uploadProgress > 0 && "cursor-not-allowed opacity-80"
        )}
      >
        <input {...getInputProps()} />
        
        {children ? (
          children
        ) : (
          <div className={cn(
            "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors",
            isDragActive 
              ? "border-blue-500 bg-blue-500/10" 
              : isDragReject
              ? "border-red-500 bg-red-500/10"
              : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/30"
          )}>
            {uploadProgress > 0 ? (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-75" />
                    <div className="relative p-3 bg-gray-900 rounded-full border border-gray-700">
                      <Upload className="h-6 w-6 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-center text-sm text-gray-400">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-75" />
                  <div className="relative p-4 bg-gray-900 rounded-full border border-gray-700">
                    {isDragActive ? (
                      <Upload className="h-8 w-8 text-blue-400" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-blue-400" />
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-1">
                    {isDragActive 
                      ? 'Drop image here' 
                      : isDragReject 
                      ? 'File type not supported' 
                      : 'Upload Image'}
                  </p>
                  <p className="text-sm text-gray-400 mb-2">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports: JPG, PNG, GIF, WebP • Max: {maxSizeMB}MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="mt-4 p-4 rounded-lg border border-gray-700 bg-gray-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <File className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-white">Image Preview</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePreview}
              className="h-8 w-8 p-0 hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-gray-700">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto max-h-48 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-300">Ready to send</span>
                <span className="text-xs text-green-400">
                  ✓ Upload complete
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!previewUrl && !uploadError && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
          <AlertCircle className="h-3 w-3" />
          <span>Uploaded images are analyzed with AI for diagnostics</span>
        </div>
      )}
    </div>
  );
}
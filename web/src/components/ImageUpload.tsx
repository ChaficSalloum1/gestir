import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import imageCompression from 'browser-image-compression';
import { APP_CONFIG } from '../types';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  userId: string;
  disabled?: boolean;
}

export function ImageUpload({ onUpload, userId, disabled = false }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useStorage();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      try {
        // Compress the image
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 2, // Maximum file size in MB
          maxWidthOrHeight: 1920, // Maximum width or height
          useWebWorker: true,
          fileType: 'image/jpeg',
          initialQuality: APP_CONFIG.COMPRESSION_QUALITY,
        });
        
        setSelectedFile(compressedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file if compression fails
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${selectedFile.name}`;
      const path = `uploads/${userId}/${fileName}`;
      
      const url = await uploadFile(selectedFile, path);
      onUpload(url);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-sm"
            />
            <div className="flex justify-center space-x-2">
              <button
                onClick={handleUpload}
                disabled={uploading || disabled}
                className="btn-primary disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
              <button
                onClick={clearFile}
                disabled={uploading || disabled}
                className="btn-secondary disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <p className="text-lg font-medium text-gray-900">
              Drop your image here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, and other image formats
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



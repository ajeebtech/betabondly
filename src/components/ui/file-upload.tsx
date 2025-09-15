'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from './button';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  maxFiles?: number;
  accept?: {
    [key: string]: string[];
  };
  maxSize?: number;
}

export function FileUpload({
  onFileUpload,
  maxFiles = 2,
  accept = { 'image/*': ['.jpeg', '.jpg', '.png'] },
  maxSize = 5 * 1024 * 1024, // 5MB
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      const newFiles = acceptedFiles.slice(0, maxFiles - files.length);
      setFiles((prev) => [...prev, ...newFiles]);
      onFileUpload([...files, ...newFiles]);
      
      if (fileRejections.length > 0) {
        setRejected((prev) => [...prev, ...fileRejections.map(({ file }) => file)]);
      }
    },
    [files, maxFiles, onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFileUpload(newFiles);
  };

  const removeRejected = (index: number) => {
    const newRejected = [...rejected];
    newRejected.splice(index, 1);
    setRejected(newRejected);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-500 font-medium">Drop the files here ...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Drag & drop {maxFiles - files.length} image{maxFiles - files.length !== 1 ? 's' : ''} here, or click to select files
              </p>
              <p className="text-xs text-gray-500">
                Supports: {Object.values(accept).flat().join(', ')} (max {maxSize / 1024 / 1024}MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file, index) => (
          <div key={index} className="relative group">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
          </div>
        ))}
      </div>

      {/* Rejected files */}
      {rejected.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-red-600 mb-2">Rejected files</h4>
          <ul className="space-y-2">
            {rejected.map((file, index) => (
              <li key={index} className="flex items-center justify-between text-sm text-red-500">
                <span className="truncate">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={() => removeRejected(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

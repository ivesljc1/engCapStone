"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { XMarkIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";

/**
 * FileUploadModal Component
 * 
 * This component displays a modal for uploading files.
 * It allows users to select files from their computer and upload them.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onUpload - Function to handle file upload
 * @param {string} props.patientName - Name of the patient for the appointment
 * @returns {JSX.Element|null} The rendered modal or null if closed
 */
export default function FileUploadModal({ isOpen, onClose, onUpload, patientName }) {
  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  // File input reference to programmatically trigger file selection
  const fileInputRef = useRef(null);
  
  // State for selected file and upload status
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error

  /**
   * Handle file selection
   * @param {Event} e - The file input change event
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  /**
   * Trigger file input click
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file upload
   */
  const handleUpload = () => {
    if (!selectedFile) return;
    
    setUploadStatus("uploading");
    
    // Simulate upload delay
    setTimeout(() => {
      setUploadStatus("success");
      
      // In a real application, this would call an API to upload the file
      if (onUpload) {
        onUpload(selectedFile);
      }
      
      // Close the modal after a delay
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload Report</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        {/* Patient name */}
        <p className="mb-4 text-sm text-gray-600">
          Patient: <span className="font-medium">{patientName}</span>
        </p>
        
        {/* Upload area */}
        <div className="mb-4 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <DocumentArrowUpIcon className="h-10 w-10 text-primary mb-2" />
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <DocumentArrowUpIcon className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Drag and drop a file, or <button onClick={handleBrowseClick} className="text-primary hover:underline">browse</button>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>
          )}
          
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
            className="hidden"
          />
        </div>
        
        {/* Status message */}
        {uploadStatus === "uploading" && (
          <p className="text-sm text-blue-600 mb-4">Uploading file...</p>
        )}
        {uploadStatus === "success" && (
          <p className="text-sm text-green-600 mb-4">File uploaded successfully!</p>
        )}
        {uploadStatus === "error" && (
          <p className="text-sm text-red-600 mb-4">Error uploading file. Please try again.</p>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={uploadStatus === "uploading"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadStatus === "uploading" || uploadStatus === "success"}
          >
            {uploadStatus === "uploading" ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
} 
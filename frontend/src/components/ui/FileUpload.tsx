import React, { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import api from '../../lib/api'
import Button from './Button'

interface FileUploadProps {
  onUpload: (url: string) => void
  accept?: string
  currentFile?: string | null
}

export default function FileUpload({ onUpload, accept, currentFile }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onUpload(response.data.url)
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      await uploadFile(file)
    } catch (error) {
      console.error('Error handling file:', error)
    }
  }

  async function handleDelete() {
    if (!currentFile || !window.confirm('Are you sure you want to delete this file?')) return

    try {
      setUploading(true)

      // Extract filename from the URL
      const filename = currentFile.split('/').pop()
      if (!filename) return

      await api.delete(`/upload/${filename}`)

      onUpload('')
    } catch (error) {
      console.error('Error deleting file:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          isLoading={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
        {currentFile && (
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={uploading}
          >
            Delete
          </Button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      {currentFile && (
        <div className="text-sm text-gray-500">
          {accept?.includes('image/') ? (
            <img
              src={currentFile}
              alt="Preview"
              className="mt-2 h-32 w-24 object-cover rounded"
            />
          ) : (
            <a
              href={currentFile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-900"
            >
              View current file
            </a>
          )}
        </div>
      )}
    </div>
  )
}
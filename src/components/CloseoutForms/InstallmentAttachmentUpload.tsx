
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File, X, Download } from 'lucide-react';
import { toast } from 'sonner';

interface InstallmentAttachmentUploadProps {
  attachment: {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  } | null;
  onAttachmentChange: (attachment: {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  } | null) => void;
  disabled?: boolean;
}

const InstallmentAttachmentUpload: React.FC<InstallmentAttachmentUploadProps> = ({
  attachment,
  onAttachmentChange,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not supported. Please upload PDF, DOC, DOCX, XLS, XLSX, or image files.');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error('File size must be less than 10MB.');
      return;
    }

    setUploading(true);

    try {
      // Simulate file upload (in a real app, this would upload to a server)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAttachment = {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // In real app, this would be the server URL
        uploadedAt: new Date().toISOString()
      };

      onAttachmentChange(newAttachment);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    onAttachmentChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('File removed successfully!');
  };

  const handleDownloadFile = () => {
    if (attachment?.fileUrl) {
      // In a real app, this would download from the server
      const link = document.createElement('a');
      link.href = attachment.fileUrl;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (attachment) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center space-x-2">
            <File className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{attachment.fileName}</p>
              <p className="text-xs text-muted-foreground">
                Uploaded {new Date(attachment.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadFile}
              disabled={disabled}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
          id="installment-file-upload"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Installment Attachment'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (Max 10MB)
      </p>
    </div>
  );
};

export default InstallmentAttachmentUpload;

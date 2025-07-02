import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Save, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Pre-configured confirmation dialogs
export const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  itemName = 'item'
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName?: string;
}) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    title={`Delete ${itemName}`}
    description={`Are you sure you want to delete this ${itemName}? This action cannot be undone.`}
    confirmText="Delete"
    variant="destructive"
    onConfirm={onConfirm}
  />
);

export const UnsavedChangesDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
}) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    title="Unsaved Changes"
    description="You have unsaved changes. Are you sure you want to leave without saving?"
    confirmText="Leave without saving"
    cancelText="Stay on page"
    variant="destructive"
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);

export const LogoutConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    title="Sign Out"
    description="Are you sure you want to sign out of your account?"
    confirmText="Sign Out"
    onConfirm={onConfirm}
  />
);

export default ConfirmDialog;
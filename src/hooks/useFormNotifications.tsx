import { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export const useFormNotifications = () => {
  const { addNotification } = useNotifications();

  const notifyFormStatusChange = (formId: string, clientName: string, oldStatus: string, newStatus: string) => {
    let title = '';
    let message = '';
    let type: 'info' | 'success' | 'warning' | 'error' = 'info';
    let actionUrl = '';
    let actionLabel = '';

    switch (newStatus) {
      case 'pending':
        title = 'Form Submitted';
        message = `Closeout form for ${clientName} has been submitted for review.`;
        type = 'info';
        actionUrl = '/dashboard/closeout-forms/pending';
        actionLabel = 'View Form';
        break;
      case 'active':
        title = 'Form Under Review';
        message = `Closeout form for ${clientName} is now being reviewed.`;
        type = 'info';
        actionUrl = '/dashboard/closeout-forms/active';
        actionLabel = 'View Progress';
        break;
      case 'rejected':
        title = 'Form Requires Amendment';
        message = `Closeout form for ${clientName} needs amendments. Please review the comments.`;
        type = 'warning';
        actionUrl = '/dashboard/closeout-forms/rejected';
        actionLabel = 'Fix Issues';
        break;
      case 'completed':
        title = 'Form Completed';
        message = `Closeout form for ${clientName} has been approved and completed.`;
        type = 'success';
        actionUrl = '/dashboard/closeout-forms/completed';
        actionLabel = 'View Form';
        break;
    }

    addNotification({
      title,
      message,
      type,
      actionUrl,
      actionLabel
    });
  };

  const notifyFormAssignment = (formId: string, clientName: string, assigneeName: string) => {
    addNotification({
      title: 'New Assignment',
      message: `You have been assigned a new closeout form for ${clientName}.`,
      type: 'info',
      actionUrl: '/dashboard/closeout-forms/pending',
      actionLabel: 'Review Form'
    });
  };

  const notifyFormDueDate = (formId: string, clientName: string, dueDate: string) => {
    addNotification({
      title: 'Form Due Soon',
      message: `Closeout form for ${clientName} is due on ${dueDate}.`,
      type: 'warning',
      actionUrl: '/dashboard/closeout-forms/pending',
      actionLabel: 'View Form'
    });
  };

  const notifySystemUpdate = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'info'
    });
  };

  return {
    notifyFormStatusChange,
    notifyFormAssignment,
    notifyFormDueDate,
    notifySystemUpdate
  };
};
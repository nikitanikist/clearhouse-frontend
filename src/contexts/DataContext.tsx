import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Types for our data models
export type FormStatus = 'pending' | 'active' | 'completed' | 'rejected';

export interface CloseoutForm {
  id: string;
  clientName: string;
  filePath: string;
  signingPerson: string;
  signingEmail: string;
  additionalEmails: string[];
  partner: string;
  manager: string;
  years: string;
  jobNumber: string;
  invoiceAmount: string;
  billDetail: string;
  paymentRequired: boolean;
  wipRecovery: string;
  recoveryReason?: string;
  isT1: boolean;
  isS216: boolean;
  isS116: boolean;
  isPaperFiled: boolean;
  installmentsRequired: boolean;
  status: FormStatus;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  assignedTo: {
    id: string;
    name: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  comments: {
    id: string;
    text: string;
    createdBy: string;
    createdAt: string;
  }[];
  history: {
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
  }[];
}

export type EmailStatus = 'pending' | 'replied' | 'we-replied';

export interface EmailThread {
  id: string;
  clientName: string;
  clientEmail: string;
  subject: string;
  linkedFormId?: string;
  status: EmailStatus;
  createdAt: string;
  updatedAt: string;
  lastContactDate: string;
  messages: {
    id: string;
    from: string;
    to: string[];
    subject: string;
    content: string;
    attachments: {
      name: string;
      url: string;
    }[];
    sentAt: string;
    readAt?: string;
  }[];
  notes: {
    id: string;
    text: string;
    createdBy: string;
    createdAt: string;
  }[];
  assignedTo: {
    id: string;
    name: string;
  };
}

interface DataContextType {
  forms: CloseoutForm[];
  emails: EmailThread[];
  createForm: (form: Omit<CloseoutForm, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'history'>) => void;
  updateFormStatus: (formId: string, status: FormStatus, comment?: string) => void;
  updateForm: (formId: string, updatedForm: CloseoutForm) => void;
  assignForm: (formId: string, assigneeId: string, assigneeName: string) => void;
  createEmail: (email: Omit<EmailThread, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'notes'>) => void;
  addEmailReply: (emailId: string, message: { content: string }) => void;
  addEmailNote: (emailId: string, note: string) => void;
  reassignEmail: (emailId: string, assigneeId: string, assigneeName: string) => void;
  getFormById: (formId: string) => CloseoutForm | undefined;
  getEmailById: (emailId: string) => EmailThread | undefined;
  getPreviousYearForms: (clientName: string, currentFormId?: string) => CloseoutForm[];
}

// Sample form data
const sampleForms: CloseoutForm[] = [
  {
    id: 'form-1',
    clientName: 'Rohit Sharma',
    filePath: '\\\\Clearhouse\\Clients\\Rohit_2024\\T1',
    signingPerson: 'Rohit Sharma',
    signingEmail: 'rohit.sharma@gmail.com',
    additionalEmails: ['accountant@sharma.com'],
    partner: 'Priya S.',
    manager: 'Deepak Jain',
    years: '2023',
    jobNumber: '10254-T1',
    invoiceAmount: '$348 CAD',
    billDetail: 'Personal T1 + Foreign Income + Donation Sched.',
    paymentRequired: true,
    wipRecovery: '100%',
    recoveryReason: 'N/A',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: true,
    status: 'pending',
    createdBy: {
      id: 'preparer-1',
      name: 'Taylor Smith',
      role: 'preparer',
    },
    assignedTo: {
      id: 'admin-1',
      name: 'Jordan Lee',
      role: 'admin',
    },
    createdAt: '2025-05-10T14:30:00Z',
    updatedAt: '2025-05-10T14:30:00Z',
    comments: [],
    history: [
      {
        id: 'hist-1',
        action: 'Created form',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-10T14:30:00Z',
      },
      {
        id: 'hist-2',
        action: 'Assigned to Jordan Lee',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-10T14:35:00Z',
      },
    ],
  },
  {
    id: 'form-2',
    clientName: 'Anita Patel',
    filePath: '\\\\Clearhouse\\Clients\\Patel_2024\\T1',
    signingPerson: 'Anita Patel',
    signingEmail: 'anita.patel@outlook.com',
    additionalEmails: [],
    partner: 'Amil R.',
    manager: 'Deepak Jain',
    years: '2023',
    jobNumber: '10255-T1',
    invoiceAmount: '$520 CAD',
    billDetail: 'Personal T1 + Rental Income + Self-Employment',
    paymentRequired: false,
    wipRecovery: '85%',
    recoveryReason: 'Long-time client relationship',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: true,
    status: 'active',
    createdBy: {
      id: 'preparer-1',
      name: 'Taylor Smith',
      role: 'preparer',
    },
    assignedTo: {
      id: 'admin-1',
      name: 'Jordan Lee',
      role: 'admin',
    },
    createdAt: '2025-05-08T10:15:00Z',
    updatedAt: '2025-05-09T11:30:00Z',
    comments: [],
    history: [
      {
        id: 'hist-3',
        action: 'Created form',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-08T10:15:00Z',
      },
      {
        id: 'hist-4',
        action: 'Assigned to Jordan Lee',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-08T10:20:00Z',
      },
      {
        id: 'hist-5',
        action: 'Status changed to active',
        performedBy: 'Jordan Lee',
        timestamp: '2025-05-09T11:30:00Z',
      },
    ],
  },
  {
    id: 'form-3',
    clientName: 'Michael Johnson',
    filePath: '\\\\Clearhouse\\Clients\\Johnson_2024\\T1',
    signingPerson: 'Michael Johnson',
    signingEmail: 'mjohnson@company.ca',
    additionalEmails: ['assistant@company.ca'],
    partner: 'Priya S.',
    manager: 'Sanjay V.',
    years: '2023',
    jobNumber: '10256-T1',
    invoiceAmount: '$785 CAD',
    billDetail: 'Personal T1 + Foreign Investment + Stock Options',
    paymentRequired: true,
    wipRecovery: '110%',
    recoveryReason: 'Complex file, additional work required',
    isT1: true,
    isS216: true,
    isS116: false,
    isPaperFiled: true,
    installmentsRequired: true,
    status: 'rejected',
    createdBy: {
      id: 'preparer-1',
      name: 'Taylor Smith',
      role: 'preparer',
    },
    assignedTo: null,
    createdAt: '2025-05-07T09:45:00Z',
    updatedAt: '2025-05-09T16:20:00Z',
    comments: [
      {
        id: 'comment-1',
        text: 'Missing foreign investment documentation. Please add T1135 details.',
        createdBy: 'Jordan Lee',
        createdAt: '2025-05-09T16:20:00Z',
      }
    ],
    history: [
      {
        id: 'hist-6',
        action: 'Created form',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-07T09:45:00Z',
      },
      {
        id: 'hist-7',
        action: 'Assigned to Jordan Lee',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-07T09:50:00Z',
      },
      {
        id: 'hist-8',
        action: 'Status changed to rejected',
        performedBy: 'Jordan Lee',
        timestamp: '2025-05-09T16:20:00Z',
      },
    ],
  },
  {
    id: 'form-4',
    clientName: 'Sarah Williams',
    filePath: '\\\\Clearhouse\\Clients\\Williams_2024\\T1',
    signingPerson: 'Sarah Williams',
    signingEmail: 'swilliams@mail.com',
    additionalEmails: [],
    partner: 'Amil R.',
    manager: 'Sanjay V.',
    years: '2023',
    jobNumber: '10257-T1',
    invoiceAmount: '$320 CAD',
    billDetail: 'Personal T1 + Tuition Credits',
    paymentRequired: false,
    wipRecovery: '100%',
    recoveryReason: '',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: false,
    status: 'completed',
    createdBy: {
      id: 'preparer-1',
      name: 'Taylor Smith',
      role: 'preparer',
    },
    assignedTo: {
      id: 'admin-1',
      name: 'Jordan Lee',
      role: 'admin',
    },
    createdAt: '2025-05-01T13:20:00Z',
    updatedAt: '2025-05-05T10:10:00Z',
    comments: [],
    history: [
      {
        id: 'hist-9',
        action: 'Created form',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-01T13:20:00Z',
      },
      {
        id: 'hist-10',
        action: 'Assigned to Jordan Lee',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-01T13:25:00Z',
      },
      {
        id: 'hist-11',
        action: 'Status changed to active',
        performedBy: 'Jordan Lee',
        timestamp: '2025-05-02T09:30:00Z',
      },
      {
        id: 'hist-12',
        action: 'Status changed to completed',
        performedBy: 'Jordan Lee',
        timestamp: '2025-05-05T10:10:00Z',
      },
    ],
  },
];

// Sample email data
const sampleEmails: EmailThread[] = [
  {
    id: 'email-1',
    clientName: 'Anita Patel',
    clientEmail: 'anita.patel@outlook.com',
    subject: 'Your 2023 Tax Return is Ready',
    linkedFormId: 'form-2',
    status: 'pending',
    createdAt: '2025-05-09T14:30:00Z',
    updatedAt: '2025-05-09T14:30:00Z',
    lastContactDate: '2025-05-09T14:30:00Z',
    messages: [
      {
        id: 'message-1',
        from: 'jordan@clearhouse.ca',
        to: ['anita.patel@outlook.com'],
        subject: 'Your 2023 Tax Return is Ready',
        content: `Dear Anita Patel,

I hope this email finds you well. Your 2023 tax return has been prepared and is ready for your review and signature.

Tax Summary:
- Tax owing: $2,450 CAD
- Filing deadline: May 31, 2025
- Installment payments will be required for next year

Please find attached:
1. Form T183 (Electronic Filing Authorization)
2. Invoice #INV-10255

To proceed with filing, please:
1. Review the attached documents
2. Sign Form T183 electronically
3. Return the signed form to us by email

Should you have any questions, please don't hesitate to contact me.

Best regards,
Jordan Lee
Senior Tax Advisor
ClearHouse Tax Consultancy`,
        attachments: [
          {
            name: 'Form_T183_Patel.pdf',
            url: '#',
          },
          {
            name: 'Invoice_10255.pdf',
            url: '#',
          },
        ],
        sentAt: '2025-05-09T14:30:00Z',
      },
    ],
    notes: [],
    assignedTo: {
      id: 'admin-1',
      name: 'Jordan Lee',
    },
  },
  {
    id: 'email-2',
    clientName: 'Rohit Sharma',
    clientEmail: 'rohit.sharma@gmail.com',
    subject: 'Your 2023 Tax Return: Additional Information Needed',
    linkedFormId: 'form-1',
    status: 'replied',
    createdAt: '2025-05-10T15:45:00Z',
    updatedAt: '2025-05-11T09:20:00Z',
    lastContactDate: '2025-05-11T09:20:00Z',
    messages: [
      {
        id: 'message-2',
        from: 'jordan@clearhouse.ca',
        to: ['rohit.sharma@gmail.com'],
        subject: 'Your 2023 Tax Return: Additional Information Needed',
        content: `Dear Rohit Sharma,

I'm currently reviewing your 2023 tax return and require some additional information regarding your foreign income.

Could you please provide:
1. Details of your foreign investments
2. Any tax withheld on foreign income
3. Dates of purchase/sale for any investments sold in 2023

This information will help ensure we maximize your tax position.

Thank you for your assistance.

Best regards,
Jordan Lee
Senior Tax Advisor
ClearHouse Tax Consultancy`,
        attachments: [],
        sentAt: '2025-05-10T15:45:00Z',
        readAt: '2025-05-10T17:30:00Z',
      },
      {
        id: 'message-3',
        from: 'rohit.sharma@gmail.com',
        to: ['jordan@clearhouse.ca'],
        subject: 'Re: Your 2023 Tax Return: Additional Information Needed',
        content: `Hi Jordan,

Thanks for your email. I've attached a spreadsheet with all my foreign investment details, including dates and withheld taxes.

Please let me know if you need anything else.

Best,
Rohit`,
        attachments: [
          {
            name: 'Foreign_Investments_2023.xlsx',
            url: '#',
          },
        ],
        sentAt: '2025-05-11T09:20:00Z',
      },
    ],
    notes: [
      {
        id: 'note-1',
        text: 'Client has US dividends that qualify for foreign tax credit',
        createdBy: 'Jordan Lee',
        createdAt: '2025-05-11T10:15:00Z',
      }
    ],
    assignedTo: {
      id: 'admin-1',
      name: 'Jordan Lee',
    },
  },
  {
    id: 'email-3',
    clientName: 'Sarah Williams',
    clientEmail: 'swilliams@mail.com',
    subject: 'Your 2023 Tax Return is Complete',
    linkedFormId: 'form-4',
    status: 'we-replied',
    createdAt: '2025-05-05T10:30:00Z',
    updatedAt: '2025-05-07T08:45:00Z',
    lastContactDate: '2025-05-07T08:45:00Z',
    messages: [
      {
        id: 'message-4',
        from: 'jordan@clearhouse.ca',
        to: ['swilliams@mail.com'],
        subject: 'Your 2023 Tax Return is Complete',
        content: `Dear Sarah Williams,

I'm pleased to inform you that your 2023 tax return has been completed and filed with the CRA.

Tax Summary:
- Tax refund: $875 CAD
- Direct deposit expected within 10-14 business days

Please find attached:
1. Copy of your filed return
2. Invoice #INV-10257 (paid)

Thank you for choosing ClearHouse for your tax needs. If you have any questions, please don't hesitate to reach out.

Best regards,
Jordan Lee
Senior Tax Advisor
ClearHouse Tax Consultancy`,
        attachments: [
          {
            name: 'Return_Copy_Williams_2023.pdf',
            url: '#',
          },
          {
            name: 'Receipt_INV-10257.pdf',
            url: '#',
          },
        ],
        sentAt: '2025-05-05T10:30:00Z',
      },
      {
        id: 'message-5',
        from: 'swilliams@mail.com',
        to: ['jordan@clearhouse.ca'],
        subject: 'Re: Your 2023 Tax Return is Complete',
        content: `Hi Jordan,

Thanks for completing my return so quickly! I checked my CRA account and can see it's been processed.

I do have one question - will the tuition credits carry forward automatically for next year?

Thanks,
Sarah`,
        attachments: [],
        sentAt: '2025-05-06T16:20:00Z',
      },
      {
        id: 'message-6',
        from: 'jordan@clearhouse.ca',
        to: ['swilliams@mail.com'],
        subject: 'Re: Your 2023 Tax Return is Complete',
        content: `Hi Sarah,

Great to hear your return has been processed!

Yes, any unused tuition credits will automatically carry forward to future tax years. In your case, you have $4,300 in unused credits that will be available for your 2024 return.

Let me know if you have any other questions.

Best regards,
Jordan Lee
Senior Tax Advisor
ClearHouse Tax Consultancy`,
        attachments: [],
        sentAt: '2025-05-07T08:45:00Z',
      },
    ],
    notes: [
      {
        id: 'note-2',
        text: 'Client may qualify for additional education deductions next year',
        createdBy: 'Jordan Lee',
        createdAt: '2025-05-07T09:00:00Z',
      }
    ],
    assignedTo: {
      id: 'admin-1',
      name: 'Jordan Lee',
    },
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [forms, setForms] = useState<CloseoutForm[]>(sampleForms);
  const [emails, setEmails] = useState<EmailThread[]>(sampleEmails);

  const createForm = useCallback((form: Omit<CloseoutForm, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'history'>) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    const newForm: CloseoutForm = {
      ...form,
      id: `form-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      comments: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          action: 'Created form',
          performedBy: user.name,
          timestamp: now,
        },
      ],
    };
    
    setForms(prevForms => [...prevForms, newForm]);
    toast.success('Closeout form created successfully!');
  }, [user]);

  const updateFormStatus = useCallback((formId: string, status: FormStatus, comment?: string) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    
    setForms(prevForms => {
      return prevForms.map(form => {
        if (form.id === formId) {
          const updatedForm = { 
            ...form, 
            status, 
            updatedAt: now,
            history: [
              ...form.history,
              {
                id: `hist-${Date.now()}`,
                action: `Status changed to ${status}`,
                performedBy: user.name,
                timestamp: now,
              }
            ]
          };
          
          if (comment) {
            updatedForm.comments = [
              ...form.comments,
              {
                id: `comment-${Date.now()}`,
                text: comment,
                createdBy: user.name,
                createdAt: now,
              }
            ];
          }
          
          return updatedForm;
        }
        return form;
      });
    });
    
    toast.success(`Form status updated to ${status}`);
  }, [user]);

  const updateForm = useCallback((formId: string, updatedForm: CloseoutForm) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    
    setForms(prevForms => {
      return prevForms.map(form => {
        if (form.id === formId) {
          return {
            ...updatedForm,
            updatedAt: now,
            history: [
              ...form.history,
              {
                id: `hist-${Date.now()}`,
                action: 'Form updated',
                performedBy: user.name,
                timestamp: now,
              }
            ]
          };
        }
        return form;
      });
    });
    
    toast.success('Form updated successfully');
  }, [user]);

  const assignForm = useCallback((formId: string, assigneeId: string, assigneeName: string) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    
    setForms(prevForms => {
      return prevForms.map(form => {
        if (form.id === formId) {
          return {
            ...form,
            assignedTo: {
              id: assigneeId,
              name: assigneeName,
              role: 'admin', // Assuming we're assigning to admins
            },
            updatedAt: now,
            history: [
              ...form.history,
              {
                id: `hist-${Date.now()}`,
                action: `Assigned to ${assigneeName}`,
                performedBy: user.name,
                timestamp: now,
              }
            ]
          };
        }
        return form;
      });
    });
    
    toast.success(`Form assigned to ${assigneeName}`);
  }, [user]);

  const createEmail = useCallback((emailData: Omit<EmailThread, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'notes'>) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    const newEmail: EmailThread = {
      ...emailData,
      id: `email-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      lastContactDate: now,
      messages: [],
      notes: [],
    };
    
    setEmails(prevEmails => [...prevEmails, newEmail]);
    toast.success('Email thread created successfully!');
  }, [user]);

  const addEmailReply = useCallback((emailId: string, messageData: { content: string }) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    
    setEmails(prevEmails => {
      return prevEmails.map(email => {
        if (email.id === emailId) {
          const lastMessage = email.messages[email.messages.length - 1];
          
          // Determine if this is a reply from us or from client
          const isClientReply = lastMessage && lastMessage.from.includes('clearhouse.ca');
          const newStatus: EmailStatus = isClientReply ? 'replied' : 'we-replied';
          
          const newMessage = {
            id: `message-${Date.now()}`,
            from: isClientReply ? email.clientEmail : user.email,
            to: [isClientReply ? user.email : email.clientEmail],
            subject: `Re: ${email.subject}`,
            content: messageData.content,
            attachments: [],
            sentAt: now,
          };
          
          return {
            ...email,
            status: newStatus,
            updatedAt: now,
            lastContactDate: now,
            messages: [...email.messages, newMessage],
          };
        }
        return email;
      });
    });
    
    toast.success('Reply added to email thread');
  }, [user]);

  const addEmailNote = useCallback((emailId: string, noteText: string) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    
    setEmails(prevEmails => {
      return prevEmails.map(email => {
        if (email.id === emailId) {
          return {
            ...email,
            updatedAt: now,
            notes: [
              ...email.notes,
              {
                id: `note-${Date.now()}`,
                text: noteText,
                createdBy: user.name,
                createdAt: now,
              }
            ]
          };
        }
        return email;
      });
    });
    
    toast.success('Note added to email thread');
  }, [user]);

  const reassignEmail = useCallback((emailId: string, assigneeId: string, assigneeName: string) => {
    setEmails(prevEmails => {
      return prevEmails.map(email => {
        if (email.id === emailId) {
          return {
            ...email,
            assignedTo: {
              id: assigneeId,
              name: assigneeName,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return email;
      });
    });
    
    toast.success(`Email reassigned to ${assigneeName}`);
  }, []);

  const getPreviousYearForms = useCallback((clientName: string, currentFormId?: string) => {
    // Get all forms for this client except the current one
    let previousForms = forms.filter(form => 
      form.clientName === clientName && 
      form.id !== currentFormId
    );
    
    // Special handling for Rohit Sharma - only show the most recent form
    if (clientName === 'Rohit Sharma') {
      previousForms = previousForms
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 1);
    }
    
    return previousForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [forms]);

  const getFormById = useCallback((formId: string) => {
    return forms.find(form => form.id === formId);
  }, [forms]);

  const getEmailById = useCallback((emailId: string) => {
    return emails.find(email => email.id === emailId);
  }, [emails]);

  return (
    <DataContext.Provider value={{
      forms,
      emails,
      createForm,
      updateFormStatus,
      updateForm,
      assignForm,
      createEmail,
      addEmailReply,
      addEmailNote,
      reassignEmail,
      getFormById,
      getEmailById,
      getPreviousYearForms,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

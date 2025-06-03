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
  invoiceDescription: string; // NEW FIELD
  billDetail: string;
  paymentRequired: boolean;
  wipRecovery: string;
  recoveryReason?: string;
  isT1: boolean;
  isS216: boolean;
  isS116: boolean;
  isPaperFiled: boolean;
  installmentsRequired: boolean;
  // New filing detail fields
  t106: boolean; // NEW FIELD
  t1134: boolean; // NEW FIELD
  ontarioAnnualReturn: boolean; // NEW FIELD
  tSlips: boolean; // NEW FIELD
  quebecReturn: boolean; // NEW FIELD
  albertaReturn: boolean; // NEW FIELD
  // Existing fields
  t2091PrincipalResidence: boolean;
  t1135ForeignProperty: boolean;
  t1032PensionSplit: boolean;
  hstDraftOrFinal: string;
  otherNotes: string;
  otherDocuments: string; // NEW FIELD
  // Tax installment fields
  corporateInstallmentsRequired: boolean; // NEW FIELD
  fedScheduleAttached: boolean; // NEW FIELD
  hstInstallmentRequired: boolean; // NEW FIELD
  hstTabCompleted: boolean; // NEW FIELD
  // T1 Summary fields
  priorPeriodsBalance: string;
  taxesPayable: string;
  installmentsDuringYear: string;
  installmentsAfterYear: string;
  amountOwing: string;
  dueDate: string;
  // HST Summary fields
  hstPriorBalance: string;
  hstPayable: string;
  hstInstallmentsDuring: string;
  hstInstallmentsAfter: string;
  hstPaymentDue: string;
  hstDueDate: string;
  // Installment attachment (from primary member)
  installmentAttachment: {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  } | null;
  // Family members data (for displaying all members in view)
  familyMembers?: {
    id: string;
    clientName: string;
    signingPerson: string;
    signingEmail: string;
    additionalEmails: string[];
    isT1: boolean;
    isS216: boolean;
    isS116: boolean;
    isPaperFiled: boolean;
    installmentsRequired: boolean;
    personalTaxPayment: string;
    installmentAttachment: {
      fileName: string;
      fileUrl: string;
      uploadedAt: string;
    } | null;
  }[];
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

// Enhanced sample form data with more pending forms for admin section
const sampleForms: CloseoutForm[] = [
  // Rohit Sharma - 2022 Tax Year (Previous Year - Completed)
  {
    id: 'form-rohit-2022',
    clientName: 'Rohit Sharma',
    filePath: '\\\\Clearhouse\\Clients\\Rohit_2022\\T1',
    signingPerson: 'Rohit Sharma',
    signingEmail: 'rohit.sharma@gmail.com',
    additionalEmails: ['accountant@sharma.com'],
    partner: 'Priya S.',
    manager: 'Deepak Jain',
    years: '2022',
    jobNumber: '10152-T1',
    invoiceAmount: '$295 CAD',
    invoiceDescription: 'Personal T1 + RRSP + Foreign Income',
    billDetail: 'Personal T1 + RRSP + Foreign Income',
    paymentRequired: true,
    wipRecovery: '100%',
    recoveryReason: 'N/A',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: false,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: false,
    t1135ForeignProperty: true,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'Final',
    otherNotes: 'Client moved to new address during tax year',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: false,
    hstTabCompleted: false,
    // T1 Summary fields
    priorPeriodsBalance: '0',
    taxesPayable: '-1,250.00',
    installmentsDuringYear: '0',
    installmentsAfterYear: '0',
    amountOwing: '-1,250.00',
    dueDate: 'April 30, 2023',
    // HST Summary fields
    hstPriorBalance: '0',
    hstPayable: '0',
    hstInstallmentsDuring: '0',
    hstInstallmentsAfter: '0',
    hstPaymentDue: '0',
    hstDueDate: 'June 15, 2023',
    // Installment attachment
    installmentAttachment: null,
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
    createdAt: '2023-03-15T14:30:00Z',
    updatedAt: '2023-04-20T16:45:00Z',
    comments: [],
    history: [
      {
        id: 'hist-rohit-2022-1',
        action: 'Created form',
        performedBy: 'Taylor Smith',
        timestamp: '2023-03-15T14:30:00Z',
      },
      {
        id: 'hist-rohit-2022-2',
        action: 'Status changed to completed',
        performedBy: 'Jordan Lee',
        timestamp: '2023-04-20T16:45:00Z',
      },
    ],
  },
  // Rohit Sharma - 2023 Tax Year (Most Recent Previous Year - Completed)
  {
    id: 'form-rohit-2023',
    clientName: 'Rohit Sharma',
    filePath: '\\\\Clearhouse\\Clients\\Rohit_2023\\T1',
    signingPerson: 'Rohit Sharma',
    signingEmail: 'rohit.sharma@gmail.com',
    additionalEmails: ['accountant@sharma.com'],
    partner: 'Priya S.',
    manager: 'Deepak Jain',
    years: '2023',
    jobNumber: '10254-T1',
    invoiceAmount: '$348 CAD',
    invoiceDescription: 'Personal T1 + Foreign Income + Donation Sched.',
    billDetail: 'Personal T1 + Foreign Income + Donation Sched.',
    paymentRequired: true,
    wipRecovery: '100%',
    recoveryReason: 'N/A',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: true,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: false,
    t1135ForeignProperty: true,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'Final',
    otherNotes: 'Client requires electronic filing confirmation',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: false,
    hstTabCompleted: false,
    // T1 Summary fields
    priorPeriodsBalance: '0',
    taxesPayable: '-3,762.00',
    installmentsDuringYear: '2,000.00',
    installmentsAfterYear: '0',
    amountOwing: '-3,762.00',
    dueDate: 'April 30, 2024',
    // HST Summary fields
    hstPriorBalance: '0',
    hstPayable: '0',
    hstInstallmentsDuring: '0',
    hstInstallmentsAfter: '0',
    hstPaymentDue: '0',
    hstDueDate: 'June 15, 2024',
    // Installment attachment
    installmentAttachment: {
      fileName: 'installment_schedule_2023.pdf',
      fileUrl: '#',
      uploadedAt: '2024-05-10T14:30:00Z'
    },
    familyMembers: [{
      id: '1',
      clientName: 'Rohit Sharma',
      signingPerson: 'Rohit Sharma',
      signingEmail: 'rohit.sharma@gmail.com',
      additionalEmails: ['accountant@sharma.com'],
      isT1: true,
      isS216: false,
      isS116: false,
      isPaperFiled: false,
      installmentsRequired: true,
      personalTaxPayment: '$2,000.00',
      installmentAttachment: {
        fileName: 'installment_schedule_2023.pdf',
        fileUrl: '#',
        uploadedAt: '2024-05-10T14:30:00Z'
      }
    }],
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
    createdAt: '2024-03-10T14:30:00Z',
    updatedAt: '2024-04-25T14:30:00Z',
    comments: [],
    history: [
      {
        id: 'hist-rohit-2023-1',
        action: 'Created form',
        performedBy: 'Taylor Smith',
        timestamp: '2024-03-10T14:30:00Z',
      },
      {
        id: 'hist-rohit-2023-2',
        action: 'Assigned to Jordan Lee',
        performedBy: 'Taylor Smith',
        timestamp: '2024-03-10T14:35:00Z',
      },
      {
        id: 'hist-rohit-2023-3',
        action: 'Status changed to completed',
        performedBy: 'Jordan Lee',
        timestamp: '2024-04-25T14:30:00Z',
      },
    ],
  },
  // Other existing clients with their forms...
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
    invoiceDescription: 'Personal T1 + Rental Income + Self-Employment',
    billDetail: 'Personal T1 + Rental Income + Self-Employment',
    paymentRequired: false,
    wipRecovery: '85%',
    recoveryReason: 'Long-time client relationship',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: true,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: false,
    t1135ForeignProperty: false,
    t1032PensionSplit: true,
    hstDraftOrFinal: 'Draft',
    otherNotes: 'Client prefers email communication only',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: true,
    hstTabCompleted: false,
    priorPeriodsBalance: '150.00',
    taxesPayable: '2,450.00',
    installmentsDuringYear: '1,500.00',
    installmentsAfterYear: '300.00',
    amountOwing: '1,100.00',
    dueDate: 'May 31, 2024',
    hstPriorBalance: '0',
    hstPayable: '650.00',
    hstInstallmentsDuring: '200.00',
    hstInstallmentsAfter: '0',
    hstPaymentDue: '450.00',
    hstDueDate: 'June 15, 2024',
    installmentAttachment: null,
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
  // ... keep existing code (other sample forms - adding all the new fields with default values)
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
    invoiceDescription: 'Personal T1 + Foreign Investment + Stock Options',
    billDetail: 'Personal T1 + Foreign Investment + Stock Options',
    paymentRequired: true,
    wipRecovery: '110%',
    recoveryReason: 'Complex file, additional work required',
    isT1: true,
    isS216: true,
    isS116: false,
    isPaperFiled: true,
    installmentsRequired: true,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: true,
    t1135ForeignProperty: true,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'Final',
    otherNotes: 'Complex foreign investment structure requires additional documentation',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: true,
    hstTabCompleted: true,
    priorPeriodsBalance: '500.00',
    taxesPayable: '8,250.00',
    installmentsDuringYear: '3,000.00',
    installmentsAfterYear: '1,000.00',
    amountOwing: '4,750.00',
    dueDate: 'April 30, 2024',
    hstPriorBalance: '0',
    hstPayable: '1,200.00',
    hstInstallmentsDuring: '400.00',
    hstInstallmentsAfter: '200.00',
    hstPaymentDue: '600.00',
    hstDueDate: 'June 15, 2024',
    installmentAttachment: null,
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
    invoiceDescription: 'Personal T1 + Tuition Credits',
    billDetail: 'Personal T1 + Tuition Credits',
    paymentRequired: false,
    wipRecovery: '100%',
    recoveryReason: '',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: false,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: false,
    t1135ForeignProperty: false,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'N/A',
    otherNotes: 'Simple return, student file',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: false,
    hstTabCompleted: false,
    priorPeriodsBalance: '0',
    taxesPayable: '-875.00',
    installmentsDuringYear: '0',
    installmentsAfterYear: '0',
    amountOwing: '-875.00',
    dueDate: 'April 30, 2024',
    hstPriorBalance: '0',
    hstPayable: '0',
    hstInstallmentsDuring: '0',
    hstInstallmentsAfter: '0',
    hstPaymentDue: '0',
    hstDueDate: 'N/A',
    installmentAttachment: null,
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
  // New pending forms for admin section - adding all the new fields with default values
  {
    id: 'form-pending-1',
    clientName: 'Jennifer Chen',
    filePath: '\\\\Clearhouse\\Clients\\Chen_2024\\T1',
    signingPerson: 'Jennifer Chen',
    signingEmail: 'jennifer.chen@email.com',
    additionalEmails: [],
    partner: 'Priya S.',
    manager: 'Deepak Jain',
    years: '2023',
    jobNumber: '10301-T1',
    invoiceAmount: '$425 CAD',
    invoiceDescription: 'Personal T1 + Investment Income',
    billDetail: 'Personal T1 + Investment Income',
    paymentRequired: true,
    wipRecovery: '100%',
    recoveryReason: '',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: true,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: false,
    t1135ForeignProperty: false,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'Final',
    otherNotes: 'Client has new investment portfolio',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: false,
    hstTabCompleted: false,
    priorPeriodsBalance: '0',
    taxesPayable: '1,850.00',
    installmentsDuringYear: '0',
    installmentsAfterYear: '500.00',
    amountOwing: '1,850.00',
    dueDate: 'April 30, 2024',
    hstPriorBalance: '0',
    hstPayable: '0',
    hstInstallmentsDuring: '0',
    hstInstallmentsAfter: '0',
    hstPaymentDue: '0',
    hstDueDate: 'N/A',
    installmentAttachment: null,
    status: 'pending',
    createdBy: {
      id: 'preparer-1',
      name: 'Taylor Smith',
      role: 'preparer',
    },
    assignedTo: null,
    createdAt: '2025-05-30T08:15:00Z',
    updatedAt: '2025-05-30T08:15:00Z',
    comments: [],
    history: [
      {
        id: 'hist-pending-1-1',
        action: 'Created form',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-30T08:15:00Z',
      },
    ],
  },
  {
    id: 'form-pending-2',
    clientName: 'David Kumar',
    filePath: '\\\\Clearhouse\\Clients\\Kumar_2024\\T1',
    signingPerson: 'David Kumar',
    signingEmail: 'david.kumar@company.com',
    additionalEmails: ['spouse@kumar.com'],
    partner: 'Amil R.',
    manager: 'Sanjay V.',
    years: '2023',
    jobNumber: '10302-T1',
    invoiceAmount: '$680 CAD',
    invoiceDescription: 'Personal T1 + Rental Income + Business',
    billDetail: 'Personal T1 + Rental Income + Business',
    paymentRequired: true,
    wipRecovery: '95%',
    recoveryReason: 'Existing client discount',
    isT1: true,
    isS216: true,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: false,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: true,
    t1135ForeignProperty: false,
    t1032PensionSplit: true,
    hstDraftOrFinal: 'Final',
    otherNotes: 'Complex rental property transactions',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: true,
    hstTabCompleted: true,
    priorPeriodsBalance: '250.00',
    taxesPayable: '3,200.00',
    installmentsDuringYear: '1,000.00',
    installmentsAfterYear: '0',
    amountOwing: '2,450.00',
    dueDate: 'April 30, 2024',
    hstPriorBalance: '0',
    hstPayable: '850.00',
    hstInstallmentsDuring: '300.00',
    hstInstallmentsAfter: '0',
    hstPaymentDue: '550.00',
    hstDueDate: 'June 15, 2024',
    installmentAttachment: null,
    status: 'pending',
    createdBy: {
      id: 'preparer-2',
      name: 'Alex Morgan',
      role: 'preparer',
    },
    assignedTo: null,
    createdAt: '2025-05-30T09:30:00Z',
    updatedAt: '2025-05-30T09:30:00Z',
    comments: [],
    history: [
      {
        id: 'hist-pending-2-1',
        action: 'Created form',
        performedBy: 'Alex Morgan',
        timestamp: '2025-05-30T09:30:00Z',
      },
    ],
  },
  {
    id: 'form-pending-3',
    clientName: 'Lisa Thompson',
    filePath: '\\\\Clearhouse\\Clients\\Thompson_2024\\T1',
    signingPerson: 'Lisa Thompson',
    signingEmail: 'lisa.thompson@gmail.com',
    additionalEmails: [],
    partner: 'Priya S.',
    manager: 'Deepak Jain',
    years: '2023',
    jobNumber: '10303-T1',
    invoiceAmount: '$395 CAD',
    invoiceDescription: 'Personal T1 + RRSP + Donation Receipts',
    billDetail: 'Personal T1 + RRSP + Donation Receipts',
    paymentRequired: false,
    wipRecovery: '100%',
    recoveryReason: '',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: true,
    installmentsRequired: false,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: false,
    t1135ForeignProperty: false,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'N/A',
    otherNotes: 'Prefers paper filing, large charitable donations',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: false,
    hstTabCompleted: false,
    priorPeriodsBalance: '0',
    taxesPayable: '-650.00',
    installmentsDuringYear: '0',
    installmentsAfterYear: '0',
    amountOwing: '-650.00',
    dueDate: 'April 30, 2024',
    hstPriorBalance: '0',
    hstPayable: '0',
    hstInstallmentsDuring: '0',
    hstInstallmentsAfter: '0',
    hstPaymentDue: '0',
    hstDueDate: 'N/A',
    installmentAttachment: null,
    status: 'pending',
    createdBy: {
      id: 'preparer-1',
      name: 'Taylor Smith',
      role: 'preparer',
    },
    assignedTo: null,
    createdAt: '2025-05-30T10:45:00Z',
    updatedAt: '2025-05-30T10:45:00Z',
    comments: [],
    history: [
      {
        id: 'hist-pending-3-1',
        action: 'Created form',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-30T10:45:00Z',
      },
    ],
  },
  {
    id: 'form-pending-4',
    clientName: 'Robert Martinez',
    filePath: '\\\\Clearhouse\\Clients\\Martinez_2024\\T1',
    signingPerson: 'Robert Martinez',
    signingEmail: 'r.martinez@business.ca',
    additionalEmails: ['accounting@martinez.ca'],
    partner: 'Amil R.',
    manager: 'Sanjay V.',
    years: '2023',
    jobNumber: '10304-T1',
    invoiceAmount: '$950 CAD',
    invoiceDescription: 'Personal T1 + Self-Employment + Foreign Income',
    billDetail: 'Personal T1 + Self-Employment + Foreign Income',
    paymentRequired: true,
    wipRecovery: '110%',
    recoveryReason: 'Complex international tax issues',
    isT1: true,
    isS216: true,
    isS116: true,
    isPaperFiled: false,
    installmentsRequired: true,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: false,
    t1135ForeignProperty: true,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'Final',
    otherNotes: 'Multi-jurisdiction income, requires careful review',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: true,
    hstTabCompleted: true,
    priorPeriodsBalance: '750.00',
    taxesPayable: '5,200.00',
    installmentsDuringYear: '2,000.00',
    installmentsAfterYear: '1,200.00',
    amountOwing: '2,750.00',
    dueDate: 'April 30, 2024',
    hstPriorBalance: '150.00',
    hstPayable: '1,350.00',
    hstInstallmentsDuring: '500.00',
    hstInstallmentsAfter: '300.00',
    hstPaymentDue: '700.00',
    hstDueDate: 'June 15, 2024',
    installmentAttachment: null,
    status: 'pending',
    createdBy: {
      id: 'preparer-2',
      name: 'Alex Morgan',
      role: 'preparer',
    },
    assignedTo: null,
    createdAt: '2025-05-30T11:20:00Z',
    updatedAt: '2025-05-30T11:20:00Z',
    comments: [],
    history: [
      {
        id: 'hist-pending-4-1',
        action: 'Created form',
        performedBy: 'Alex Morgan',
        timestamp: '2025-05-30T11:20:00Z',
      },
    ],
  },
  {
    id: 'form-pending-5',
    clientName: 'Maria Rodriguez',
    filePath: '\\\\Clearhouse\\Clients\\Rodriguez_2024\\T1',
    signingPerson: 'Maria Rodriguez',
    signingEmail: 'maria.rodriguez@email.com',
    additionalEmails: [],
    partner: 'Priya S.',
    manager: 'Deepak Jain',
    years: '2023',
    jobNumber: '10305-T1',
    invoiceAmount: '$340 CAD',
    invoiceDescription: 'Personal T1 + Medical Expenses',
    billDetail: 'Personal T1 + Medical Expenses',
    paymentRequired: true,
    wipRecovery: '100%',
    recoveryReason: '',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: false,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: false,
    t1135ForeignProperty: false,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'N/A',
    otherNotes: 'Significant medical expenses for tax credit',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: false,
    hstTabCompleted: false,
    priorPeriodsBalance: '0',
    taxesPayable: '-450.00',
    installmentsDuringYear: '0',
    installmentsAfterYear: '0',
    amountOwing: '-450.00',
    dueDate: 'April 30, 2024',
    hstPriorBalance: '0',
    hstPayable: '0',
    hstInstallmentsDuring: '0',
    hstInstallmentsAfter: '0',
    hstPaymentDue: '0',
    hstDueDate: 'N/A',
    installmentAttachment: null,
    status: 'pending',
    createdBy: {
      id: 'preparer-1',
      name: 'Taylor Smith',
      role: 'preparer',
    },
    assignedTo: null,
    createdAt: '2025-05-30T12:10:00Z',
    updatedAt: '2025-05-30T12:10:00Z',
    comments: [],
    history: [
      {
        id: 'hist-pending-5-1',
        action: 'Created form',
        performedBy: 'Taylor Smith',
        timestamp: '2025-05-30T12:10:00Z',
      },
    ],
  },
  {
    id: 'form-pending-6',
    clientName: 'James Wilson',
    filePath: '\\\\Clearhouse\\Clients\\Wilson_2024\\T1',
    signingPerson: 'James Wilson',
    signingEmail: 'james.wilson@contractor.ca',
    additionalEmails: ['office@wilson.ca'],
    partner: 'Amil R.',
    manager: 'Sanjay V.',
    years: '2023',
    jobNumber: '10306-T1',
    invoiceAmount: '$720 CAD',
    invoiceDescription: 'Personal T1 + Business Income + Equipment Depreciation',
    billDetail: 'Personal T1 + Business Income + Equipment Depreciation',
    paymentRequired: true,
    wipRecovery: '105%',
    recoveryReason: 'Additional depreciation calculations required',
    isT1: true,
    isS216: false,
    isS116: true,
    isPaperFiled: false,
    installmentsRequired: true,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: false,
    tSlips: false,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: false,
    t1135ForeignProperty: false,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'Final',
    otherNotes: 'Construction contractor with significant equipment purchases',
    otherDocuments: '',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: true,
    hstTabCompleted: true,
    priorPeriodsBalance: '300.00',
    taxesPayable: '2,850.00',
    installmentsDuringYear: '1,200.00',
    installmentsAfterYear: '400.00',
    amountOwing: '1,950.00',
    dueDate: 'April 30, 2024',
    hstPriorBalance: '0',
    hstPayable: '950.00',
    hstInstallmentsDuring: '400.00',
    hstInstallmentsAfter: '150.00',
    hstPaymentDue: '400.00',
    hstDueDate: 'June 15, 2024',
    installmentAttachment: null,
    status: 'pending',
    createdBy: {
      id: 'preparer-2',
      name: 'Alex Morgan',
      role: 'preparer',
    },
    assignedTo: null,
    createdAt: '2025-05-30T13:15:00Z',
    updatedAt: '2025-05-30T13:15:00Z',
    comments: [],
    history: [
      {
        id: 'hist-pending-6-1',
        action: 'Created form',
        performedBy: 'Alex Morgan',
        timestamp: '2025-05-30T13:15:00Z',
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
    linkedFormId: 'form-rohit-2023',
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
              role: 'admin',
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
    let previousForms = forms.filter(form => 
      form.clientName === clientName && 
      form.id !== currentFormId
    );
    
    // For Rohit Sharma, show the most recent completed form (2023) as reference
    if (clientName === 'Rohit Sharma') {
      previousForms = previousForms
        .filter(form => form.status === 'completed')
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

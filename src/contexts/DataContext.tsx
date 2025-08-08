import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { createForm, updateFormStatus as updateFormStatusAPI, updateForm as updateFormAPI, fetchAdminUsers, reassignForm, fetchForms as fetchFormsAPI } from '@/services/api';

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
  // Additional fields from form components
  tSlipType?: string;
  personalTaxInstallmentsRequired?: boolean;
  hstInstallmentsRequired?: boolean;
  outstandingTaxBalance?: string;
  yearlyAmounts?: Array<{
    year: string;
    amount: string;
  }>;
  // T1 Summary fields
  priorPeriodsBalance: string;
  taxesPayable: string;
  installmentsDuringYear: string;
  installmentsAfterYear: string;
  amountOwing: string;
  dueDate: string;
  taxPaymentDueDate?: string;
  returnFilingDueDate?: 'April 30' | 'June 15';
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
  amendmentSentBy?: {
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
  rejectionReason?: string;
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
  createForm: (form: Omit<CloseoutForm, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'history'>) => Promise<void>;
  updateFormStatus: (formId: string, status: FormStatus, comment?: string, amendmentNote?: string) => Promise<void>;
  updateForm: (formId: string, updatedForm: CloseoutForm) => void;
  assignForm: (formId: string, assigneeId: string, assigneeName: string) => Promise<void>;
  reassignForm: (formId: string, assignedToId: string) => Promise<void>;
  createEmail: (email: Omit<EmailThread, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'notes'>) => void;
  addEmailReply: (emailId: string, message: { content: string }) => void;
  addEmailNote: (emailId: string, note: string) => void;
  reassignEmail: (emailId: string, assigneeId: string, assigneeName: string) => void;
  getFormById: (formId: string) => CloseoutForm | undefined;
  getEmailById: (emailId: string) => EmailThread | undefined;
  getPreviousYearForms: (clientName: string, currentFormId?: string) => CloseoutForm[];
}

// Enhanced sample form data with more pending forms for admin section
const initialForms: CloseoutForm[] = [
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
    taxPaymentDueDate: 'April 30, 2023',
    returnFilingDueDate: 'April 30',
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
  // Add new demo form with multiple family members
  {
    id: 'form-pending-demo-multiple',
    clientName: 'Amit Sharma (Primary)',
    filePath: '\\\\Clearhouse\\Clients\\Sharma_Family_2024\\T1',
    signingPerson: 'Amit Sharma',
    signingEmail: 'amit@gmail.com',
    additionalEmails: ['family@sharma.com'],
    partner: 'Jordan L.',
    manager: 'Sarah M.',
    years: '2023',
    jobNumber: '10450-T1-FAM',
    invoiceAmount: '$1,850 CAD',
    invoiceDescription: 'Family T1 Returns - 4 Members',
    billDetail: 'T1 only',
    paymentRequired: true,
    wipRecovery: '110%',
    recoveryReason: 'Family filing discount',
    isT1: true,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: true,
    t106: false,
    t1134: false,
    ontarioAnnualReturn: true,
    tSlips: true,
    quebecReturn: false,
    albertaReturn: false,
    t2091PrincipalResidence: false,
    t1135ForeignProperty: false,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'Draft',
    otherNotes: 'Family T1 returns for all 4 members',
    otherDocuments: 'Family T1 returns for all 4 members',
    corporateInstallmentsRequired: false,
    fedScheduleAttached: true,
    hstInstallmentRequired: false,
    hstTabCompleted: false,
    // T1 Summary fields
    priorPeriodsBalance: '300.00',
    taxesPayable: '4,200.00',
    installmentsDuringYear: '1,500.00',
    installmentsAfterYear: '500.00',
    amountOwing: '2,500.00',
    dueDate: 'April 30, 2024',
    // HST Summary fields
    hstPriorBalance: '0',
    hstPayable: '0',
    hstInstallmentsDuring: '0',
    hstInstallmentsAfter: '0',
    hstPaymentDue: '0',
    hstDueDate: 'N/A',
    installmentAttachment: {
      fileName: 'family_installment_schedule_2023.pdf',
      fileUrl: '#',
      uploadedAt: '2025-06-01T09:05:00Z'
    },
    status: 'pending' as const,
    createdBy: {
      id: 'preparer-1',
      name: 'Jennifer Wilson',
      role: 'preparer'
    },
    assignedTo: null,
    createdAt: '2025-06-01T09:00:00Z',
    updatedAt: '2025-06-01T09:00:00Z',
    comments: [],
    history: [
      {
        id: 'hist-demo-1',
        action: 'Created family form with 4 members',
        performedBy: 'Jennifer Wilson',
        timestamp: '2025-06-01T09:00:00Z'
      }
    ],
    // Multiple family members data
    familyMembers: [
      {
        id: '1',
        clientName: 'Priya Sharma (Spouse)',
        signingPerson: 'Priya Sharma',
        signingEmail: 'priya@gmail.com',
        additionalEmails: [],
        isT1: true,
        isS216: false,
        isS116: true,
        isPaperFiled: false,
        installmentsRequired: false,
        personalTaxPayment: '$800.00',
        installmentAttachment: null
      },
      {
        id: '2',
        clientName: 'Raj Sharma (Son)',
        signingPerson: 'Amit Sharma',
        signingEmail: 'amit@gmail.com',
        additionalEmails: [],
        isT1: true,
        isS216: false,
        isS116: false,
        isPaperFiled: false,
        installmentsRequired: false,
        personalTaxPayment: '$0.00',
        installmentAttachment: null
      },
      {
        id: '3',
        clientName: 'Meera Sharma (Daughter)',
        signingPerson: 'Amit Sharma',
        signingEmail: 'amit@gmail.com',
        additionalEmails: [],
        isT1: true,
        isS216: false,
        isS116: false,
        isPaperFiled: false,
        installmentsRequired: false,
        personalTaxPayment: '$0.00',
        installmentAttachment: null
      }
    ]
  }
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
  const [forms, setForms] = useState<CloseoutForm[]>([]); // Start with empty, not initialForms
  const [emails, setEmails] = useState<EmailThread[]>(sampleEmails);

  // Fetch real forms from backend on mount
  useEffect(() => {
    fetchFormsAPI()
      .then((data) => {
        setForms(data.map(form => ({
          ...form,
          // Map backend fields to frontend structure
          clientName: form.client_name || form.clientName || form.form_data?.clientName || '',
          signingEmail: form.client_email || form.signingEmail || form.form_data?.signingEmail || '',
          signingPerson: form.form_data?.signingPerson || '',
          additionalEmails: form.form_data?.additionalEmails || [],
          partner: form.partner || form.form_data?.partner || '',
          manager: form.manager || form.form_data?.manager || '',
          years: form.years || form.form_data?.years || '',
          jobNumber: form.job_number || form.form_data?.jobNumber || '',
          invoiceAmount: form.invoice_amount || form.form_data?.invoiceAmount || '',
          invoiceDescription: form.invoice_description || form.form_data?.invoiceDescription || '',
          billDetail: form.bill_detail || form.form_data?.billDetail || '',
          paymentRequired: form.payment_required || form.form_data?.paymentRequired || false,
          wipRecovery: form.wip_recovery || form.form_data?.wipRecovery || '',
          recoveryReason: form.recovery_reason || form.form_data?.recoveryReason || '',
          isT1: form.is_t1 || form.form_data?.isT1 || false,
          isS216: form.is_s216 || form.form_data?.isS216 || false,
          isS116: form.is_s116 || form.form_data?.isS116 || false,
          isPaperFiled: form.is_paper_filed || form.form_data?.isPaperFiled || false,
          installmentsRequired: form.installments_required || form.form_data?.installmentsRequired || false,
          t106: form.t106 || form.form_data?.t106 || false,
          t1134: form.t1134 || form.form_data?.t1134 || false,
          ontarioAnnualReturn: form.ontario_annual_return || form.form_data?.ontarioAnnualReturn || false,
          tSlips: form.t_slips || form.form_data?.tSlips || false,
          quebecReturn: form.quebec_return || form.form_data?.quebecReturn || false,
          albertaReturn: form.alberta_return || form.form_data?.albertaReturn || false,
          t2091PrincipalResidence: form.t2091_principal_residence || form.form_data?.t2091PrincipalResidence || false,
          t1135ForeignProperty: form.t1135_foreign_property || form.form_data?.t1135ForeignProperty || false,
          t1032PensionSplit: form.t1032_pension_split || form.form_data?.t1032PensionSplit || false,
          hstDraftOrFinal: form.hst_draft_or_final || form.form_data?.hstDraftOrFinal || '',
          otherNotes: form.other_notes || form.form_data?.otherNotes || '',
          otherDocuments: form.other_documents || form.form_data?.otherDocuments || '',
          corporateInstallmentsRequired: form.corporate_installments_required || form.form_data?.corporateInstallmentsRequired || false,
          fedScheduleAttached: form.fed_schedule_attached || form.form_data?.fedScheduleAttached || false,
          hstInstallmentRequired: form.hst_installment_required || form.form_data?.hstInstallmentRequired || false,
          hstTabCompleted: form.hst_tab_completed || form.form_data?.hstTabCompleted || false,
          tSlipType: form.form_data?.tSlipType || '',
          personalTaxInstallmentsRequired: form.form_data?.personalTaxInstallmentsRequired || false,
          hstInstallmentsRequired: form.form_data?.hstInstallmentsRequired || false,
          outstandingTaxBalance: form.form_data?.outstandingTaxBalance || '$0.00',
          yearlyAmounts: form.form_data?.yearlyAmounts || [],
          priorPeriodsBalance: form.prior_periods_balance?.toString() || form.form_data?.priorPeriodsBalance || '',
          taxesPayable: form.taxes_payable?.toString() || form.form_data?.taxesPayable || '',
          installmentsDuringYear: form.installments_during_year?.toString() || form.form_data?.installmentsDuringYear || '',
          installmentsAfterYear: form.installments_after_year?.toString() || form.form_data?.installmentsAfterYear || '',
          amountOwing: form.amount_owing?.toString() || form.form_data?.amountOwing || '',
          dueDate: form.due_date || form.form_data?.dueDate || '',
          taxPaymentDueDate: form.form_data?.taxPaymentDueDate || '',
          returnFilingDueDate: form.form_data?.returnFilingDueDate || 'April 30',
          hstPriorBalance: form.hst_prior_balance?.toString() || form.form_data?.hstPriorBalance || '',
          hstPayable: form.hst_payable?.toString() || form.form_data?.hstPayable || '',
          hstInstallmentsDuring: form.hst_installments_during?.toString() || form.form_data?.hstInstallmentsDuring || '',
          hstInstallmentsAfter: form.hst_installments_after?.toString() || form.form_data?.hstInstallmentsAfter || '',
          hstPaymentDue: form.hst_payment_due?.toString() || form.form_data?.hstPaymentDue || '',
          hstDueDate: form.hst_due_date || form.form_data?.hstDueDate || '',
          createdAt: form.created_at || '',
          updatedAt: form.updated_at || '',
          createdBy: form.form_data?.createdBy || { 
            id: form.created_by, 
            name: form.created_by_name || 'Unknown',
            role: 'admin'
          },
          assignedTo: form.assigned_to ? {
            id: form.assigned_to,
            name: form.assigned_to_name || 'Unknown',
            role: 'admin'
          } : null,
          amendmentSentBy: form.amendment_sent_by ? {
            id: form.amendment_sent_by,
            name: form.amendment_sent_by_name || 'Unknown',
            role: 'admin'
          } : null,
          comments: form.comments || [],
          history: form.history || [],
          rejectionReason: form.rejection_reason || '',
        })));
      })
      .catch((err) => {
        toast.error('Failed to load forms from server: ' + err.message);
      });
  }, []);

  // Add reassignForm function
  const reassignForm = useCallback(async (formId: string, assignedToId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:5005/api/forms/${formId}/reassign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ assignedToId })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reassign form: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Form reassigned:', result);
      
      // Refresh forms from backend to get updated data
      const updatedForms = await fetchFormsAPI();
      setForms(updatedForms.map(form => ({
        ...form,
        // Map backend fields to frontend structure
        clientName: form.client_name || form.clientName || form.form_data?.clientName || '',
        signingEmail: form.client_email || form.signingEmail || form.form_data?.signingEmail || '',
        signingPerson: form.form_data?.signingPerson || '',
        additionalEmails: form.form_data?.additionalEmails || [],
        partner: form.partner || form.form_data?.partner || '',
        manager: form.manager || form.form_data?.manager || '',
        years: form.years || form.form_data?.years || '',
        jobNumber: form.job_number || form.form_data?.jobNumber || '',
        invoiceAmount: form.invoice_amount || form.form_data?.invoiceAmount || '',
        invoiceDescription: form.invoice_description || form.form_data?.invoiceDescription || '',
        billDetail: form.bill_detail || form.form_data?.billDetail || '',
        paymentRequired: form.payment_required || form.form_data?.paymentRequired || false,
        wipRecovery: form.wip_recovery || form.form_data?.wipRecovery || '',
        recoveryReason: form.recovery_reason || form.form_data?.recoveryReason || '',
        isT1: form.is_t1 || form.form_data?.isT1 || false,
        isS216: form.is_s216 || form.form_data?.isS216 || false,
        isS116: form.is_s116 || form.form_data?.isS116 || false,
        isPaperFiled: form.is_paper_filed || form.form_data?.isPaperFiled || false,
        installmentsRequired: form.installments_required || form.form_data?.installmentsRequired || false,
        t106: form.t106 || form.form_data?.t106 || false,
        t1134: form.t1134 || form.form_data?.t1134 || false,
        ontarioAnnualReturn: form.ontario_annual_return || form.form_data?.ontarioAnnualReturn || false,
        tSlips: form.t_slips || form.form_data?.tSlips || false,
        quebecReturn: form.quebec_return || form.form_data?.quebecReturn || false,
        albertaReturn: form.alberta_return || form.form_data?.albertaReturn || false,
        t2091PrincipalResidence: form.t2091_principal_residence || form.form_data?.t2091PrincipalResidence || false,
        t1135ForeignProperty: form.t1135_foreign_property || form.form_data?.t1135ForeignProperty || false,
        t1032PensionSplit: form.t1032_pension_split || form.form_data?.t1032PensionSplit || false,
        hstDraftOrFinal: form.hst_draft_or_final || form.form_data?.hstDraftOrFinal || '',
        otherNotes: form.other_notes || form.form_data?.otherNotes || '',
        otherDocuments: form.other_documents || form.form_data?.otherDocuments || '',
        corporateInstallmentsRequired: form.corporate_installments_required || form.form_data?.corporateInstallmentsRequired || false,
        fedScheduleAttached: form.fed_schedule_attached || form.form_data?.fedScheduleAttached || false,
        hstInstallmentRequired: form.hst_installment_required || form.form_data?.hstInstallmentRequired || false,
        hstTabCompleted: form.hst_tab_completed || form.form_data?.hstTabCompleted || false,
        tSlipType: form.form_data?.tSlipType || '',
        personalTaxInstallmentsRequired: form.form_data?.personalTaxInstallmentsRequired || false,
        hstInstallmentsRequired: form.form_data?.hstInstallmentsRequired || false,
        outstandingTaxBalance: form.form_data?.outstandingTaxBalance || '$0.00',
        yearlyAmounts: form.form_data?.yearlyAmounts || [],
        priorPeriodsBalance: form.prior_periods_balance?.toString() || form.form_data?.priorPeriodsBalance || '',
        taxesPayable: form.taxes_payable?.toString() || form.form_data?.taxesPayable || '',
        installmentsDuringYear: form.installments_during_year?.toString() || form.form_data?.installmentsDuringYear || '',
        installmentsAfterYear: form.installments_after_year?.toString() || form.form_data?.installmentsAfterYear || '',
        amountOwing: form.amount_owing?.toString() || form.form_data?.amountOwing || '',
        dueDate: form.due_date || form.form_data?.dueDate || '',
        taxPaymentDueDate: form.form_data?.taxPaymentDueDate || '',
        returnFilingDueDate: form.form_data?.returnFilingDueDate || 'April 30',
        hstPriorBalance: form.hst_prior_balance?.toString() || form.form_data?.hstPriorBalance || '',
        hstPayable: form.hst_payable?.toString() || form.form_data?.hstPayable || '',
        hstInstallmentsDuring: form.hst_installments_during?.toString() || form.form_data?.hstInstallmentsDuring || '',
        hstInstallmentsAfter: form.hst_installments_after?.toString() || form.form_data?.hstInstallmentsAfter || '',
        hstPaymentDue: form.hst_payment_due?.toString() || form.form_data?.hstPaymentDue || '',
        hstDueDate: form.hst_due_date || form.form_data?.hstDueDate || '',
        createdAt: form.created_at || '',
        updatedAt: form.updated_at || '',
        createdBy: form.form_data?.createdBy || { 
          id: form.created_by, 
          name: form.created_by_name || 'Unknown',
          role: 'admin'
        },
        assignedTo: form.assigned_to ? {
          id: form.assigned_to,
          name: form.assigned_to_name || 'Unknown',
          role: 'admin'
        } : null,
        comments: form.comments || [],
        history: form.history || [],
        rejectionReason: form.rejection_reason || '',
      })));
      
      toast.success(`Form reassigned to ${result.assignedToName} successfully!`);
    } catch (error) {
      console.error('Error reassigning form:', error);
      toast.error('Failed to reassign form. Please try again.');
    }
  }, [user]);

  const createForm = useCallback(async (form: Omit<CloseoutForm, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'history'>) => {
    if (!user) return;
    
    try {
      // First, save to backend
      const backendFormData = {
        clientEmail: form.signingEmail,
        clientName: form.clientName,
        formType: 'T1', // Default to T1 for now
        filePath: form.filePath,
        formData: form // Send the entire form data
      };
      
      console.log('DEBUG: Sending form data to backend:', JSON.stringify(backendFormData, null, 2));
      
      const response = await fetch('http://localhost:5005/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(backendFormData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend response error:', response.status, errorText);
        throw new Error(`Failed to save form to database: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Form saved to backend:', result);
      
      // Then update frontend state
      const now = new Date().toISOString();
      const newForm: CloseoutForm = {
        ...form,
        id: result.formId || `form-${Date.now()}`,
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
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error('Failed to create form. Please try again.');
    }
  }, [user]);

  const updateFormStatus = useCallback(async (formId: string, status: FormStatus, comment?: string, amendmentNote?: string) => {
    if (!user) return;
    
    try {
      // Call backend API to update form status
      const response = await updateFormStatusAPI(formId, status, comment, amendmentNote);
      
      const now = new Date().toISOString();
      
      // Update frontend state with the response from backend
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
                  action: amendmentNote ? `Form sent back for amendment: ${amendmentNote}` : `Status changed to ${status}`,
                  performedBy: user.name,
                  timestamp: now,
                }
              ]
            };
            
            // Use the backend response to update the form data correctly
            if (response.form) {
              // Update assignedTo from backend response
              if (response.form.assigned_to) {
                updatedForm.assignedTo = {
                  id: response.form.assigned_to,
                  name: response.form.assigned_to_name || 'Unknown',
                  role: 'admin' // Assuming assigned_to is always an admin
                };
              }
              
              // Update amendmentSentBy from backend response
              if (response.form.amendment_sent_by) {
                updatedForm.amendmentSentBy = {
                  id: response.form.amendment_sent_by,
                  name: response.form.amendment_sent_by_name || 'Unknown',
                  role: 'admin'
                };
              } else {
                updatedForm.amendmentSentBy = null;
              }
              
              // Update rejection reason if present
              if (response.form.rejection_reason) {
                updatedForm.rejectionReason = response.form.rejection_reason;
              }
            }
            
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
      
      const successMessage = amendmentNote 
        ? 'Form sent back for amendment successfully' 
        : `Form status updated to ${status}`;
      toast.success(successMessage);
    } catch (error) {
      console.error('Error updating form status:', error);
      toast.error('Failed to update form status. Please try again.');
    }
  }, [user]);

  const updateForm = useCallback(async (formId: string, updatedForm: CloseoutForm) => {
    if (!user) return;
    
    console.log('DEBUG: updateForm called with:', { formId, updatedForm });
    console.log('DEBUG: Updated form data:', {
      years: updatedForm.years,
      jobNumber: updatedForm.jobNumber,
      partner: updatedForm.partner,
      manager: updatedForm.manager,
      clientName: updatedForm.clientName
    });
    
    try {
      // Call backend API to update form
      const response = await updateFormAPI(formId, updatedForm);
      
      console.log('DEBUG: Backend response:', response);
      console.log('DEBUG: Response form data:', response.form);
      
      const now = new Date().toISOString();
      
      // Update frontend state with the actual updated data from backend
      setForms(prevForms => {
        return prevForms.map(form => {
          if (form.id === formId) {
            // Use the same comprehensive mapping logic as fetchFormsAPI
            let formDataToUse = form; // Use existing form data as fallback, not updatedForm
            
            if (response.form) {
              console.log('DEBUG: Mapping backend data to frontend format');
              // Map backend database field names to frontend field names using the same logic as fetchFormsAPI
              // First, merge the updatedForm (sent data) with response.form (returned data) to ensure all updates are preserved
              const mergedFormData = {
                ...response.form,
                // Prioritize the sent data for fields that were actually updated
                years: updatedForm.years !== undefined ? updatedForm.years : (response.form.years || response.form.form_data?.years || ''),
                jobNumber: updatedForm.jobNumber !== undefined ? updatedForm.jobNumber : (response.form.job_number || response.form.form_data?.jobNumber || ''),
                partner: updatedForm.partner !== undefined ? updatedForm.partner : (response.form.partner || response.form.form_data?.partner || ''),
                manager: updatedForm.manager !== undefined ? updatedForm.manager : (response.form.manager || response.form.form_data?.manager || ''),
                clientName: updatedForm.clientName !== undefined ? updatedForm.clientName : (response.form.client_name || response.form.clientName || response.form.form_data?.clientName || ''),
                signingEmail: updatedForm.signingEmail !== undefined ? updatedForm.signingEmail : (response.form.client_email || response.form.signingEmail || response.form.form_data?.signingEmail || ''),
                signingPerson: updatedForm.signingPerson !== undefined ? updatedForm.signingPerson : (response.form.form_data?.signingPerson || ''),
                additionalEmails: updatedForm.additionalEmails !== undefined ? updatedForm.additionalEmails : (response.form.form_data?.additionalEmails || []),
                invoiceAmount: updatedForm.invoiceAmount !== undefined ? updatedForm.invoiceAmount : (response.form.invoice_amount || response.form.form_data?.invoiceAmount || ''),
                invoiceDescription: updatedForm.invoiceDescription !== undefined ? updatedForm.invoiceDescription : (response.form.invoice_description || response.form.form_data?.invoiceDescription || ''),
                billDetail: updatedForm.billDetail !== undefined ? updatedForm.billDetail : (response.form.bill_detail || response.form.form_data?.billDetail || ''),
                paymentRequired: updatedForm.paymentRequired !== undefined ? updatedForm.paymentRequired : (response.form.payment_required || response.form.form_data?.paymentRequired || false),
                wipRecovery: updatedForm.wipRecovery !== undefined ? updatedForm.wipRecovery : (response.form.wip_recovery || response.form.form_data?.wipRecovery || ''),
                recoveryReason: updatedForm.recoveryReason !== undefined ? updatedForm.recoveryReason : (response.form.recovery_reason || response.form.form_data?.recoveryReason || ''),
                isT1: updatedForm.isT1 !== undefined ? updatedForm.isT1 : (response.form.is_t1 || response.form.form_data?.isT1 || false),
                isS216: updatedForm.isS216 !== undefined ? updatedForm.isS216 : (response.form.is_s216 || response.form.form_data?.isS216 || false),
                isS116: updatedForm.isS116 !== undefined ? updatedForm.isS116 : (response.form.is_s116 || response.form.form_data?.isS116 || false),
                isPaperFiled: updatedForm.isPaperFiled !== undefined ? updatedForm.isPaperFiled : (response.form.is_paper_filed || response.form.form_data?.isPaperFiled || false),
                installmentsRequired: updatedForm.installmentsRequired !== undefined ? updatedForm.installmentsRequired : (response.form.installments_required || response.form.form_data?.installmentsRequired || false),
                t106: updatedForm.t106 !== undefined ? updatedForm.t106 : (response.form.t106 || response.form.form_data?.t106 || false),
                t1134: updatedForm.t1134 !== undefined ? updatedForm.t1134 : (response.form.t1134 || response.form.form_data?.t1134 || false),
                ontarioAnnualReturn: updatedForm.ontarioAnnualReturn !== undefined ? updatedForm.ontarioAnnualReturn : (response.form.ontario_annual_return || response.form.form_data?.ontarioAnnualReturn || false),
                tSlips: updatedForm.tSlips !== undefined ? updatedForm.tSlips : (response.form.t_slips || response.form.form_data?.tSlips || false),
                quebecReturn: updatedForm.quebecReturn !== undefined ? updatedForm.quebecReturn : (response.form.quebec_return || response.form.form_data?.quebecReturn || false),
                albertaReturn: updatedForm.albertaReturn !== undefined ? updatedForm.albertaReturn : (response.form.alberta_return || response.form.form_data?.albertaReturn || false),
                t2091PrincipalResidence: updatedForm.t2091PrincipalResidence !== undefined ? updatedForm.t2091PrincipalResidence : (response.form.t2091_principal_residence || response.form.form_data?.t2091PrincipalResidence || false),
                t1135ForeignProperty: updatedForm.t1135ForeignProperty !== undefined ? updatedForm.t1135ForeignProperty : (response.form.t1135_foreign_property || response.form.form_data?.t1135ForeignProperty || false),
                t1032PensionSplit: updatedForm.t1032PensionSplit !== undefined ? updatedForm.t1032PensionSplit : (response.form.t1032_pension_split || response.form.form_data?.t1032PensionSplit || false),
                hstDraftOrFinal: updatedForm.hstDraftOrFinal !== undefined ? updatedForm.hstDraftOrFinal : (response.form.hst_draft_or_final || response.form.form_data?.hstDraftOrFinal || ''),
                otherNotes: updatedForm.otherNotes !== undefined ? updatedForm.otherNotes : (response.form.other_notes || response.form.form_data?.otherNotes || ''),
                otherDocuments: updatedForm.otherDocuments !== undefined ? updatedForm.otherDocuments : (response.form.other_documents || response.form.form_data?.otherDocuments || ''),
                corporateInstallmentsRequired: updatedForm.corporateInstallmentsRequired !== undefined ? updatedForm.corporateInstallmentsRequired : (response.form.corporate_installments_required || response.form.form_data?.corporateInstallmentsRequired || false),
                fedScheduleAttached: updatedForm.fedScheduleAttached !== undefined ? updatedForm.fedScheduleAttached : (response.form.fed_schedule_attached || response.form.form_data?.fedScheduleAttached || false),
                hstInstallmentRequired: updatedForm.hstInstallmentRequired !== undefined ? updatedForm.hstInstallmentRequired : (response.form.hst_installment_required || response.form.form_data?.hstInstallmentRequired || false),
                hstTabCompleted: updatedForm.hstTabCompleted !== undefined ? updatedForm.hstTabCompleted : (response.form.hst_tab_completed || response.form.form_data?.hstTabCompleted || false),
                tSlipType: updatedForm.tSlipType !== undefined ? updatedForm.tSlipType : (response.form.form_data?.tSlipType || ''),
                personalTaxInstallmentsRequired: updatedForm.personalTaxInstallmentsRequired !== undefined ? updatedForm.personalTaxInstallmentsRequired : (response.form.form_data?.personalTaxInstallmentsRequired || false),
                hstInstallmentsRequired: updatedForm.hstInstallmentsRequired !== undefined ? updatedForm.hstInstallmentsRequired : (response.form.form_data?.hstInstallmentsRequired || false),
                outstandingTaxBalance: updatedForm.outstandingTaxBalance !== undefined ? updatedForm.outstandingTaxBalance : (response.form.form_data?.outstandingTaxBalance || '$0.00'),
                yearlyAmounts: updatedForm.yearlyAmounts !== undefined ? updatedForm.yearlyAmounts : (response.form.form_data?.yearlyAmounts || []),
                priorPeriodsBalance: updatedForm.priorPeriodsBalance !== undefined ? updatedForm.priorPeriodsBalance : (response.form.prior_periods_balance?.toString() || response.form.form_data?.priorPeriodsBalance || ''),
                taxesPayable: updatedForm.taxesPayable !== undefined ? updatedForm.taxesPayable : (response.form.taxes_payable?.toString() || response.form.form_data?.taxesPayable || ''),
                installmentsDuringYear: updatedForm.installmentsDuringYear !== undefined ? updatedForm.installmentsDuringYear : (response.form.installments_during_year?.toString() || response.form.form_data?.installmentsDuringYear || ''),
                installmentsAfterYear: updatedForm.installmentsAfterYear !== undefined ? updatedForm.installmentsAfterYear : (response.form.installments_after_year?.toString() || response.form.form_data?.installmentsAfterYear || ''),
                amountOwing: updatedForm.amountOwing !== undefined ? updatedForm.amountOwing : (response.form.amount_owing?.toString() || response.form.form_data?.amountOwing || ''),
                dueDate: updatedForm.dueDate !== undefined ? updatedForm.dueDate : (response.form.due_date || response.form.form_data?.dueDate || ''),
                taxPaymentDueDate: updatedForm.taxPaymentDueDate !== undefined ? updatedForm.taxPaymentDueDate : (response.form.form_data?.taxPaymentDueDate || ''),
                returnFilingDueDate: updatedForm.returnFilingDueDate !== undefined ? updatedForm.returnFilingDueDate : (response.form.form_data?.returnFilingDueDate || 'April 30'),
                hstPriorBalance: updatedForm.hstPriorBalance !== undefined ? updatedForm.hstPriorBalance : (response.form.hst_prior_balance?.toString() || response.form.form_data?.hstPriorBalance || ''),
                hstPayable: updatedForm.hstPayable !== undefined ? updatedForm.hstPayable : (response.form.hst_payable?.toString() || response.form.form_data?.hstPayable || ''),
                hstInstallmentsDuring: updatedForm.hstInstallmentsDuring !== undefined ? updatedForm.hstInstallmentsDuring : (response.form.hst_installments_during?.toString() || response.form.form_data?.hstInstallmentsDuring || ''),
                hstInstallmentsAfter: updatedForm.hstInstallmentsAfter !== undefined ? updatedForm.hstInstallmentsAfter : (response.form.hst_installments_after?.toString() || response.form.form_data?.hstInstallmentsAfter || ''),
                hstPaymentDue: updatedForm.hstPaymentDue !== undefined ? updatedForm.hstPaymentDue : (response.form.hst_payment_due?.toString() || response.form.form_data?.hstPaymentDue || ''),
                hstDueDate: updatedForm.hstDueDate !== undefined ? updatedForm.hstDueDate : (response.form.hst_due_date || response.form.form_data?.hstDueDate || ''),
                status: response.form.status,
                assignedTo: response.form.assigned_to ? {
                  id: response.form.assigned_to,
                  name: response.form.assigned_to_name || 'Unknown',
                  role: 'admin'
                } : null,
                amendmentSentBy: response.form.amendment_sent_by ? {
                  id: response.form.amendment_sent_by,
                  name: response.form.amendment_sent_by_name || 'Unknown',
                  role: 'admin'
                } : null,
                rejectionReason: response.form.rejection_reason || '',
                updatedAt: response.form.updated_at
              };

              formDataToUse = {
                ...form, // Keep existing form structure
                ...mergedFormData // Use the merged data
              };
              
              console.log('DEBUG: Mapped form data:', {
                years: formDataToUse.years,
                jobNumber: formDataToUse.jobNumber,
                partner: formDataToUse.partner,
                manager: formDataToUse.manager
              });
            } else {
              console.log('DEBUG: No response.form, using existing form data');
            }
            
            return {
              ...formDataToUse,
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
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Failed to update form. Please try again.');
    }
  }, [user]);

  const assignForm = useCallback(async (formId: string, assigneeId: string, assigneeName: string) => {
    if (!user) return;
    
    try {
      // Call backend API to reassign the form
      await reassignForm(formId, assigneeId);
      
      const now = new Date().toISOString();
      
      // Update frontend state
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
    } catch (error) {
      console.error('Error assigning form:', error);
      toast.error('Failed to assign form. Please try again.');
    }
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
      reassignForm,
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

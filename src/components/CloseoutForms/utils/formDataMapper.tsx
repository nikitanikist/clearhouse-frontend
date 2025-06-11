import { CloseoutFormTableData } from '../CloseoutFormTable';
import { User } from '@/contexts/AuthContext';

export const mapTableDataToCloseoutForm = (
  formData: CloseoutFormTableData, 
  user: User,
  formType: 'personal' | 'corporate' = 'personal'
) => {
  const createdByInfo = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  
  const primaryMember = formData.familyMembers[0];
  
  return {
    formType: formType,
    clientName: primaryMember.clientName,
    filePath: formData.filePath,
    signingPerson: primaryMember.signingPerson,
    signingEmail: primaryMember.signingEmail,
    additionalEmails: primaryMember.additionalEmails,
    partner: formData.partner,
    manager: formData.manager,
    years: formData.years,
    jobNumber: formData.jobNumber,
    invoiceAmount: formData.invoiceAmount,
    invoiceDescription: formData.billDetail, // Map billDetail to invoiceDescription
    billDetail: formData.billDetail,
    paymentRequired: formData.paymentRequired,
    wipRecovery: formData.wipRecovery,
    recoveryReason: formData.recoveryReason,
    returnType: primaryMember.returnType || 'T1',
    
    // Individual boolean fields for return types
    isT1: primaryMember.returnType === 'T1',
    isS216: primaryMember.returnType === 'S216',
    isS116: primaryMember.returnType === 'S116',
    isEfiled: primaryMember.isEfiled,
    isPaperFiled: !primaryMember.isEfiled,
    installmentsRequired: primaryMember.installmentsRequired,
    
    // New filing detail fields with default values
    t106: false,
    t1134: false,
    ontarioAnnualReturn: formData.ontarioAnnualReturn || false,
    tSlips: formData.tSlipType ? true : false,
    quebecReturn: false,
    albertaReturn: false,
    
    // Tax forms
    t2091PrincipalResidence: formData.t2091PrincipalResidence,
    t1135ForeignProperty: formData.t1135ForeignProperty,
    t1032PensionSplit: formData.t1032PensionSplit,
    hstDraftOrFinal: formData.hstDraftOrFinal,
    tSlipType: formData.tSlipType,
    
    // Other documents and notes
    otherNotes: formData.otherNotes,
    otherDocuments: formData.otherDocuments || '',
    
    // Tax installment fields with default values
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: formData.hstInstallmentsRequired || false,
    hstTabCompleted: false,
    
    // Installments
    personalTaxInstallmentsRequired: formData.personalTaxInstallmentsRequired,
    hstInstallmentsRequired: formData.hstInstallmentsRequired,
    
    // Outstanding balance
    outstandingTaxBalance: formData.outstandingTaxBalance,
    
    // T1 Summary fields
    priorPeriodsBalance: formData.priorPeriodsBalance,
    taxesPayable: formData.taxesPayable,
    installmentsDuringYear: formData.installmentsDuringYear,
    installmentsAfterYear: formData.installmentsAfterYear,
    amountOwing: formData.amountOwing,
    dueDate: formData.taxPaymentDueDate, // Map taxPaymentDueDate to dueDate for backward compatibility
    taxPaymentDueDate: formData.taxPaymentDueDate,
    returnFilingDueDate: formData.returnFilingDueDate,
    
    // HST Summary fields
    hstPriorBalance: formData.hstPriorBalance,
    hstPayable: formData.hstPayable,
    hstInstallmentsDuring: formData.hstInstallmentsDuring,
    hstInstallmentsAfter: formData.hstInstallmentsAfter,
    hstPaymentDue: formData.hstPaymentDue,
    hstDueDate: formData.hstDueDate,
    
    // Multi-year support
    yearlyAmounts: formData.yearlyAmounts,
    
    installmentAttachment: primaryMember.installmentAttachment,
    status: 'pending' as const,
    assignedTo: null,
    createdBy: createdByInfo,
    familyMembers: formData.familyMembers,
  };
};

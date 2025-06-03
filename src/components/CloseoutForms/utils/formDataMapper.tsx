

import { CloseoutFormTableData } from '../CloseoutFormTable';
import { User } from '@/contexts/AuthContext';

export const mapTableDataToCloseoutForm = (
  formData: CloseoutFormTableData, 
  user: User
) => {
  const createdByInfo = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  
  // Convert the table format to the original CloseoutForm format using the first family member
  const primaryMember = formData.familyMembers[0];
  
  return {
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
    invoiceDescription: formData.invoiceDescription || '',
    billDetail: formData.billDetail,
    paymentRequired: formData.paymentRequired,
    wipRecovery: formData.wipRecovery,
    recoveryReason: formData.recoveryReason,
    isT1: primaryMember.isT1,
    isS216: primaryMember.isS216,
    isS116: primaryMember.isS116,
    isPaperFiled: primaryMember.isPaperFiled,
    installmentsRequired: primaryMember.installmentsRequired,
    // Map all the filing detail fields
    t106: formData.t106 || false,
    t1134: formData.t1134 || false,
    ontarioAnnualReturn: formData.ontarioAnnualReturn || false,
    tSlips: formData.tSlips || false,
    quebecReturn: formData.quebecReturn || false,
    albertaReturn: formData.albertaReturn || false,
    t2091PrincipalResidence: formData.t2091PrincipalResidence,
    t1135ForeignProperty: formData.t1135ForeignProperty,
    t1032PensionSplit: formData.t1032PensionSplit,
    hstDraftOrFinal: formData.hstDraftOrFinal,
    otherNotes: formData.otherNotes,
    otherDocuments: formData.otherDocuments || '',
    // Tax installment fields
    corporateInstallmentsRequired: formData.corporateInstallmentsRequired || false,
    fedScheduleAttached: formData.fedScheduleAttached || false,
    hstInstallmentRequired: formData.hstInstallmentRequired || false,
    hstTabCompleted: formData.hstTabCompleted || false,
    // T1 Summary fields
    priorPeriodsBalance: formData.priorPeriodsBalance,
    taxesPayable: formData.taxesPayable,
    installmentsDuringYear: formData.installmentsDuringYear,
    installmentsAfterYear: formData.installmentsAfterYear,
    amountOwing: formData.amountOwing,
    dueDate: formData.dueDate,
    // HST Summary fields
    hstPriorBalance: formData.hstPriorBalance,
    hstPayable: formData.hstPayable,
    hstInstallmentsDuring: formData.hstInstallmentsDuring,
    hstInstallmentsAfter: formData.hstInstallmentsAfter,
    hstPaymentDue: formData.hstPaymentDue,
    hstDueDate: formData.hstDueDate,
    // Installment attachment from primary member
    installmentAttachment: primaryMember.installmentAttachment,
    status: 'pending' as const,
    assignedTo: null,
    createdBy: createdByInfo,
    // Store family members data for later use
    familyMembers: formData.familyMembers,
  };
};


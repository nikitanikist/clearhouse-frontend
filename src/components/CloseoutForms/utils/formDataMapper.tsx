
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
    billDetail: formData.billDetail,
    paymentRequired: formData.paymentRequired,
    wipRecovery: formData.wipRecovery,
    recoveryReason: formData.recoveryReason,
    isT1: primaryMember.isT1,
    isS216: primaryMember.isS216,
    isS116: primaryMember.isS116,
    isPaperFiled: primaryMember.isPaperFiled,
    installmentsRequired: primaryMember.installmentsRequired,
    // Add all the new required fields with default values
    t2091PrincipalResidence: false,
    t1135ForeignProperty: false,
    t1032PensionSplit: false,
    hstDraftOrFinal: 'N/A',
    otherNotes: '',
    // T1 Summary fields with default values
    priorPeriodsBalance: '0',
    taxesPayable: '0',
    installmentsDuringYear: '0',
    installmentsAfterYear: '0',
    amountOwing: '0',
    dueDate: '',
    // HST Summary fields with default values
    hstPriorBalance: '0',
    hstPayable: '0',
    hstInstallmentsDuring: '0',
    hstInstallmentsAfter: '0',
    hstPaymentDue: '0',
    hstDueDate: '',
    // Installment attachment
    installmentAttachment: null,
    status: 'pending' as const,
    assignedTo: null,
    createdBy: createdByInfo,
  };
};

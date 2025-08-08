// src/services/pdfService.js
import api from './api';

export const extractPDFData = async (file) => {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    console.log('Sending PDF to backend for extraction...');
    
    // Call backend API
    const response = await api.post('/extract-pdf', {
      pdf: base64,
      filename: file.name
    });

    console.log('Backend response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'PDF extraction failed');
    }
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};
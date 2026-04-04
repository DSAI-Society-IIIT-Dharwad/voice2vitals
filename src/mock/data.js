
export const mockCases = [
  { id: 'C101', patientName: 'John Doe', status: 'completed', date: '2023-10-12', domain: 'healthcare' },
  { id: 'C102', patientName: 'Jane Smith', status: 'in_consultation', date: '2023-10-14', domain: 'healthcare' },
];
export const mockOutboundBatch = [
  { id: 'B1', name: 'Q3 Payment Follow-ups', status: 'completed', totals: 50, successful: 42, domain: 'finance' },
  { id: 'B2', name: 'Post-Op Follow-up', status: 'pending', totals: 25, successful: 0, domain: 'healthcare' }
];
export const mockTranscript = [
  { speaker: 'Doctor', text: 'Hello John, how are you feeling today?' },
  { speaker: 'Patient', text: 'Hi doctor. I have been having a severe headache for the past 3 days and I feel slightly feverish.' },
  { speaker: 'Doctor', text: 'I see. Have you taken any medication for it?' },
  { speaker: 'Patient', text: 'Yes, I took some Paracetamol yesterday but it didn\'t help much.' }
];
export const mockFieldsMedic = {
  complaint: 'Severe headache, feverish',
  duration: '3 days',
  symptoms: ['Headache', 'Fever'],
  severity: 'Medium',
  medications: ['Paracetamol'],
  provisionalDiagnosis: 'Viral Infection / Migraine',
  treatmentPlan: 'Rest, hydration, observe for 48 hours.',
  summary: 'Patient presented with a 3-day history of severe headache and mild fever. Did not respond well to Paracetamol.'
};
export const mockFieldsFinance = {
  verificationStatus: 'Verified',
  accountConfirmed: 'Yes',
  paymentStatus: 'Pending',
  amountPaid: '$0',
  reason: 'Salary delayed',
  summary: 'Customer verified. Payment delayed due to delayed salary. Promised to pay by 25th.'
};
  
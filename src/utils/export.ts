import type { Risk } from '../types';

/**
 * Utility to export an array of Risks to a CSV file.
 */
export function exportRisksToCSV(risks: Risk[]) {
  if (risks.length === 0) return;

  const headers = ['Risk ID', 'Title', 'Status', 'Severity', 'Location', 'Due Date', 'Last Updated'];
  const rows = risks.map(r => [
    r.riskId,
    r.title,
    r.status,
    r.severity,
    r.location.name,
    r.dueDate || 'N/A',
    r.updatedAt || r.lastUpdated
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `risks_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Utility to export Risks to PDF (Mock/Simple implementation)
 */
export function exportRisksToPDF(risks: Risk[]) {
  if (risks.length === 0) return;
  // In a real production app, we would use jsPDF or similar.
  // For this prototype, we'll use the browser's print function for a specific report layout.
  window.print();
}

/**
 * General purpose CSV export
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => {
    return Object.values(obj).map(val => {
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

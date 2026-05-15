import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    r.location?.name || 'N/A',
    r.dueDate || 'N/A',
    new Date(r.updatedAt || r.createdAt).toLocaleDateString()
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
 * Utility to export Risks to a professional PDF report.
 */
export function exportRisksToPDF(risks: Risk[]) {
  if (risks.length === 0) return;

  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4
  const timestamp = new Date().toLocaleString();

  // ── Header ──────────────────────────────────────────
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('SafeGuard — Risk Register Report', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Generated on: ${timestamp}`, 14, 30);
  doc.text(`Total Records: ${risks.length}`, 14, 35);

  // ── Table ───────────────────────────────────────────
  autoTable(doc, {
    startY: 45,
    head: [['Risk ID', 'Title', 'Status', 'Severity', 'Location', 'Due Date']],
    body: risks.map(r => [
      r.riskId,
      r.title,
      r.status.toUpperCase(),
      r.severity.toUpperCase(),
      r.location?.name || 'N/A',
      r.dueDate || 'N/A'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], fontSize: 10 }, // Indigo-600
    styles: { fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate-50
    margin: { top: 45 },
  });

  // ── Footer ──────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `Page ${i} of ${pageCount} — SafeGuard Compliance Platform — Confidential`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`risks_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Utility to export an array of Audits to a CSV file.
 */
export function exportAuditsToCSV(audits: any[]) {
  if (audits.length === 0) return;

  const headers = ['Audit ID', 'Unit Name', 'Auditor', 'Date', 'Status', 'Score'];
  const rows = audits.map(a => [
    a.auditId,
    a.unitName,
    a.auditorName,
    new Date(a.auditDate).toLocaleDateString(),
    a.status.toUpperCase(),
    a.score !== null ? `${a.score}%` : 'N/A'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `audits_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Utility to export Audits to a professional PDF report.
 */
export function exportAuditsToPDF(audits: any[]) {
  if (audits.length === 0) return;

  const doc = new jsPDF('l', 'mm', 'a4');
  const timestamp = new Date().toLocaleString();

  // ── Header ──────────────────────────────────────────
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text('SafeGuard — Safety Audit Summary Report', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${timestamp}`, 14, 30);
  doc.text(`Total Audits: ${audits.length}`, 14, 35);

  // ── Table ───────────────────────────────────────────
  autoTable(doc, {
    startY: 45,
    head: [['Audit ID', 'Unit Name', 'Auditor', 'Scheduled Date', 'Status', 'Score']],
    body: audits.map(a => [
      a.auditId,
      a.unitName,
      a.auditorName,
      new Date(a.auditDate).toLocaleDateString(),
      a.status.toUpperCase(),
      a.score !== null ? `${a.score}%` : 'N/A'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], fontSize: 10 }, // Emerald-600
    styles: { fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [240, 253, 244] }, // Emerald-50
    margin: { top: 45 },
  });

  // ── Footer ──────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount} — SafeGuard Compliance Platform — Confidential`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`audits_report_${new Date().toISOString().split('T')[0]}.pdf`);
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

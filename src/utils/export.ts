// ============================================================================
// Export Utilities — CSV and PDF generation for Risk data
// ============================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Risk } from '../types';

// ---------------------------------------------------------------------------
// Shared: Flatten nested Risk → flat string array
// ---------------------------------------------------------------------------

interface FlatRiskRow {
  riskId: string;
  title: string;
  description: string;
  location: string;
  severity: string;
  status: string;
  owner: string;
  mitigationPlan: string;
  dueDate: string;
  lastUpdated: string;
  createdAt: string;
}

/**
 * Safely extracts all nested objects (Location, User) into flat strings.
 * This prevents [object Object] from appearing in CSV/PDF output.
 */
function flattenRisk(r: Risk): FlatRiskRow {
  return {
    riskId: r.riskId ?? r.id ?? 'N/A',
    title: (r.title ?? r.description?.slice(0, 40) ?? 'Untitled').replace(/"/g, '""'),
    description: (r.description ?? '').replace(/"/g, '""'),
    location: r.location?.name ?? 'N/A',
    severity: r.severity ?? 'N/A',
    status: (r.status ?? 'N/A').replace(/_/g, ' '),
    owner: r.owner?.fullName ?? r.ownerId ?? 'Unassigned',
    mitigationPlan: (r.mitigationPlan ?? '').replace(/"/g, '""'),
    dueDate: r.dueDate ? safeFormat(r.dueDate, 'yyyy-MM-dd') : '—',
    lastUpdated: safeFormat(r.lastUpdated ?? r.updatedAt, 'yyyy-MM-dd'),
    createdAt: safeFormat(r.createdAt, 'yyyy-MM-dd'),
  };
}

/** Safely format a date string, returning fallback on error */
function safeFormat(dateStr: string | null | undefined, fmt: string): string {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), fmt);
  } catch {
    return String(dateStr);
  }
}

// ---------------------------------------------------------------------------
// CSV Export — with UTF-8 BOM for Excel compatibility
// ---------------------------------------------------------------------------

export function exportRisksToCSV(risks: Risk[], filename?: string): void {
  const headers = [
    'Risk ID',
    'Title',
    'Description',
    'Location',
    'Severity',
    'Status',
    'Owner',
    'Mitigation Plan',
    'Due Date',
    'Last Updated',
    'Created At',
  ];

  // Flatten all nested objects to strings BEFORE building CSV rows
  const rows = risks.map((r) => {
    const flat = flattenRisk(r);
    return [
      flat.riskId,
      `"${flat.title}"`,
      `"${flat.description}"`,
      flat.location,
      flat.severity,
      flat.status,
      flat.owner,
      `"${flat.mitigationPlan}"`,
      flat.dueDate,
      flat.lastUpdated,
      flat.createdAt,
    ];
  });

  // UTF-8 BOM (\uFEFF) ensures Excel reads the file correctly
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `safeguard-risks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// PDF Export — flat string arrays only for autoTable body
// ---------------------------------------------------------------------------

export function exportRisksToPDF(risks: Risk[], filename?: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const generatedDate = format(new Date(), "MMMM d, yyyy 'at' h:mm a");

  // ── Header ────────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeGuard — Risk Register Report', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Generated: ${generatedDate}`, 14, 25);
  doc.text(`Total Risks: ${risks.length}`, 14, 30);

  // Divider line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 33, 283, 33);

  // ── Table — flatten BEFORE passing to autoTable ────────────────────────
  const tableData: string[][] = risks.map((r) => {
    const flat = flattenRisk(r);
    return [
      flat.riskId,
      flat.title,
      flat.location,
      flat.severity,
      flat.status,
      flat.owner,
      flat.dueDate,
      flat.lastUpdated,
    ];
  });

  autoTable(doc, {
    head: [['Risk ID', 'Title', 'Location', 'Severity', 'Status', 'Owner', 'Due Date', 'Updated']],
    body: tableData,
    startY: 37,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],     // Slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],      // Slate-800
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],   // Slate-50
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 55 },
      2: { cellWidth: 40 },
      3: { cellWidth: 22 },
      4: { cellWidth: 25 },
      5: { cellWidth: 28 },
      6: { cellWidth: 28 },
      7: { cellWidth: 20 },
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    margin: { left: 14, right: 14 },
  });

  // ── Footer ────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `SafeGuard — Confidential | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(filename ?? `safeguard-risks-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

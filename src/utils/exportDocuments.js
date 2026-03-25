import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Export documents en PDF
 */
export function exportToPDF(documents) {
  const doc = new jsPDF();

  // Titre
  doc.setFontSize(18);
  doc.setTextColor(16, 42, 67);
  doc.text('Portail C.E.A — Documents', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')} — ${documents.length} document(s)`, 14, 28);

  // Ligne séparatrice
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(0.5);
  doc.line(14, 31, 196, 31);

  // Tableau
  const rows = documents.map(d => [
    d.title || '',
    d.category || '',
    d.type || '',
    d.status || '',
    d.contact || '',
    (d.tags || []).join(', '),
    d.description || '',
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Titre', 'Catégorie', 'Type', 'Statut', 'Contact', 'Tags', 'Description']],
    body: rows,
    headStyles: {
      fillColor: [184, 134, 11],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [16, 42, 67],
    },
    alternateRowStyles: {
      fillColor: [240, 237, 230],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      6: { cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
    styles: {
      cellPadding: 2,
      overflow: 'linebreak',
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`State of San Andreas — C.E.A — Page ${i}/${pageCount}`, 14, doc.internal.pageSize.height - 8);
  }

  doc.save('cea-documents.pdf');
}

/**
 * Export documents en Word (.docx)
 */
export async function exportToWord(documents) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: ['Titre', 'Catégorie', 'Type', 'Statut', 'Contact', 'Tags', 'Description'].map(text =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18 })] })],
        shading: { fill: 'B8860B' },
        width: { size: text === 'Description' ? 2500 : 1200, type: WidthType.DXA },
      })
    ),
  });

  const dataRows = documents.map(d =>
    new TableRow({
      children: [
        d.title || '',
        d.category || '',
        d.type || '',
        d.status || '',
        d.contact || '',
        (d.tags || []).join(', '),
        d.description || '',
      ].map(text =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, size: 16 })] })],
          width: { size: 1200, type: WidthType.DXA },
        })
      ),
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'Portail C.E.A — Documents', bold: true, size: 36, color: '102A43' })],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
          children: [new TextRun({
            text: `Exporté le ${new Date().toLocaleDateString('fr-FR')} — ${documents.length} document(s)`,
            size: 20,
            color: '666666',
            italics: true,
          })],
          spacing: { after: 300 },
        }),
        new Table({
          rows: [headerRow, ...dataRows],
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'State of San Andreas — Communication, Événementiel & Association', size: 14, color: 'AAAAAA' })],
          spacing: { before: 400 },
          alignment: AlignmentType.CENTER,
        }),
      ],
    }],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, 'cea-documents.docx');
}

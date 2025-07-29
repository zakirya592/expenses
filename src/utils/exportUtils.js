import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const getStockColor = (countInStock) => {
  if (countInStock <= 5) return "danger";
  if (countInStock <= 10) return "warning";
  return "success";
};

export const exportToExcel = (data, filename, searchValue) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Report - ${searchValue || 'ALL'}`);
  XLSX.writeFile(workbook, `${filename}_${searchValue || 'ALL'}.xlsx`);
};

export const exportToPdf = (data, filename, searchValue) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(`Inventory Report - ${searchValue || 'ALL'}`, 105, 20, { align: 'center' });

  // Table Headers
  const headers = [
    ['#', 'Item', 'Stock Quantity', 'Available Quantity', 'Sold Out Quantity', "Price", 'Sale Rate', '']
  ];


  // Format rows
  const rows = data.map((row, index) => [
    index + 1,
    row.name,
    row.countInStock,
    row.availableQuantity ?? '',
    row.soldOutQuantity ?? '',
    row.price,
    row.saleRate ?? '',
    
  ]);

  // Create table
  autoTable(doc, {
    startY: 30,
    head: headers,
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [22, 160, 133] },
    styles: { fontSize: 10, cellPadding: 3 },
  });

  return doc;
};

export const viewPdfInNewTab = (data, filename, searchValue) => {
  const doc = exportToPdf(data, filename, searchValue);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  URL.revokeObjectURL(url);
};

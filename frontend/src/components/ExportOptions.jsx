import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { json2csv } from 'json-2-csv';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ExportOptions = ({ data, filename, title, csvOptions = {} }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const exportCSV = async () => {
    try {
      // Convert JSON to CSV using json-2-csv
      const csv = await json2csv(data, csvOptions);
      downloadFile(csv, `${filename || 'export'}.csv`, 'text/csv');
    } catch (err) {
      console.error('Error al exportar CSV:', err);
    }
  };

  const exportExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
      XLSX.writeFile(workbook, `${filename || 'export'}.xlsx`);
    } catch (err) {
      console.error('Error al exportar Excel:', err);
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      const columns = Object.keys(data[0]);
      
      // Add title
      doc.setFontSize(16);
      doc.text(title || 'Datos del Reporte', 14, 15);
      doc.setFontSize(10);
      
      // Generate table
      autoTable(doc, {
        head: [columns],
        body: data.map(item => columns.map(col => item[col])),
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] },
        startY: 25,
      });
      
      doc.save(`${filename || 'export'}.pdf`);
    } catch (err) {
      console.error('Error al exportar PDF:', err);
    }
  };

  const downloadFile = (content, fileName, fileType) => {
    const blob = new Blob([content], { type: fileType });
    const link = document.createElement('a');
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={exportCSV}
        className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        title="Exportar como CSV"
      >
        <FileText size={16} className="mr-2" />
        CSV
      </button>
      <button
        onClick={exportExcel}
        className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        title="Exportar como Excel"
      >
        <FileSpreadsheet size={16} className="mr-2" />
        Excel
      </button>
      <button
        onClick={exportPDF}
        className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        title="Exportar como PDF"
      >
        <Download size={16} className="mr-2" />
        PDF
      </button>
    </div>
  );
};

export default ExportOptions;

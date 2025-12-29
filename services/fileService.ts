import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataRow, ParsedFile } from '../types';

export const parseFile = async (file: File): Promise<ParsedFile> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields) {
            resolve({
              fileName: file.name,
              headers: results.meta.fields,
              data: results.data as DataRow[],
            });
          } else {
            reject(new Error('Could not parse CSV headers.'));
          }
        },
        error: (error: Error) => reject(error),
      });
    });
  } else if (extension === 'xlsx' || extension === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length > 0) {
            const headers = jsonData[0] as string[];
            // Convert array of arrays to array of objects manually to ensure clean data
            const rawRows = jsonData.slice(1) as any[][];
            const rows = rawRows.map(row => {
              const obj: DataRow = {};
              headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            });

            resolve({
              fileName: file.name,
              headers,
              data: rows,
            });
          } else {
            reject(new Error('Excel file is empty.'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  } else {
    throw new Error('Unsupported file format. Please upload CSV or XLSX.');
  }
};

export const downloadCSV = (data: DataRow[], selectedColumns: string[], originalFileName: string, suffix: string) => {
  // Filter data to only include selected columns
  const filteredData = data.map(row => {
    const newRow: DataRow = {};
    selectedColumns.forEach(col => {
      newRow[col] = row[col];
    });
    return newRow;
  });

  const csv = Papa.unparse(filteredData);
  // Add BOM (Byte Order Mark) \uFEFF so Excel recognizes it as UTF-8
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
  link.setAttribute('href', url);
  link.setAttribute('download', `${baseName}_${suffix}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
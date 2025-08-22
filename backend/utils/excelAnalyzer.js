import XLSX from 'xlsx';
import fs from 'fs';

/**
 * Simple Excel analyzer that you can run directly to debug your Excel files
 * Usage: node utils/excelAnalyzer.js path/to/your/excel/file.xlsx
 */

const analyzeExcelFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }

    console.log(`\n🔍 Analyzing Excel file: ${filePath}\n`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Basic Info:`);
    console.log(`  - Sheet Name: ${sheetName}`);
    console.log(`  - Total Rows: ${jsonData.length}`);
    console.log(`  - Total Columns: ${jsonData.length > 0 ? Object.keys(jsonData[0]).length : 0}\n`);

    if (jsonData.length > 0) {
      const firstRow = jsonData[0];
      console.log(`📋 Column Names (${Object.keys(firstRow).length} columns):`);
      Object.keys(firstRow).forEach((key, index) => {
        console.log(`  ${index + 1}. "${key}"`);
      });

      console.log(`\n📋 First Row Sample Data:`);
      Object.entries(firstRow).forEach(([key, value]) => {
        console.log(`  "${key}": "${value}"`);
      });

      // Look for potential code columns
      console.log(`\n🔍 Potential Code Columns:`);
      const potentialCodeColumns = Object.keys(firstRow).filter(key => {
        const value = firstRow[key];
        const keyLower = key.toLowerCase();
        // Check if key contains 'code', 'id', or if value looks like a code
        return keyLower.includes('code') || 
               keyLower.includes('id') || 
               keyLower.includes('num') || 
               (typeof value === 'string' && value.match(/^\d{8,}$/)) || // Long numeric codes
               (typeof value === 'number' && value.toString().length >= 8);
      });

      if (potentialCodeColumns.length > 0) {
        potentialCodeColumns.forEach(column => {
          console.log(`  ✅ "${column}": "${firstRow[column]}"`);
        });
      } else {
        console.log(`  ❌ No obvious code columns found`);
      }

      // Look for potential name columns
      console.log(`\n🔍 Potential Name Columns:`);
      const potentialNameColumns = Object.keys(firstRow).filter(key => {
        const keyLower = key.toLowerCase();
        return keyLower.includes('name') || 
               keyLower.includes('nom') || 
               keyLower.includes('designation') ||
               keyLower.includes('libelle');
      });

      if (potentialNameColumns.length > 0) {
        potentialNameColumns.forEach(column => {
          console.log(`  ✅ "${column}": "${firstRow[column]}"`);
        });
      } else {
        console.log(`  ❌ No obvious name columns found`);
      }

      // Show first 3 rows for more context
      if (jsonData.length > 1) {
        console.log(`\n📋 First 3 Rows (showing potential codes):`);
        jsonData.slice(0, 3).forEach((row, index) => {
          console.log(`\n  Row ${index + 1}:`);
          potentialCodeColumns.forEach(column => {
            console.log(`    "${column}": "${row[column]}"`);
          });
          potentialNameColumns.forEach(column => {
            console.log(`    "${column}": "${row[column]}"`);
          });
        });
      }
    } else {
      console.log(`❌ No data found in Excel file`);
    }

    console.log(`\n✅ Analysis complete!\n`);
  } catch (error) {
    console.error(`❌ Error analyzing Excel file:`, error.message);
  }
};

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.log(`
🔍 Excel Analyzer Tool

Usage: node utils/excelAnalyzer.js path/to/your/excel/file.xlsx

This tool will analyze your Excel file and show you:
- All column names
- Sample data
- Potential code and name columns
- First few rows of data

Example: node utils/excelAnalyzer.js uploads/Villages.xlsx
`);
} else {
  analyzeExcelFile(filePath);
}

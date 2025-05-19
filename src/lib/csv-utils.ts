
import type { CsvActivityRecord } from '@/types';
import { parse, isValid, format } from 'date-fns';

/**
 * Parses CSV text into an array of CsvActivityRecord objects.
 * Assumes the first row is headers: Date,Steps,Calories,Distance,ActiveMinutes
 * @param csvText The raw CSV string.
 * @returns An array of CsvActivityRecord objects.
 */
export function parseActivityCsv(csvText: string): CsvActivityRecord[] {
  const records: CsvActivityRecord[] = [];
  const lines = csvText.trim().split(/\r\n|\n/); // Handle both CRLF and LF

  if (lines.length < 2) {
    // Not enough data (must have header + at least one data row)
    return records;
  }

  const headerLine = lines.shift();
  if (!headerLine) return records; // Should not happen due to length check, but good for type safety

  const headers = headerLine.split(',').map(h => h.trim());
  const dateIndex = headers.indexOf('Date');
  const stepsIndex = headers.indexOf('Steps');
  const caloriesIndex = headers.indexOf('Calories');
  const distanceIndex = headers.indexOf('Distance');
  const activeMinutesIndex = headers.indexOf('ActiveMinutes');

  if (dateIndex === -1) {
    console.error("CSV must contain a 'Date' column.");
    return records; // Date is mandatory
  }

  for (const line of lines) {
    if (!line.trim()) continue; // Skip empty lines
    const values = line.split(',');

    const dateStr = values[dateIndex]?.trim();
    if (!dateStr) continue; // Skip if date is missing

    // Try to parse date in common formats, default to YYYY-MM-DD
    let parsedDate: Date | null = null;
    const commonFormats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd-MM-yyyy', 'yyyy/MM/dd'];
    for (const fmt of commonFormats) {
        const d = parse(dateStr, fmt, new Date());
        if (isValid(d)) {
            parsedDate = d;
            break;
        }
    }
     if (!parsedDate && isValid(new Date(dateStr))) { // Fallback to direct Date constructor parsing
        parsedDate = new Date(dateStr);
    }


    if (!parsedDate || !isValid(parsedDate)) {
      console.warn(`Skipping row with invalid date: ${dateStr}`);
      continue;
    }

    const record: CsvActivityRecord = {
      Date: format(parsedDate, 'yyyy-MM-dd'), // Standardize date format
    };

    if (stepsIndex !== -1 && values[stepsIndex]?.trim()) {
      record.Steps = parseInt(values[stepsIndex].trim(), 10);
    }
    if (caloriesIndex !== -1 && values[caloriesIndex]?.trim()) {
      record.Calories = parseInt(values[caloriesIndex].trim(), 10);
    }
    if (distanceIndex !== -1 && values[distanceIndex]?.trim()) {
      record.Distance = parseFloat(values[distanceIndex].trim());
    }
    if (activeMinutesIndex !== -1 && values[activeMinutesIndex]?.trim()) {
      record.ActiveMinutes = parseInt(values[activeMinutesIndex].trim(), 10);
    }
    
    // Ensure numeric fields are numbers or undefined
    if (isNaN(record.Steps!)) record.Steps = undefined;
    if (isNaN(record.Calories!)) record.Calories = undefined;
    if (isNaN(record.Distance!)) record.Distance = undefined;
    if (isNaN(record.ActiveMinutes!)) record.ActiveMinutes = undefined;
    
    records.push(record);
  }

  // Sort by date descending to easily get the latest
  records.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
  return records;
}

import { google } from "googleapis";

type InsertRowInput = Record<string, unknown>;

export class GoogleSheetService {
  private sheets;
  private spreadsheetId: string;
  private sheetName: string;
  private columns: string[];
  private resolvedSheetName?: string;

  constructor({
    spreadsheetId,
    sheetName = "Leads",
    accessToken,
    refreshToken,
    columns,
  }: {
    spreadsheetId: string;
    sheetName?: string;
    accessToken?: string;
    refreshToken?: string;
    columns: string[];
  }) {
    if (!spreadsheetId) {
      throw new Error("Spreadsheet ID is required.");
    }
    if (!columns || columns.length === 0) {
      throw new Error("At least one column must be specified.");
    }

    this.spreadsheetId = spreadsheetId;
    this.sheetName = sheetName.trim();
    this.columns = columns;

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
      access_token: accessToken || process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: refreshToken || process.env.GOOGLE_REFRESH_TOKEN,
    });
    this.sheets = google.sheets({ version: "v4", auth });
  }
  async ensureHeaders() {
    const sheetName = await this.resolveSheetName();
    
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${this.formatSheetName(sheetName)}!1:1`, // Read specific row 1
    });

    const existingHeaders = res.data.values?.[0] || [];

    if (existingHeaders.length === 0) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.formatSheetName(sheetName)}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [this.columns],
        },
      });
      console.log("✅ Created new header row:", this.columns);
    } else {
        const newColumns = this.columns.filter(c => !existingHeaders.includes(c));
      
      if (newColumns.length > 0) {
        const startColLetter = this.columnLetter(existingHeaders.length + 1);
        
        await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${this.formatSheetName(sheetName)}!${startColLetter}1`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [newColumns]
            }
        });
        console.log("✅ Appended new columns:", newColumns);
      }
      
      this.columns = [...existingHeaders, ...newColumns];
    }
  }

  async getRows() {
    await this.ensureHeaders();
    const sheetName = await this.resolveSheetName();
    
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.formatSheetName(sheetName),
    });

    const rows = res.data.values || [];
    const headers = (rows[0] || []).map((h: any) => String(h).trim());
    const data = rows.slice(1);

    return { headers, data };
  }

  async updateRow(rowIndex: number, data: InsertRowInput) {
    const sheetName = await this.resolveSheetName();
    const sheetRowNumber = rowIndex + 2; 

    const row = this.columns.map((col) => {
      let value = data[col];

      if (value === undefined) {
         const dataKeys = Object.keys(data);
         const matchingKey = dataKeys.find(k => k.toLowerCase() === col.toLowerCase() || k.toLowerCase().replace(/_/g, '') === col.toLowerCase().replace(/_/g, ''));
         if (matchingKey) {
             value = data[matchingKey];
         }
      }

      if (value === undefined || value === null) return "";
      if (Array.isArray(value)) return JSON.stringify(value);
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${this.formatSheetName(sheetName)}!A${sheetRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });
  }

  prepareRow(data: InsertRowInput): string[] {
    return this.columns.map((col) => {
      const targetCol = col.toLowerCase().trim();
      
      let value = data[col];
        
        if (value === undefined || value === null) {
         const dataKeys = Object.keys(data);
         const normalizedCol = targetCol.replace(/_/g, '');
         
         const matchingKey = dataKeys.find(k => {
             const nk = k.toLowerCase().replace(/_/g, '');
             return nk === normalizedCol || nk.endsWith(normalizedCol) || normalizedCol.endsWith(nk);
         });
         
         if (matchingKey) {
             value = data[matchingKey];
         }
      }

      if (value === undefined || value === null) return "";
      if (Array.isArray(value)) return JSON.stringify(value);
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });
  }

  async insertRow(data: InsertRowInput) {
    await this.ensureHeaders();
    const sheetName = await this.resolveSheetName();
    const row = this.prepareRow(data);

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: this.formatSheetName(sheetName),
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });
    return {
        ok: true,
        inserted: row
    }
  }

  async batchAppendRows(rows: string[][]) {
    if (rows.length === 0) return;
    await this.ensureHeaders();
    const sheetName = await this.resolveSheetName();
    
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: this.formatSheetName(sheetName),
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });
  }

  async clearSheetData() {
    const sheetName = await this.resolveSheetName();
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `${this.formatSheetName(sheetName)}!A2:ZZ`,
    });
  }

  private columnLetter(colNum: number): string {
    let result = "";
    let n = colNum;
    while (n > 0) {
      const mod = (n - 1) % 26;
      result = String.fromCharCode(65 + mod) + result;
      n = Math.floor((n - 1) / 26);
    }
    return result;
  }

  private formatSheetName(sheetName: string): string {
    const escaped = sheetName.replace(/'/g, "''");
    const needsQuotes = /[^A-Za-z0-9_]/.test(escaped);
    return needsQuotes ? `'${escaped}'` : escaped;
  }

  private async resolveSheetName(): Promise<string> {
    if (this.resolvedSheetName) {
      return this.resolvedSheetName;
    }

    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      fields: "sheets(properties(title))",
    });

    const titles = (res.data.sheets || [])
      .map((sheet) => sheet.properties?.title)
      .filter((title): title is string => Boolean(title));

    const exactMatch = titles.find((title) => title === this.sheetName);
    if (exactMatch) {
      this.resolvedSheetName = exactMatch;
      return exactMatch;
    }

    const caseInsensitiveMatch = titles.find(
      (title) => title.toLowerCase() === this.sheetName.toLowerCase()
    );
    if (caseInsensitiveMatch) {
      this.resolvedSheetName = caseInsensitiveMatch;
      return caseInsensitiveMatch;
    }

    throw new Error(
      `Sheet "${this.sheetName}" not found. Available sheets: ${titles.join(", ")}`
    );
  }
}

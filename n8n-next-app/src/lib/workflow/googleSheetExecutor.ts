
import { GoogleSheetService } from '@/lib/google-sheet/GoogleSheetService';

export async function executeGoogleSheetNode(
  nodeConfig: any, 
  inputData: any, 
  tokens: { accessToken?: string, refreshToken?: string },
  logs: string[]
): Promise<any> {
    const { spreadsheetId, sheetName, columns: configColumnsStr } = nodeConfig;
    
    if (!tokens.accessToken && !tokens.refreshToken) {
        throw new Error("User Google account not connected. Please log in.");
    }

    logs.push(`Executing Google Sheet Node`);
    
    
    if (inputData) {
        const type = Array.isArray(inputData) ? 'array' : typeof inputData;
        const keys = (type === 'object' && inputData !== null) ? Object.keys(inputData).join(', ') : 'none';
        logs.push(`Incoming data type: ${type}${type === 'object' ? ` (keys: ${keys.substring(0, 100)}${keys.length > 100 ? '...' : ''})` : ''}`);
    } else {
        logs.push(`Incoming data is null or undefined.`);
    }


    let rowData = inputData || {};
    let unwrapCount = 0;
            
    while (unwrapCount < 5) { 
        if (rowData && rowData.data && typeof rowData.data === 'object') {
            logs.push(`Unwrapping 'data' property...`);
            rowData = rowData.data;
            unwrapCount++;
        } else if (rowData && rowData.json && typeof rowData.json === 'object') {
            logs.push(`Unwrapping 'json' property...`);
            rowData = rowData.json;
            unwrapCount++;
        } else if (rowData && rowData.items && Array.isArray(rowData.items)) {
            logs.push(`Unwrapping 'items' array...`);
             rowData = rowData.items;
             unwrapCount++;
        } else if (rowData && rowData.records && Array.isArray(rowData.records)) {
            logs.push(`Unwrapping 'records' array...`);
             rowData = rowData.records;
             unwrapCount++;
        } else if (rowData && rowData.rows && Array.isArray(rowData.rows)) {
            logs.push(`Unwrapping 'rows' array...`);
             rowData = rowData.rows;
             unwrapCount++;
        } else {
             break;
        }
    }


    let itemsToInsert: any[] = [];
    if (Array.isArray(rowData)) {
        itemsToInsert = rowData;
    } else if (rowData && rowData.data && Array.isArray(rowData.data)) {
        itemsToInsert = rowData.data;
    } else if (rowData && rowData.items && Array.isArray(rowData.items)) {
        itemsToInsert = rowData.items;
    } else if (rowData && rowData.results && Array.isArray(rowData.results)) {
        itemsToInsert = rowData.results;
    } else if (rowData && rowData.records && Array.isArray(rowData.records)) {
        itemsToInsert = rowData.records;
    } else if (rowData && rowData.rows && Array.isArray(rowData.rows)) {
        itemsToInsert = rowData.rows;
    } else if (rowData && typeof rowData === 'object' && Object.keys(rowData).length > 0) {
        itemsToInsert = [rowData];
    }

    if (itemsToInsert.length === 0) {
        logs.push(`No data found to insert (Incoming data was empty or not an array).`);
    }

    const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
        const result: Record<string, any> = {};
        if (!obj || typeof obj !== 'object') return result;
        
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}_${key}` : key;
            
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(result, flattenObject(value, newKey));
            } else {
                result[newKey] = value;
            }
        }
        return result;
    };

    if (itemsToInsert.length > 0) {
        itemsToInsert = itemsToInsert.map(item => flattenObject(item));
    }

    let columns: string[] = [];
    if (configColumnsStr && configColumnsStr.trim().length > 0) {
        columns = configColumnsStr.split(',').map((s: string) => s.trim()).filter(Boolean);
    } 
    
    if (columns.length === 0 && itemsToInsert.length > 0) {
        const firstItem = itemsToInsert[0];
        const excludeFields = new Set(['status', 'statusText', 'executionTime', 'headers', 'timestamp', 'success', 'triggeredAt', 'executionId', 'source']);
        columns = Object.keys(firstItem).filter(k => !excludeFields.has(k));
        logs.push(`Auto-detected columns: ${columns.slice(0, 10).join(', ')}${columns.length > 10 ? '...' : ''}`);
        
        if (columns.length === 0) {
            logs.push(`Auto-detection found no valid columns.`);
        }
    }

    if (columns.length === 0) {
        if (itemsToInsert.length > 0) {
            logs.push(`configured columns empty and auto-detection failed.`);
            // Continue anyway? No, insertRow needs columns
            // But let's log and return
            return { insertedCount: 0, error: "No columns" };
        } else {
             logs.push(`No data found to insert.`);
             return { insertedCount: 0 };
        }
    }

    logs.push(`Target Columns: ${columns.join(', ')}`);

    if (itemsToInsert.length > 0) {
         logs.push(`Preparing to insert ${itemsToInsert.length} rows.`);
         const sampleStr = JSON.stringify(itemsToInsert[0]);
         logs.push(`Sample Data (Row 1): ${sampleStr.substring(0, 150)}${sampleStr.length > 150 ? '...' : ''}`);
    }

    const service = new GoogleSheetService({
        spreadsheetId,
        sheetName,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        columns
    });

    try {
        await service.ensureHeaders();
    } catch (err: any) {
        logs.push(`Failed to sync sheet headers: ${err.message}`);
    }

    const action = nodeConfig.action || 'insert';
    let finalItemsToInsert: any[] = [];

    if (action === 'sync') {
        logs.push(`Sync Action: Clearing existing data and re-appending all fresh data...`);
        try {
            await service.clearSheetData();
            finalItemsToInsert = itemsToInsert;
        } catch (err: any) {
            logs.push(`Failed to clear sheet data: ${err.message}. Defaulting to insert mode.`);
            finalItemsToInsert = await runDeduplication(service, itemsToInsert, logs);
        }
    } else {
        logs.push(`Insert Action: Appending new items only (with deduplication)...`);
        finalItemsToInsert = await runDeduplication(service, itemsToInsert, logs);
    }

    if (finalItemsToInsert.length === 0) {
        logs.push(`No new data to insert (all items were duplicates or input was empty).`);
        return { insertedCount: 0, columns };
    }

    try {
        logs.push(`Inserting ${finalItemsToInsert.length} new rows...`);
        const rowsToAppend = finalItemsToInsert.map(item => service.prepareRow(item));
        
        await service.batchAppendRows(rowsToAppend);
        
        logs.push(`Successfully inserted ${finalItemsToInsert.length} rows.`);
        return { insertedCount: finalItemsToInsert.length, columns };
    } catch (err: any) {
        logs.push(`Failed to insert rows: ${err.message}`);
        // Fallback to individual insert if batch fails (optional, but let's just fail)
        throw err;
    }
}

async function runDeduplication(service: GoogleSheetService, itemsToInsert: any[], logs: string[]): Promise<any[]> {
    let finalItemsToInsert: any[] = [];
    try {
        logs.push(`Checking for duplicates...`);
        const { headers, data: existingRows } = await service.getRows();
        
        const potentialIdCols = ['id', 'ID', 'Id', '_id', 'email', 'Email', 'uuid', 'UUID', 'user_id', 'userid', 'UserID', 'order_id', 'orderid'];
        let idColumn = '';
        let idIndex = -1;
        
        for (const candidate of potentialIdCols) {
            idIndex = headers.findIndex((h: string) => h === candidate || h.toLowerCase() === candidate.toLowerCase());
            if (idIndex !== -1) {
                idColumn = headers[idIndex];
                break;
            }
        }
        
        if (idIndex !== -1 && idColumn) {
            logs.push(`Using column '${idColumn}' for deduplication.`);
            const existingIds = new Set<string>();
            
            existingRows.forEach((row: string[]) => {
                const val = row[idIndex];
                if (val !== undefined && val !== null) existingIds.add(String(val).trim());
            });
            
            let duplicates = 0;
            for (const item of itemsToInsert) {
                 const itemKeys = Object.keys(item);
                 const matchingKey = itemKeys.find(k => k.toLowerCase() === idColumn.toLowerCase());
                 
                 if (matchingKey) {
                     const idValue = String(item[matchingKey]).trim();
                     if (existingIds.has(idValue)) {
                         duplicates++;
                         continue; 
                     }
                     existingIds.add(idValue);
                 }
                 finalItemsToInsert.push(item);
            }
            
            if (duplicates > 0) logs.push(`Skipped ${duplicates} duplicate items (by ID).`);
        } else {
            logs.push(`No unique ID column found. Checking for exact row duplicates...`);
            
            // Create a set of stringified rows for O(1) lookup
            const existingRowsSet = new Set<string>();
            existingRows.forEach((row: string[]) => {
                existingRowsSet.add(JSON.stringify(row));
            });
            
            let duplicates = 0;
            for (const item of itemsToInsert) {
                const preparedRow = service.prepareRow(item);
                const rowStr = JSON.stringify(preparedRow);
                
                if (existingRowsSet.has(rowStr)) {
                    duplicates++;
                    continue;
                }
                
                // Also prevent duplicates within the same batch
                existingRowsSet.add(rowStr);
                finalItemsToInsert.push(item);
            }
            
            if (duplicates > 0) logs.push(`Skipped ${duplicates} duplicate items (exact row match).`);
        }
    } catch (err: any) {
        logs.push(`Duplicate check failed: ${err.message}. Proceeding with all items.`);
        finalItemsToInsert = itemsToInsert;
    }
    return finalItemsToInsert;
}

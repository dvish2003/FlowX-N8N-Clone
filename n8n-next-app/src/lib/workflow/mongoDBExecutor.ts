import { MongoClient, Collection, Db } from 'mongodb';

/**
 * MongoDBExecutor Class
 * Handles automated data synchronization, deduplication, and connection management.
 */
class MongoDBExecutor {
    private client: MongoClient | null = null;
    private logs: string[];
    private config: any;

    constructor(config: any, logs: string[]) {
        this.config = config;
        this.logs = logs;
    }

    private log(message: string) {
        this.logs.push(message);
    }

    /**
     * Connects to the MongoDB instance using provided credentials or connection string
     */
    async connect(): Promise<{ db: Db; coll: Collection }> {
        const { connectionString, database, collection, user, password } = this.config;
        
        if (!connectionString) {
            throw new Error("MongoDB Connection String is required.");
        }

        let finalConnString = connectionString;
        if (user && password && !connectionString.includes('@')) {
            if (connectionString.startsWith('mongodb://')) {
                finalConnString = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${connectionString.substring(10)}`;
            } else if (connectionString.startsWith('mongodb+srv://')) {
                finalConnString = `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${connectionString.substring(14)}`;
            }
        }

        this.client = new MongoClient(finalConnString);
        await this.client.connect();
        
        const dbName = database || 'flow_x';
        const collName = collection || 'data';
        
        const db = this.client.db(dbName);
        const coll = db.collection(collName);
        
        this.log(`✓ Connected to host: ${connectionString.split('@').pop()?.split('/')[0]}`);
        return { db, coll };
    }

    /**
     * Deep unwraps incoming data to find the actual payload
     */
    unwrapData(inputData: any): any[] {
        let processedData = inputData || {};
        let unwrapCount = 0;
                
        while (unwrapCount < 5) { 
            if (processedData?.data && (Array.isArray(processedData.data) || typeof processedData.data === 'object')) {
                processedData = processedData.data;
            } else if (processedData?.json && (Array.isArray(processedData.json) || typeof processedData.json === 'object')) {
                processedData = processedData.json;
            } else if (processedData?.items && Array.isArray(processedData.items)) {
                processedData = processedData.items;
            } else if (processedData?.records && Array.isArray(processedData.records)) {
                processedData = processedData.records;
            } else {
                break;
            }
            unwrapCount++;
        }

        let items: any[] = [];
        if (Array.isArray(processedData)) {
            items = processedData;
        } else if (processedData && typeof processedData === 'object' && Object.keys(processedData).length > 0) {
            if (processedData.items && Array.isArray(processedData.items)) items = processedData.items;
            else if (processedData.results && Array.isArray(processedData.results)) items = processedData.results;
            else if (processedData.data && Array.isArray(processedData.data)) items = processedData.data;
            else items = [processedData];
        }

        return items;
    }

    /**
     * Cleans items by removing internal _id unless it's the designated unique key
     */
    cleanItems(items: any[]): any[] {
        const keyField = this.config.duplicateKeyField || 'id';
        return items.map(item => {
            if (typeof item !== 'object' || item === null) return item;
            const newItem = { ...item };
            if (keyField !== '_id') {
                delete (newItem as any)._id;
            }
            return newItem;
        });
    }

    /**
     * Executes the Intelligent Sync (HTTP to MongoDB Mirroring)
     * - Checks for common ID fields (id, _id, email, etc.)
     * - If no ID match found, checks for exact content match
     * - Ensures new data is automatically inserted just like Google Sheets
     */
    async sync(items: any[], coll: Collection) {
        let savedCount = 0;
        let skippedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;

        const userDefinedKey = this.config.duplicateKeyField;
        const potentialIdCols = ['id', '_id', 'email', 'sku', 'uuid', 'user_id', 'contact'];
        const checkDuplicateKey = this.config.checkDuplicateKey !== false; 

        if (checkDuplicateKey) {
            this.log(`🔍 Sync: Comparing stream with collection '${coll.collectionName}'...`);
            
            // 1. Fetch current footprints for exact matching
            const allExistingData = await coll.find().limit(1000).toArray();
            const stringifiedExisting = new Set(allExistingData.map(d => {
                const doc = { ...d } as any;
                delete doc._id;
                return JSON.stringify(doc);
            }));

            const activeKeyField = userDefinedKey || 'id';

            for (const item of items) {
                try {
                    const cleanedItem = { ...item } as any;
                    if (cleanedItem._id && activeKeyField !== '_id') {
                        delete cleanedItem._id;
                    }

                    // Find the best key to check
                    let activeKey = activeKeyField;
                    let keyValue = item[activeKey];

                    // Auto-Discovery: If user key fails, try candidates
                    if (keyValue === undefined) {
                        for (const candidate of potentialIdCols) {
                            if (item[candidate] !== undefined) {
                                activeKey = candidate;
                                keyValue = item[candidate];
                                break;
                            }
                        }
                    }

                    const keyValueStr = keyValue !== undefined ? String(keyValue) : null;
                    let isDuplicate = false;

                    // A. Check by identified Key
                    if (keyValueStr) {
                        const existing = await coll.findOne({ [activeKey]: keyValue });
                        if (existing) isDuplicate = true;
                    } 
                    // B. Fallback: Exact Row Match
                    else {
                        const itemStr = JSON.stringify(cleanedItem);
                        if (stringifiedExisting.has(itemStr)) isDuplicate = true;
                    }

                    if (isDuplicate) {
                        if (this.config.duplicateAction === 'update' && keyValueStr) {
                            await coll.updateOne({ [activeKey]: keyValue }, { $set: cleanedItem });
                            updatedCount++;
                        } else {
                            skippedCount++;
                        }
                    } else {
                        // NEW or RE-SYNC (Deleted)
                        await coll.insertOne(cleanedItem);
                        savedCount++;
                        stringifiedExisting.add(JSON.stringify(cleanedItem));
                    }
                } catch (err: any) {
                    errorCount++;
                    this.log(`✗ Sync Error: ${err.message}`);
                }
            }
        } else {
            this.log(`⚠️ Continuous Mode: Appending all ${items.length} records.`);
            const result = await coll.insertMany(items.map(i => {
                const cleaned = { ...i } as any;
                if (cleaned._id) delete cleaned._id;
                return cleaned;
            }));
            savedCount = result.insertedCount;
        }

        // Final High-Visibility Logs (Bottom Console)
        if (savedCount > 0) this.log(`✨ Automator: Successfully resaved/inserted ${savedCount} missing documents.`);
        if (updatedCount > 0) this.log(`🔄 Automator: Updated ${updatedCount} existing documents.`);
        if (skippedCount > 0) this.log(`ℹ Automator: Purged ${skippedCount} duplicate entries.`);
        
        return { savedCount, updatedCount, skippedCount, errorCount };
    }

    /**
     * Closes the connection
     */
    async close() {
        if (this.client) {
            await this.client.close();
        }
    }
}

/**
 * Main execution function wrapper
 */
export async function executeMongoDBNode(
  nodeConfig: any,
  inputData: any,
  logs: string[]
): Promise<any> {
    const executor = new MongoDBExecutor(nodeConfig, logs);
    
    try {
        logs.push(`🚀 Starting MongoDB Neural Sync...`);
        
        const rawItems = executor.unwrapData(inputData);
        if (rawItems.length === 0) {
            logs.push(`⚠️ No compatible data found in input stream.`);
            return { success: true, savedCount: 0 };
        }

        const cleanedItems = executor.cleanItems(rawItems);
        logs.push(`📦 Payload extracted: ${cleanedItems.length} records ready.`);

        const { coll } = await executor.connect();
        const result = await executor.sync(cleanedItems, coll);

        return {
            success: true,
            ...result,
            database: nodeConfig.database || 'flow_x',
            collection: nodeConfig.collection || 'data'
        };

    } catch (error: any) {
        logs.push(`✗ Fatal Error: ${error.message}`);
        throw error;
    } finally {
        await executor.close();
    }
}

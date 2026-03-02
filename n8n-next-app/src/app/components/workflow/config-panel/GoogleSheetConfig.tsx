"use client"
import React, { useState, useCallback, useEffect } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { useSession, signIn } from 'next-auth/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Checkbox } from '@/app/components/ui/checkbox'

type GoogleSheetConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

type DriveFile = {
    id: string;
    name: string;
}

export function GoogleSheetConfig({ nodeId, nodeData, onChange }: GoogleSheetConfigProps) {
  const dispatch = useDispatch()
  const { data: session } = useSession()
  
  const nodes = useSelector((state: any) => state.flow.nodes)
  const edges = useSelector((state: any) => state.flow.edges)
  
  const [spreadsheetId, setSpreadsheetId] = useState(String(nodeData?.spreadsheetId || ''))
  const [sheetName, setSheetName] = useState(String(nodeData?.sheetName || 'Sheet1'))
  const [columns, setColumns] = useState(String(nodeData?.columns || ''))
  const [action, setAction] = useState(String(nodeData?.action || 'insert'))
  
  const [spreadsheets, setSpreadsheets] = useState<DriveFile[]>([])
  const [sheets, setSheets] = useState<string[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [loadingSheets, setLoadingSheets] = useState(false)

  const [isConnected, setIsConnected] = useState(false)
  const [connectedEmail, setConnectedEmail] = useState('')
  const [checkingStatus, setCheckingStatus] = useState(true)
  
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set())
  const [testingHttp, setTestingHttp] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [hasHttpNode, setHasHttpNode] = useState(false)

  useEffect(() => {
    if (!nodeId || !edges || !nodes) return;
    
    // Find edges where this Google Sheet node is the target
    const incomingEdges = edges.filter((edge: any) => edge.target === nodeId);
    
    // Get source nodes
    const sourceNodes = incomingEdges.map((edge: any) => 
      nodes.find((node: any) => node.id === edge.source)
    ).filter(Boolean);
    
    // Check if any source is an HTTP node
    const httpNode = sourceNodes.find((node: any) => node.type === 'httpNode');
    setHasHttpNode(!!httpNode);
  }, [nodeId, edges, nodes]);

  useEffect(() => {
    setCheckingStatus(true);
    fetch('/api/integrations/google/status')
        .then(res => res.json())
        .then(data => {
            setIsConnected(data.connected);
            if (data.email) setConnectedEmail(data.email);
        })
        .catch(err => console.error("Failed to check google status", err))
        .finally(() => setCheckingStatus(false));
  }, [session]);

  useEffect(() => {
    if (isConnected) {
        setLoadingFiles(true);
        fetch('/api/integrations/google/drive/files')
            .then(res => res.json())
            .then(data => {
                if (data.files) {
                    setSpreadsheets(data.files);
                } else {
                    console.log("No files returned:", data);
                }
            })
            .catch(err => console.error("Failed to load spreadsheets", err))
            .finally(() => setLoadingFiles(false));
    }
  }, [isConnected]);

  useEffect(() => {
    if (spreadsheetId && isConnected) {
        setLoadingSheets(true);
        fetch(`/api/integrations/google/sheets/list?spreadsheetId=${spreadsheetId}`)
            .then(res => res.json())
            .then(data => {
                if (data.sheets) {
                    setSheets(data.sheets);
                    if (!data.sheets.includes(sheetName) && data.sheets.length > 0) {
                        setSheetName(data.sheets[0]);
                        onChange?.({
                             spreadsheetId,
                             sheetName: data.sheets[0],
                             columns,
                             action
                        })
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoadingSheets(false));
    }
  }, [spreadsheetId, isConnected]);

  useEffect(() => {
    if (columns) {
      const cols = columns.split(',').map(c => c.trim()).filter(Boolean);
      setSelectedColumns(new Set(cols));
    }
  }, []);

  const handleConnect = () => {
     signIn('google', { callbackUrl: window.location.href });
  }

  const handleTestHttp = async () => {
    if (!nodeId || !edges || !nodes) return;
    
    setTestingHttp(true);
    setTestError(null);
    setTestResult(null);
    setAvailableColumns([]);
    
    try {
      const incomingEdges = edges.filter((edge: any) => edge.target === nodeId);
      const sourceNodes = incomingEdges.map((edge: any) => 
        nodes.find((node: any) => node.id === edge.source)
      ).filter(Boolean);
      
      const httpNode = sourceNodes.find((node: any) => node.type === 'httpNode');
      
      if (!httpNode) {
        setTestError('No HTTP node connected. Please connect an HTTP Request node first.');
        return;
      }
      
      const response = await fetch('/api/workflows/test-http', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: httpNode.data?.method || 'GET',
          url: httpNode.data?.url,
          headers: httpNode.data?.headers || {},
          authentication: httpNode.data?.authentication || 'none',
          basicAuth: httpNode.data?.basicAuth,
          bearerToken: httpNode.data?.bearerToken,
          apiKey: httpNode.data?.apiKey,
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        setTestError(result.error || 'HTTP request failed');
        return;
      }
      
      setTestResult(result.data);
      
      const extractColumns = (data: any): string[] => {
        let items: any[] = [];
        
        // Handle different data structures
        if (Array.isArray(data)) {
          items = data;
        } else if (data?.data && Array.isArray(data.data)) {
          items = data.data;
        } else if (data?.items && Array.isArray(data.items)) {
          items = data.items;
        } else if (data?.results && Array.isArray(data.results)) {
          items = data.results;
        } else if (typeof data === 'object' && data !== null) {
          items = [data];
        }
        
        if (items.length === 0) return [];
        
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
        
        const flatItem = flattenObject(items[0]);
        
        // Exclude metadata fields
        const excludeFields = new Set([
          'timestamp', 'success', 'status', 'executionTime',
          'headers', 'statusText', 'triggeredAt', 'executionId', 'source'
        ]);
        
        return Object.keys(flatItem).filter(k => {
          const rootKey = k.split('_')[0];
          return !excludeFields.has(k) && !excludeFields.has(rootKey);
        });
      };
      
      const cols = extractColumns(result.data);
      setAvailableColumns(cols);
      
      // Pre-select all columns if none were selected before
      if (selectedColumns.size === 0 && cols.length > 0) {
        setSelectedColumns(new Set(cols));
      }
      
    } catch (err: any) {
      setTestError(err.message || 'Failed to test HTTP request');
    } finally {
      setTestingHttp(false);
    }
  };

  const toggleColumn = (col: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(col)) {
      newSelected.delete(col);
    } else {
      newSelected.add(col);
    }
    setSelectedColumns(newSelected);
    
    // Update columns string
    const columnsStr = Array.from(newSelected).join(', ');
    setColumns(columnsStr);
    onChange?.({
      spreadsheetId,
      sheetName,
      columns: columnsStr,
      action
    });
  };

  const selectAllColumns = () => {
    setSelectedColumns(new Set(availableColumns));
    const columnsStr = availableColumns.join(', ');
    setColumns(columnsStr);
    onChange?.({
      spreadsheetId,
      sheetName,
      columns: columnsStr,
      action
    });
  };

  const deselectAllColumns = () => {
    setSelectedColumns(new Set());
    setColumns('');
    onChange?.({
      spreadsheetId,
      sheetName,
      columns: '',
      action
    });
  };

  const handleSave = useCallback(() => {
    onChange?.({
      spreadsheetId,
      sheetName,
      columns,
      action
    })
  }, [spreadsheetId, sheetName, columns, action, onChange])

  const handleRemove = useCallback(() => {
    if (nodeId && window.confirm('Are you sure you want to remove this node?')) {
      dispatch(deleteNode(nodeId))
    }
  }, [nodeId, dispatch])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Google Sheet</h3>
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleRemove}
        >
            Remove
        </Button>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connection</Label>
              {checkingStatus && <span className="text-[10px] text-slate-400">Checking...</span>}
          </div>
          
          {!isConnected ? (
                <div className="text-center py-2">
                    <p className="text-xs text-slate-500 mb-3">Connect your Google account to access spreadsheets.</p>
                    <Button 
                        onClick={handleConnect} 
                        className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2"
                    >
                        <img src="/icons/google.png" alt="Google" className="w-4 h-4" />
                        <span>Connect Google Drive</span>
                    </Button>
                </div>
          ) : (
             <div className="flex items-center justify-between bg-green-50 border border-green-100 p-2 rounded">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-green-700">Connected</span>
                        <span className="text-[10px] text-green-600">{connectedEmail}</span>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[10px] text-slate-400 hover:text-slate-600"
                    onClick={handleConnect}
                >
                    Switch
                </Button>
             </div>
          )}
      </div>
      
      {isConnected && (
        <>
        <div className="animate-in fade-in slide-in-from-top-2 duration-500 space-y-4">
            <div>
                <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="spreadsheetId">Spreadsheet</Label>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 text-[10px] px-2 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                             setLoadingFiles(true);
                             fetch('/api/integrations/google/drive/files')
                                .then(res => res.json())
                                .then(data => {
                                    if (data.files) setSpreadsheets(data.files);
                                })
                                .finally(() => setLoadingFiles(false));
                        }}
                    >
                        Refresh List
                    </Button>
                </div>
                <Select 
                    value={spreadsheetId} 
                    onValueChange={(val) => {
                        setSpreadsheetId(val); 
                        onChange?.({
                             spreadsheetId: val,
                             sheetName,
                             columns,
                             action
                        });
                    }}
                >
                    <SelectTrigger className="mt-1">
                    <SelectValue placeholder={loadingFiles ? "Loading..." : "Select Spreadsheet"} />
                    </SelectTrigger>
                    <SelectContent>
                        {spreadsheets.map(file => (
                            <SelectItem key={file.id} value={file.id}>{file.name}</SelectItem>
                        ))}
                        {spreadsheets.length === 0 && !loadingFiles && (
                            <SelectItem value="none" disabled>No spreadsheets found</SelectItem>
                        )}
                    </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-400 mt-1">Select the spreadsheet to write to.</p>
            </div>

            <div>
                <Label htmlFor="sheetName">Sheet Name</Label>
                {spreadsheetId ? (
                    <Select 
                        value={sheetName} 
                        onValueChange={(val) => {
                            setSheetName(val);
                            onChange?.({
                                 spreadsheetId,
                                 sheetName: val,
                                 columns,
                                 action
                            });
                        }}
                    >
                        <SelectTrigger className="mt-1">
                        <SelectValue placeholder={loadingSheets ? "Loading..." : "Select Sheet"} />
                        </SelectTrigger>
                        <SelectContent>
                            {sheets.map(sheet => (
                                <SelectItem key={sheet} value={sheet}>{sheet}</SelectItem>
                            ))}
                            {sheets.length === 0 && !loadingSheets && (
                                <SelectItem value="Sheet1">Sheet1 (Default)</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        id="sheetName"
                        placeholder="Select a spreadsheet first"
                        value={sheetName}
                        disabled
                        className="mt-1"
                    />
                )}
            </div>

            <div className="pt-2">
                <Label htmlFor="action" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operation Mode</Label>
                <Select 
                    value={action} 
                    onValueChange={(val) => {
                        setAction(val);
                        onChange?.({
                             spreadsheetId,
                             sheetName,
                             columns,
                             action: val
                        });
                    }}
                >
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Operation" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="insert">Insert (Append missing rows)</SelectItem>
                        <SelectItem value="sync">Sync (Clear & re-append all rows)</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-400 mt-1">
                    {action === 'sync' 
                        ? 'Full Sync: Clears all existing data (except headers) and re-appends the latest output.' 
                        : 'Insert: Only appends new rows. Deduplication is performed by checking for existing IDs.'}
                </p>
            </div>
        </div>
        </>
      )}

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Column Mapping
          </Label>
          {hasHttpNode && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
              onClick={handleTestHttp}
              disabled={testingHttp}
            >
               {testingHttp ? (
                <>
                   Testing...
                </>
              ) : (
                <>
                   Fetch Columns from HTTP
                </>
              )}
            </Button>
          )}
        </div>
        
        {!hasHttpNode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-amber-700">
               <strong>Tip:</strong> Connect an HTTP Request node to auto-detect columns from API response.
            </p>
          </div>
        )}
        
        {testError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-red-600">{testError}</p>
          </div>
        )}
        

        {availableColumns.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600">
                Available Fields ({availableColumns.length})
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[10px] px-2 text-blue-600 hover:bg-blue-50"
                  onClick={selectAllColumns}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[10px] px-2 text-slate-500 hover:bg-slate-100"
                  onClick={deselectAllColumns}
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {availableColumns.map((col) => (
                <label
                  key={col}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all text-xs
                    ${selectedColumns.has(col) 
                      ? 'bg-blue-100 border border-blue-300 text-blue-800' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  onClick={() => toggleColumn(col)}
                >
                  <Checkbox
                    checked={selectedColumns.has(col)}
                    onCheckedChange={() => toggleColumn(col)}
                    className="h-3 w-3"
                  />
                  <span className="truncate font-mono text-[11px]">{col}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-3 pt-2 border-t border-slate-200">
              <p className="text-[10px] text-slate-500">
                Selected: <span className="font-semibold text-blue-600">{selectedColumns.size}</span> columns
              </p>
            </div>
          </div>
        )}
        

        <div>
          <Label htmlFor="columns">Columns (Comma Separated)</Label>
          <Input
            id="columns"
            placeholder="e.g. Name, Email, Phone"
            value={columns}
            onChange={(e) => {
                const val = e.target.value;
                setColumns(val);
                // Update selected columns set
                const cols = val.split(',').map(c => c.trim()).filter(Boolean);
                setSelectedColumns(new Set(cols));
                onChange?.({
                     spreadsheetId,
                     sheetName,
                     columns: val,
                     action
                });
            }}
            className="mt-1 font-mono text-xs"
          />
          <p className="text-[10px] text-slate-400 mt-1">
              Leave empty to auto-detect columns from input JSON data.
          </p>
        </div>
      </div>


      {testResult && (
        <div className="border-t pt-4">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Sample Data Preview
          </Label>
          <div className="bg-slate-900 text-green-400 p-3 rounded-lg overflow-x-auto max-h-40 overflow-y-auto">
            <pre className="text-[10px] font-mono">
              {JSON.stringify(testResult, null, 2).substring(0, 500)}
              {JSON.stringify(testResult).length > 500 && '...'}
            </pre>
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <Button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  )
}

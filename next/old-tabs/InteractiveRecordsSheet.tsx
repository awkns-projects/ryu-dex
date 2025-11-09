'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SearchIcon, SparklesIcon, XIcon, PlusIcon, PlayIcon, MoreHorizontalIcon, TableIcon, DownloadIcon, DatabaseIcon } from 'lucide-react';
import { classNames, formatActionName } from '@/lib/utils';
import { AgentData, AgentModel } from '@/lib/types';

interface InteractiveRecordsSheetProps {
  agentData: AgentData;
  onExecuteAction: (actionId: string, recordId: string, recordName: string) => void;
  activeModelTab: string;
  setActiveModelTab: (id: string) => void;
  onShowCreateRecord: () => void;
  onSelectRecord: (record: Record<string, any>, model: AgentModel) => void;
  getActionsForModel: (modelId: string) => any[];
  formatFieldValue: (record: any, field: any) => any;
  getDisplayValueForReference: (referenceId: string, referencedModelName: string) => string;
  onShowModelDetails: (model: AgentModel) => void;
  onShowActionPrompt: (action: any, recordId: string, recordName: string) => void;
  onShowAddAction: (model: AgentModel) => void;
}

export function InteractiveRecordsSheet({
  agentData,
  onExecuteAction,
  activeModelTab,
  setActiveModelTab,
  onShowCreateRecord,
  onSelectRecord,
  getActionsForModel,
  formatFieldValue,
  getDisplayValueForReference,
  onShowModelDetails,
  onShowActionPrompt,
  onShowAddAction
}: InteractiveRecordsSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSemanticSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/agent/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentData.id,
          query: query.trim(),
          modelId: activeModelTab,
        }),
      });
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results.records || []);
      } else {
        console.error('Search failed:', await response.text());
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = (() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleSemanticSearch(query), 300);
    };
  })();

  const exportToCSV = (model: AgentModel) => {
    if (!model.records || model.records.length === 0) return;

    const fields = model.fields;
    const header = fields.map(f => f.name).join(',');
    
    const rows = model.records.map(record => {
      return fields.map(field => {
        const value = record[field.name];
        if (value === null || value === undefined) return '';
        
        switch (field.type) {
          case 'reference':
            if (Array.isArray(value)) {
              return `"${value.map(refId => getDisplayValueForReference(refId, field.referencesModel!)).join('; ')}"`;
            }
            return `"${getDisplayValueForReference(value, field.referencesModel!)}"`;
          case 'boolean':
            return value ? 'true' : 'false';
          default:
            const stringValue = String(value);
            return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
        }
      }).join(',');
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${model.name}_records.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const activeModel = agentData.models.find(m => m.id === activeModelTab);
  if (!activeModel) return null;

  return (
    <div className="rounded-lg border bg-card">
      {/* Model Selection and Controls */}
      <div className="border-b bg-muted/30 p-4 space-y-4">
        {/* Model Selection */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="flex-1">
              <Label>Active Model</Label>
              <Select
                value={activeModelTab}
                onValueChange={(value) => {
                  setActiveModelTab(value);
                  setSearchQuery('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model to view" />
                </SelectTrigger>
                <SelectContent>
                  {agentData.models.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.records?.length || 0} records)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowModelDetails(activeModel)}
                className="gap-2 whitespace-nowrap"
              >
                <DatabaseIcon className="h-4 w-4" />
                Details
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar with New Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeModel.name} records...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className="pl-10 pr-10"
            />
            {isSearching ? (
              <SparklesIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary animate-pulse" />
            ) : searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <XIcon className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onShowCreateRecord}
            className="gap-2 whitespace-nowrap"
          >
            <PlusIcon className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {/* Records Table with Horizontal Scroll */}
      <div className="overflow-x-auto">
        {searchQuery && searchResults.length > 0 ? (
          // Search Results
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Semantic Search Results</span>
              <Badge variant="outline" className="text-xs">
                {searchResults.length} matches
              </Badge>
            </div>
            {searchResults.map((result, index) => (
              <div key={result.id || index} className="border rounded-lg p-3 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">
                      {result.record[activeModel.fields.find(f => f.name.toLowerCase().includes('name'))?.name || 'name'] || 'Record'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Similarity: {Math.round(result.similarity * 100)}% • Reason: {result.reason}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      {activeModel.fields.slice(0, 4).map((field) => (
                        <div key={field.name}>
                          <span className="text-muted-foreground">{field.name}:</span>
                          <span className="ml-1">{String(result.record[field.name] || '-')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    {getActionsForModel(activeModel.id).map((action) => (
                      <Button
                        key={action.id}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const recordName = result.record[activeModel.fields.find(f => f.name.toLowerCase().includes('name'))?.name || 'name'] || 'Record';
                          onShowActionPrompt(action, result.record.id || `search-${index}`, recordName);
                        }}
                        className="text-xs w-full sm:w-auto"
                      >
                        {action.emoji ? (
                          <span className="mr-1 text-sm">{action.emoji}</span>
                        ) : (
                          <PlayIcon className="h-3 w-3 mr-1" />
                        )}
                        {action.title || formatActionName(action.name)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && searchResults.length === 0 && !isSearching ? (
          <div className="text-center py-8 text-muted-foreground">
            <SearchIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No records found for "{searchQuery}"</p>
            <p className="text-xs mt-1">Try different search terms</p>
          </div>
        ) : !activeModel.records || activeModel.records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TableIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No records available</p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onShowCreateRecord}
                className="gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Create First Record
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-w-[800px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium text-foreground w-10">
                    Actions
                  </th>
                  {activeModel.fields.map((field, index) => (
                    <th key={index} className="px-3 py-2 text-left font-medium text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{field.type === 'text' ? '📝' : field.type === 'number' ? '🔢' : field.type === 'boolean' ? '✅' : field.type === 'date' ? '📅' : field.type === 'json' ? '🔧' : field.type === 'reference' ? '🔗' : '❓'}</span>
                        {field.title}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeModel.records.map((record, rowIndex) => {
                  const uniqueKey = record.id ? `${record.id}-${rowIndex}` : `row-${rowIndex}`;
                  return (
                    <tr key={uniqueKey} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-3 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {getActionsForModel(activeModel.id).length > 0 && 
                              getActionsForModel(activeModel.id).map((action) => (
                                <DropdownMenuItem
                                  key={action.id}
                                  onClick={() => {
                                    const recordName = record[activeModel.displayFields?.[0] || 'name'] || 'Record';
                                    onShowActionPrompt(action, record.id || `row-${rowIndex}`, recordName);
                                  }}
                                >
                                  {action.emoji ? (
                                    <span className="mr-2 text-sm">{action.emoji}</span>
                                  ) : (
                                    <PlayIcon className="h-4 w-4 mr-2" />
                                  )}
                                  {action.title || formatActionName(action.name)}
                                </DropdownMenuItem>
                              ))
                            }
                            <DropdownMenuItem onClick={() => onShowAddAction(activeModel)}>
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Add Action
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      {activeModel.fields.map((field, colIndex) => (
                        <td 
                          key={colIndex} 
                          className="px-3 py-2 text-foreground cursor-pointer"
                          onClick={() => onSelectRecord(record, activeModel)}
                        >
                          <div className={classNames(
                            "max-w-[250px]",
                            field.type === 'reference' ? "whitespace-normal" : "truncate"
                          )}>
                            {formatFieldValue(record, field)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add export button at the bottom */}
      {activeModel.records && activeModel.records.length > 0 && (
        <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {activeModel.records.length} record{activeModel.records.length !== 1 ? 's' : ''}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(activeModel)}
            className="gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      )}
    </div>
  );
}

export default InteractiveRecordsSheet; 
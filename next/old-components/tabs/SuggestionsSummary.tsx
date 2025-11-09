'use client';

import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';

interface SuggestionsSummaryProps {
  fieldSuggestions: any;
  onClose: () => void;
}

export function SuggestionsSummary({ fieldSuggestions, onClose }: SuggestionsSummaryProps) {
  if (!fieldSuggestions) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
          ✨ AI Suggestions Applied
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
        >
          <XIcon className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-2 text-xs">
        {fieldSuggestions.inputFields?.length > 0 && (
          <div className="text-blue-800 dark:text-blue-200">
            <strong>Input fields:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {fieldSuggestions.inputFields.map((f: any) => (
                <div key={f.name}>
                  {f.type === 'enum' || f.enumValues ? (
                    <details className="inline-block">
                      <summary className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800/50">
                        🏷️ {f.name} <span className="opacity-75">(enum)</span>
                      </summary>
                      <div className="absolute z-10 mt-1 p-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-md shadow-lg text-xs">
                        <div className="font-medium mb-1">Enum values:</div>
                        <div className="space-y-1">
                          {f.enumValues?.map((value: string) => (
                            <div key={value} className="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                              {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded text-xs">
                      {f.isCustom && f.customFieldType === 'scalar' && '📊'}
                      {f.isCustom && f.customFieldType === 'existing_model' && '🏢'}
                      {f.isCustom && f.customFieldType === 'new_model' && '✨'}
                      {!f.isCustom && (f.type === 'text' ? '📝' : f.type === 'number' ? '🔢' : f.type === 'boolean' ? '✅' : f.type === 'date' ? '📅' : f.type === 'json' ? '🔧' : f.type === 'reference' ? '🔗' : '❓')}
                      {f.name}
                      {f.referencesModel && <span className="opacity-75">→{f.referencesModel}</span>}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {fieldSuggestions.outputFields?.length > 0 && (
          <div className="text-blue-800 dark:text-blue-200">
            <strong>Output fields:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {fieldSuggestions.outputFields.map((f: any) => (
                <div key={f.name}>
                  {f.type === 'enum' || f.enumValues ? (
                    <details className="inline-block">
                      <summary className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800/50">
                        🏷️ {f.name} <span className="opacity-75">(enum)</span>
                      </summary>
                      <div className="absolute z-10 mt-1 p-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-md shadow-lg text-xs">
                        <div className="font-medium mb-1">Enum values:</div>
                        <div className="space-y-1">
                          {f.enumValues?.map((value: string) => (
                            <div key={value} className="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                              {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded text-xs">
                      {f.isCustom && f.customFieldType === 'scalar' && '📊'}
                      {f.isCustom && f.customFieldType === 'existing_model' && '🏢'}
                      {f.isCustom && f.customFieldType === 'new_model' && '✨'}
                      {!f.isCustom && (f.type === 'text' ? '📝' : f.type === 'number' ? '🔢' : f.type === 'boolean' ? '✅' : f.type === 'date' ? '📅' : f.type === 'json' ? '🔧' : f.type === 'reference' ? '🔗' : '❓')}
                      {f.name}
                      {f.referencesModel && <span className="opacity-75">→{f.referencesModel}</span>}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {fieldSuggestions.suggestedModels?.length > 0 && (
          <div className="text-amber-800 dark:text-amber-200">
            <strong>⚠️ New models suggested:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {fieldSuggestions.suggestedModels.map((model: any) => (
                <details key={model.name} className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                  <summary className="cursor-pointer px-3 py-2 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-md">
                    ✨ {model.name} <span className="text-xs opacity-75">(click to view fields)</span>
                  </summary>
                  <div className="px-3 pb-3 pt-1 border-t border-amber-200 dark:border-amber-700 mt-2">
                    <p className="text-xs mb-2 text-amber-700 dark:text-amber-300">{model.description}</p>
                    <div className="space-y-1">
                      {model.fields?.map((field: any) => (
                        <div key={field.name} className="flex items-center gap-2 text-xs">
                          <span className="font-mono">{field.name}</span>
                          <span className="text-amber-600 dark:text-amber-400">
                            {field.type === 'text' ? '📝' : 
                             field.type === 'number' ? '🔢' : 
                             field.type === 'boolean' ? '✅' : 
                             field.type === 'date' ? '📅' : 
                             field.type === 'json' ? '🔧' : 
                             field.type === 'enum' ? '🏷️' : 
                             field.type === 'reference' ? '🔗' : '❓'} {field.type}
                          </span>
                          {field.enumValues && (
                            <span className="text-xs opacity-75">({field.enumValues.join(', ')})</span>
                          )}
                          {field.required && <span className="text-red-600">*</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
            <p className="text-xs opacity-75 mt-2">These models would need to be created separately.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
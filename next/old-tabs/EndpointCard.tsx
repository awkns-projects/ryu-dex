'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CopyIcon, ChevronDownIcon, ChevronRightIcon, CodeIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface EndpointCardProps {
  endpoint: {
    method: string;
    path: string;
    description: string;
    requestBody: any;
    responseSchema: string;
    example: {
      curl: string;
      javascript: string;
      python: string;
    };
  };
  baseUrl: string;
}

export function EndpointCard({ endpoint, baseUrl }: EndpointCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('curl');

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 border-green-200';
      case 'POST': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const fullUrl = `${baseUrl}${endpoint.path}`;

  return (
    <div className="border rounded-lg bg-muted/10">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Badge className={`${getMethodColor(endpoint.method)} font-mono text-xs`}>
              {endpoint.method}
            </Badge>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm truncate">{endpoint.path}</p>
              <p className="text-xs text-muted-foreground">{endpoint.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(fullUrl);
              }}
              className="h-8 w-8 p-0"
            >
              <CopyIcon className="h-3 w-3" />
            </Button>
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-4 border-t bg-muted/5">
            {/* Full URL */}
            <div className="pt-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">Full URL</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(fullUrl)}
                  className="h-6 w-6 p-0"
                >
                  <CopyIcon className="h-3 w-3" />
                </Button>
              </div>
              <p className="font-mono text-sm bg-background p-2 rounded border mt-1 break-all">
                {fullUrl}
              </p>
            </div>

            {/* Request Body Schema */}
            {endpoint.requestBody && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Request Body</Label>
                <pre className="text-xs bg-background p-2 rounded border mt-1 overflow-x-auto">
                  {JSON.stringify(endpoint.requestBody, null, 2)}
                </pre>
              </div>
            )}

            {/* Response Schema */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Response</Label>
              <p className="text-xs font-mono bg-background p-2 rounded border mt-1">
                {endpoint.responseSchema}
              </p>
            </div>

            {/* Code Examples */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Code Examples</Label>
              <Tabs value={activeCodeTab} onValueChange={setActiveCodeTab}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                  <TabsTrigger value="javascript" className="text-xs">JavaScript</TabsTrigger>
                  <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
                </TabsList>
                
                <TabsContent value="curl" className="mt-2">
                  <div className="relative">
                    <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                      <code>{endpoint.example.curl}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(endpoint.example.curl)}
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                    >
                      <CopyIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="javascript" className="mt-2">
                  <div className="relative">
                    <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                      <code>{endpoint.example.javascript}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(endpoint.example.javascript)}
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                    >
                      <CopyIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="python" className="mt-2">
                  <div className="relative">
                    <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                      <code>{endpoint.example.python}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(endpoint.example.python)}
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                    >
                      <CopyIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default EndpointCard; 
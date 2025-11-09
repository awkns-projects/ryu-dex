import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { AGENT_TEMPLATES, AgentTemplateData } from '../lib/agent-templates';
import { api, AuthenticationError } from '../lib/authenticated-fetch';

// Agent image sources from the public folder
export const AGENT_IMAGES = [
  '/images/agents/0.png',
  '/images/agents/1.png',
  '/images/agents/2.png',
  '/images/agents/3.png',
  '/images/agents/4.png',
  '/images/agents/5.png',
  '/images/agents/6.png',
  '/images/agents/7.png',
  '/images/agents/8.png',
  '/images/agents/9.png',
];

// Helper to get a random agent image
const getRandomAgentImage = () => {
  return AGENT_IMAGES[Math.floor(Math.random() * AGENT_IMAGES.length)];
};

export interface Agent {
  id: string;
  title: string; // Template title (e.g., "Customer Support Agent")
  name: string; // User's custom name (e.g., "My Support Bot")
  description: string;
  icon: string;
  image?: any; // Agent image/avatar (image source)
  templateId?: string; // Reference to template if created from template
  category?: string; // Template category
  // Full data cloned from template and stored in database
  models?: any[]; // Array of models with fields and forms
  actions?: any[]; // Array of actions with steps
  schedules?: any[]; // Array of schedules
}

export interface AgentTemplate {
  id: string;
  title: string; // Template title
  description: string;
  icon: string;
  image?: any; // Template preview image
  category: string;
}

// Convert detailed templates to simple UI templates
const UI_TEMPLATES: AgentTemplate[] = AGENT_TEMPLATES.map((template) => ({
  id: template.id,
  title: template.title,
  description: template.description || '',
  icon: template.icon,
  image: getRandomAgentImage(),
  category: template.category,
}));

// Note: User agents are now fetched from the database via API
// Users start with no agents and must create them from templates

interface AgentContextType {
  selectedAgent: Agent | null;
  selectAgent: (agent: Agent) => void;
  userAgents: Agent[];
  agentTemplates: AgentTemplate[];
  detailedTemplates: AgentTemplateData[];
  createAgentFromTemplate: (template: AgentTemplate, customName?: string) => Promise<Agent>;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  refreshAgents: () => Promise<Agent[]>;
  isLoading: boolean;
  isCreatingAgent: boolean;
  hasSelectedAgent: boolean;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  // Start with NO agent selected, so user must choose one after login
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  // Fetch user's agents from the API
  const refreshAgents = async (): Promise<Agent[]> => {
    setIsLoading(true);
    try {
      const data = await api.get<{ agents: any[]; count: number }>('/api/agent', {
        requireAuth: false, // Don't throw if not authenticated, just return empty
      });

      const agents = data.agents || [];

      // Map database agents to UI agents
      // Note: agents now come with full data (models, actions, schedules)
      const mappedAgents: Agent[] = agents.map((fullAgent: any) => {
        const dbAgent = fullAgent.agent || fullAgent; // Handle both full and basic formats

        return {
          id: dbAgent.id,
          title: dbAgent.title || dbAgent.name, // Template title
          name: dbAgent.name, // User's custom name
          description: dbAgent.description || '',
          icon: 'person.circle.fill', // Default icon, could be stored in DB
          image: getRandomAgentImage(),
          templateId: dbAgent.templateId, // Now stored in database
          category: 'Custom',
          // Store full data for detail screen
          models: fullAgent.models || [],
          actions: fullAgent.actions || [],
          schedules: fullAgent.schedules || [],
        };
      });

      setUserAgents(mappedAgents);
      console.log('✅ Fetched', mappedAgents.length, 'agents');
      return mappedAgents;
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
      // Don't throw - just keep empty array
      // This allows the app to continue working even if API is unavailable
      setUserAgents([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Don't auto-fetch on mount - let the selection screen call refreshAgents when it mounts
  // This avoids race conditions with authentication
  useEffect(() => {
    // Only fetch if we can detect we're in a browser environment
    if (typeof window !== 'undefined') {
      // Small delay to allow auth to initialize
      const timer = setTimeout(() => {
        refreshAgents();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const selectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const createAgentFromTemplate = async (template: AgentTemplate, customName?: string): Promise<Agent> => {
    setIsCreatingAgent(true);
    try {
      console.log('🎨 Creating agent from template:', template.id);

      // Use custom name if provided, otherwise use template title
      const agentName = customName || template.title;

      const data = await api.post<{
        success: boolean;
        agent: any;
        details: any
      }>('/api/agent/from-template', {
        templateId: template.id,
        title: template.title, // Template title
        name: agentName, // User's custom name
        description: template.description,
      });

      const dbAgent = data.agent;
      console.log('✅ Agent created:', dbAgent.id, data.details);

      // Refresh the agents list to get the full data from the server
      // This ensures the full agent data (with models, actions, schedules) is available
      const updatedAgents = await refreshAgents();

      // Find the newly created agent in the refreshed list
      const refreshedAgent = updatedAgents.find(a => a.id === dbAgent.id);

      if (refreshedAgent) {
        // Add UI-specific fields
        refreshedAgent.icon = template.icon;
        refreshedAgent.image = template.image || getRandomAgentImage();
        refreshedAgent.category = template.category;

        console.log('🔄 Returning agent after refresh:', refreshedAgent.id);
        console.log('📊 Agent has:', refreshedAgent.models?.length, 'models,', refreshedAgent.actions?.length, 'actions');
        return refreshedAgent;
      }

      // Fallback: create a basic agent if refresh failed
      const fallbackAgent: Agent = {
        id: dbAgent.id,
        title: dbAgent.title || template.title,
        name: dbAgent.name || agentName,
        description: dbAgent.description || '',
        icon: template.icon,
        image: template.image || getRandomAgentImage(),
        templateId: template.id,
        category: template.category,
        models: [],
        actions: [],
        schedules: [],
      };

      console.log('⚠️ Using fallback agent (refresh failed)');
      return fallbackAgent;
    } catch (error) {
      console.error('❌ Error creating agent from template:', error);

      // Provide user-friendly error message
      if (error instanceof AuthenticationError) {
        throw new Error('Please log in to create an agent');
      }

      throw error;
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const updateAgent = (agentId: string, updates: Partial<Agent>) => {
    setUserAgents(userAgents.map(agent =>
      agent.id === agentId ? { ...agent, ...updates } : agent
    ));

    // Update selected agent if it's the one being updated
    if (selectedAgent?.id === agentId) {
      setSelectedAgent({ ...selectedAgent, ...updates });
    }
  };

  return (
    <AgentContext.Provider
      value={{
        selectedAgent,
        selectAgent,
        userAgents,
        agentTemplates: UI_TEMPLATES,
        detailedTemplates: AGENT_TEMPLATES,
        createAgentFromTemplate,
        updateAgent,
        refreshAgents,
        isLoading,
        isCreatingAgent,
        hasSelectedAgent: selectedAgent !== null,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}



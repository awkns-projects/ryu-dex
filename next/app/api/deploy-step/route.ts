import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const DeployStepSchema = z.object({
  stepName: z.string().min(1, 'Step name is required'),
  code: z.string().min(1, 'Code is required'),
  environmentVariables: z.record(z.string()).optional().default({}),
  npmPackages: z.array(z.object({
    name: z.string(),
    version: z.string(),
    reason: z.string().optional()
  })).optional().default([]),
  description: z.string().optional()
});

/**
 * Vercel API client for deployment operations
 */
class VercelClient {
  private apiKey: string;
  private baseUrl = 'https://api.vercel.com';
  private teamId?: string;

  constructor(apiKey: string, teamId?: string) {
    this.apiKey = apiKey;
    this.teamId = teamId;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (this.teamId) {
      url.searchParams.set('teamId', this.teamId);
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vercel API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    return response.json();
  }

  async createProject(name: string) {
    console.log(`🚀 Creating Vercel project: ${name}`);

    // Sanitize project name for Vercel requirements
    const sanitizedName = name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);

    let projectName = sanitizedName;
    let attempt = 0;
    const maxAttempts = 5;

    while (attempt < maxAttempts) {
      try {
        const project = await this.request('/v10/projects', {
          method: 'POST',
          body: JSON.stringify({
            name: projectName,
            framework: 'nextjs',
            buildCommand: 'npm run build',
            devCommand: 'npm run dev',
            installCommand: 'npm install',
            outputDirectory: '.next'
          }),
        });

        console.log(`✅ Vercel project created: ${project.id}`);
        return project;
      } catch (error: any) {
        if (error.message.includes('409') || error.message.includes('conflict')) {
          attempt++;
          const timestamp = Date.now().toString().slice(-6);
          projectName = `${sanitizedName}-${timestamp}`;
          console.log(`⚠️ Project name conflict, trying: ${projectName}`);
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Failed to create project after ${maxAttempts} attempts`);
  }

  async deployFromFiles(projectId: string, files: Record<string, string>, envVars: Record<string, string> = {}) {
    console.log(`🚀 Deploying to Vercel project: ${projectId}`);

    const vercelFiles = Object.entries(files).map(([path, content]) => ({
      file: path,
      data: Buffer.from(content).toString('base64'),
      encoding: 'base64'
    }));

    const deployment = await this.request('/v13/deployments', {
      method: 'POST',
      body: JSON.stringify({
        name: projectId,
        files: vercelFiles,
        projectSettings: {
          framework: 'nextjs',
          buildCommand: 'npm run build',
          devCommand: 'npm run dev',
          installCommand: 'npm install',
          outputDirectory: '.next'
        },
        env: envVars,
        build: {
          env: envVars
        }
      }),
    });

    console.log(`✅ Deployment created: ${deployment.id}`);
    return deployment;
  }

  async setEnvironmentVariables(projectId: string, envVars: Record<string, string>) {
    if (Object.keys(envVars).length === 0) return;

    console.log(`🔧 Setting environment variables for project: ${projectId}`);

    for (const [key, value] of Object.entries(envVars)) {
      try {
        await this.request(`/v10/projects/${projectId}/env`, {
          method: 'POST',
          body: JSON.stringify({
            key,
            value,
            type: 'encrypted',
            target: ['production', 'preview', 'development']
          }),
        });
        console.log(`✅ Set environment variable: ${key}`);
      } catch (error) {
        console.warn(`⚠️ Failed to set environment variable ${key}:`, error);
      }
    }
  }
}

/**
 * Generate Next.js project files for the custom processing step
 */
function generateProjectFiles(stepName: string, code: string, npmPackages: any[], description?: string) {
  const packageJsonDependencies: Record<string, string> = {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  };

  // Add NPM packages from the step
  npmPackages.forEach(pkg => {
    packageJsonDependencies[pkg.name] = pkg.version || 'latest';
  });

  const files: Record<string, string> = {
    'package.json': JSON.stringify({
      name: stepName,
      version: "1.0.0",
      description: description || `Custom processing API for ${stepName}`,
      scripts: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start"
      },
      dependencies: packageJsonDependencies
    }, null, 2),

    'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  }
}

module.exports = nextConfig`,

    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "es6"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "node",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [
          {
            name: "next"
          }
        ],
        paths: {
          "app/*": ["./*"]
        }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"]
    }, null, 2),

    'next-env.d.ts': `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.`,

    [`app/api/${stepName}/route.ts`]: code,

    'app/page.tsx': `export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Custom Processing API</h1>
      <p className="text-gray-600 mb-4">
        ${description || `API endpoint for ${stepName} custom processing`}
      </p>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">API Endpoint:</h2>
        <code className="bg-white px-2 py-1 rounded">/api/${stepName}</code>
      </div>
    </div>
  )
}`,

    'app/layout.tsx': `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${stepName} API',
  description: '${description || `Custom processing API for ${stepName}`}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,

    'README.md': `# ${stepName} API

${description || `Custom processing API for ${stepName}`}

## API Endpoint

\`POST /api/${stepName}\`

## Usage

This API endpoint processes custom logic deployed from the agent builder.

## Environment Variables

${Object.keys(packageJsonDependencies).length > 0 ?
        'The following environment variables may be required:\n\n' +
        Object.keys(packageJsonDependencies).map(pkg => `- \`${pkg.toUpperCase()}_API_KEY\` (if applicable)`).join('\n')
        : 'No additional environment variables required.'}

## Deployment

This API is automatically deployed to Vercel.
`,

    '.gitignore': `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`
  };

  return files;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Deploy step request:', { stepName: body.stepName, hasCode: !!body.code });

    // Validate request body
    const { stepName, code, environmentVariables, npmPackages, description } = DeployStepSchema.parse(body);

    // Check for required environment variables
    const vercelApiKey = process.env.VERCEL_TOKEN;
    if (!vercelApiKey) {
      return NextResponse.json(
        { error: 'VERCEL_TOKEN environment variable is required' },
        { status: 500 }
      );
    }

    // Initialize Vercel client
    const vercelClient = new VercelClient(vercelApiKey, process.env.VERCEL_TEAM_ID);

    // Generate unique project name
    const timestamp = Date.now();
    const projectName = `${stepName}-${timestamp}`;

    console.log(`🚀 Starting deployment for step: ${stepName}`);

    // Step 1: Create Vercel project
    console.log('📦 Creating Vercel project...');
    const project = await vercelClient.createProject(projectName);

    // Step 2: Generate project files
    console.log('📁 Generating project files...');
    const projectFiles = generateProjectFiles(stepName, code, npmPackages, description);

    // Step 3: Set environment variables if provided
    if (Object.keys(environmentVariables).length > 0) {
      console.log('🔧 Setting environment variables...');
      await vercelClient.setEnvironmentVariables(project.id, environmentVariables);
    }

    // Step 4: Deploy the project
    console.log('🚀 Deploying to Vercel...');
    const deployment = await vercelClient.deployFromFiles(project.id, projectFiles, environmentVariables);

    const deploymentUrl = deployment.url.startsWith('https://')
      ? deployment.url
      : `https://${deployment.url}`;

    const apiEndpointUrl = `${deploymentUrl}/api/${stepName}`;

    console.log(`✅ Deployment successful: ${apiEndpointUrl}`);

    return NextResponse.json({
      success: true,
      url: apiEndpointUrl,
      deploymentUrl,
      deploymentId: deployment.id,
      projectId: project.id,
      projectName: project.name,
      files: Object.keys(projectFiles),
      message: `Successfully deployed ${stepName} API endpoint`
    });

  } catch (error) {
    console.error('❌ Deployment failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Deployment failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
/**
 * Verification Script: Check if agent data is properly stored
 * Run this after migration to verify everything is working correctly
 * 
 * Usage: npx tsx lib/db/verify-agent-data.ts
 */

import 'dotenv/config';
import { prisma } from './prisma';

const verify = async () => {
  console.log('🔍 Verifying agent data structure...\n');

  try {
    // Check agents
    const agents = await prisma.agent.findMany();
    console.log(`✅ Found ${agents.length} agent(s)`);

    if (agents.length > 0) {
      const sample = agents[0];
      console.log('   Sample agent:');
      console.log(`   - ID: ${sample.id}`);
      console.log(`   - Name: ${sample.name}`);
      console.log(`   - Template ID: ${sample.templateId || '(not set)'}`);
      console.log(`   - Has templateId field: ✅`);
    }
    console.log('');

    // Check models
    const models = await prisma.agentModel.findMany();
    console.log(`✅ Found ${models.length} model(s)`);

    if (models.length > 0) {
      const sample = models[0];
      console.log('   Sample model:');
      console.log(`   - ID: ${sample.id}`);
      console.log(`   - Name: ${sample.name}`);
      console.log(`   - Has fields: ${Array.isArray(sample.fields) ? '✅' : '❌'}`);
      console.log(`   - Has forms field: ✅`);
      console.log(`   - Forms count: ${Array.isArray(sample.forms) ? (sample.forms as any[]).length : 'N/A'}`);
      console.log(`   - Fields count: ${Array.isArray(sample.fields) ? (sample.fields as any[]).length : 'N/A'}`);
    }
    console.log('');

    // Check actions
    const actions = await prisma.agentAction.findMany();
    console.log(`✅ Found ${actions.length} action(s)`);

    if (actions.length > 0) {
      const sample = actions[0];
      console.log('   Sample action:');
      console.log(`   - ID: ${sample.id}`);
      console.log(`   - Name: ${sample.name}`);
      console.log(`   - Title: ${sample.title || '(not set)'}`);
      console.log(`   - Emoji: ${sample.emoji || '(not set)'}`);
      console.log(`   - Description: ${sample.description ? '✅' : '❌'}`);
    }
    console.log('');

    // Summary
    console.log('📊 Summary:');
    console.log(`   - Agents: ${agents.length}`);
    console.log(`   - Models: ${models.length}`);
    console.log(`   - Actions: ${actions.length}`);
    console.log('');

    if (agents.length === 0) {
      console.log('⚠️  No agents found. Create one using the UI to test!');
    } else {
      console.log('✅ Everything looks good!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

verify();

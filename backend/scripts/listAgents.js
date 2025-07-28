#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

console.log('🔍 Listing Your ElevenLabs Agents\n');

if (!process.env.ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY is not set in your .env file');
  process.exit(1);
}

async function listAgents() {
  try {
    console.log('📡 Fetching your ElevenLabs agents...\n');
    
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.agents && data.agents.length > 0) {
      console.log(`✅ Found ${data.agents.length} agent(s) in your account:\n`);
      
      data.agents.forEach((agent, index) => {
        console.log(`${index + 1}. 📋 Agent Name: "${agent.name}"`);
        console.log(`   🆔 Agent ID: ${agent.agent_id}`);
        console.log(`   📝 Description: ${agent.description || 'No description'}`);
        console.log(`   🔄 Status: ${agent.status || 'Unknown'}`);
        console.log('');
      });
      
      // Show which one to use
      const firstAgent = data.agents[0];
      console.log('🔧 To use the first agent, update your backend/.env file:');
      console.log(`ELEVENLABS_AGENT_ID=${firstAgent.agent_id}`);
      
    } else {
      console.log('❌ No agents found in your account.');
      console.log('\n💡 You need to create a Conversational AI agent first:');
      console.log('1. Go to https://elevenlabs.io');
      console.log('2. Navigate to Conversational AI > Agents');
      console.log('3. Click "Create New Agent"');
      console.log('4. Configure and save your agent');
      console.log('5. Copy the Agent ID and update your .env file');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Your API key might be invalid or expired.');
      console.log('Check your API key at: https://elevenlabs.io/app/settings/api-keys');
    }
  }
}

listAgents(); 
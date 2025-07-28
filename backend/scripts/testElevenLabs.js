#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

console.log('🧪 ElevenLabs API Connection Test\n');

// Check environment variables
console.log('🔧 Environment Check:');
console.log(`API Key: ${process.env.ELEVENLABS_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`Agent ID: ${process.env.ELEVENLABS_AGENT_ID || 'Not set in .env'}\n`);

if (!process.env.ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY is not set in your .env file');
  console.log('Please add: ELEVENLABS_API_KEY=your_api_key_here');
  process.exit(1);
}

async function testElevenLabsAPI() {
  try {
    console.log('📡 Testing basic API connectivity...');
    
    // Test 1: Get user info (basic API test)
    const userResponse = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`User API failed: ${userResponse.status} - ${errorText}`);
    }

    const userData = await userResponse.json();
    console.log(`✅ API Connection successful! User: ${userData.email || 'Unknown'}`);
    
    // Test 2: List available agents
    console.log('\n📋 Fetching available agents...');
    const agentsResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    });

    if (!agentsResponse.ok) {
      const errorText = await agentsResponse.text();
      throw new Error(`Agents API failed: ${agentsResponse.status} - ${errorText}`);
    }

    const agentsData = await agentsResponse.json();
    console.log(`✅ Found ${agentsData.agents?.length || 0} agents`);
    
    if (agentsData.agents && agentsData.agents.length > 0) {
      console.log('\n📝 Available agents:');
      agentsData.agents.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.name} (ID: ${agent.agent_id})`);
      });
      
      // Test 3: Test signed URL generation with the first agent
      const testAgentId = process.env.ELEVENLABS_AGENT_ID || agentsData.agents[0].agent_id;
      console.log(`\n🔗 Testing signed URL generation with agent: ${testAgentId}`);
      
      const signedUrlResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${testAgentId}`,
        {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
        }
      );

      if (!signedUrlResponse.ok) {
        const errorText = await signedUrlResponse.text();
        console.error(`❌ Signed URL failed: ${signedUrlResponse.status} - ${errorText}`);
        
        if (signedUrlResponse.status === 404) {
          console.log('\n💡 Troubleshooting tips:');
          console.log('- Make sure the agent ID exists and is spelled correctly');
          console.log('- Verify the agent is in "Published" state');
          console.log('- Check that your ElevenLabs account has Conversational AI access');
        }
      } else {
        const signedUrlData = await signedUrlResponse.json();
        console.log('✅ Signed URL generated successfully!');
        console.log(`🔗 URL starts with: ${signedUrlData.signed_url.substring(0, 50)}...`);
      }
    } else {
      console.log('❌ No agents found. Please create a Conversational AI agent first.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('fetch is not defined')) {
      console.log('\n💡 Note: This script requires Node.js 18+ for fetch support');
    } else if (error.message.includes('401')) {
      console.log('\n💡 Tip: Check your API key is correct and active');
    }
  }
}

// Run the test
testElevenLabsAPI()
  .then(() => {
    console.log('\n🏁 Test completed');
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }); 
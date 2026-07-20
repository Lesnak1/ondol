

import fs from 'fs';

let DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/VITE_DEEPSEEK_API_KEY=(.*)/);
  if (match) {
    DEEPSEEK_API_KEY = match[1].trim();
  }
}

const EXPLORER_BASE = 'https://sepolia-explorer.giwa.io/api/v2';
const TEST_CONTRACT = '0xfe4b4F5f2f8843dC9Ca75E563f2f7eB0f44Ae83e'; // Verified token faucet

async function testGiwaExplorer() {
  console.log('🔍 Testing GIWA Sepolia Explorer API...');
  
  // 1. Test Stats
  try {
    const res = await fetch(`${EXPLORER_BASE}/stats`);
    if (!res.ok) throw new Error(`Stats status error: ${res.status}`);
    const data = await res.json();
    console.log('✅ Stats endpoint OK.');
    console.log(`   - Gas Price (Average): ${data.gas_prices?.average || 'N/A'} Gwei`);
    console.log(`   - Active Wallets: ${parseInt(data.total_addresses || 0).toLocaleString()}`);
    console.log(`   - Total Blocks: ${parseInt(data.total_blocks || 0).toLocaleString()}`);
  } catch (err) {
    console.error('❌ Stats endpoint failed:', err.message);
  }

  // 2. Test Blocks
  try {
    const res = await fetch(`${EXPLORER_BASE}/blocks`);
    if (!res.ok) throw new Error(`Blocks status error: ${res.status}`);
    const data = await res.json();
    console.log('✅ Blocks endpoint OK.');
    console.log(`   - Latest Block height: #${data.items?.[0]?.height}`);
  } catch (err) {
    console.error('❌ Blocks endpoint failed:', err.message);
  }

  // 3. Test Verified Contract Fetching
  try {
    const res = await fetch(`${EXPLORER_BASE}/smart-contracts/${TEST_CONTRACT}`);
    if (!res.ok) throw new Error(`Smart contract status error: ${res.status}`);
    const data = await res.json();
    console.log('✅ Verified Contract Fetcher OK.');
    console.log(`   - Contract Name: ${data.name}`);
    console.log(`   - Compiler version: ${data.compiler_version}`);
    console.log(`   - ABI functions count: ${data.abi?.filter(x => x.type === 'function').length}`);
    console.log(`   - Source Code character length: ${data.source_code?.length || 0}`);
  } catch (err) {
    console.error('❌ Verified Contract Fetcher failed:', err.message);
  }
}

async function testDeepSeekAPI() {
  console.log('\n🤖 Testing DeepSeek API Connection with deepseek-v4-flash...');
  
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: 'You are a testing assistant. Respond with: OK.' },
          { role: 'user', content: 'hello' }
        ],
        max_tokens: 5
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Status ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    console.log('✅ DeepSeek Connection OK.');
    console.log(`   - AI Response: "${data.choices?.[0]?.message?.content?.trim()}"`);
    console.log(`   - Model used: ${data.model}`);
  } catch (err) {
    console.error('❌ DeepSeek connection failed:', err.message);
  }
}

async function runAll() {
  console.log('=== GIWALENS INTEGRATION SUITE ===\n');
  await testGiwaExplorer();
  await testDeepSeekAPI();
  console.log('\n=== DIAGNOSTICS COMPLETE ===');
}

runAll();

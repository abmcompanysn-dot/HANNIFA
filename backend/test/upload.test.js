/**
 * Script de test pour vérifier que le service fonctionne
 * 
 * Usage: node test/upload.test.js
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001/api';
const ADMIN_KEY = 'hanis-demo-key-2026-change-me';

// Créer une image test (1x1 pixel JPEG)
const createTestImage = () => {
  return Buffer.from(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a' +
    'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy' +
    'MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIA' +
    'AhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQ' +
    'AAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA=',
    'base64'
  );
};

const testUpload = async (endpoint, formData, headers = {}) => {
  try {
    console.log(`\n🧪 Testing ${endpoint}...`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Success: ${endpoint}`);
      console.log(`   URL: ${data.data.url}`);
      return true;
    } else {
      console.log(`❌ Failed: ${endpoint}`);
      console.log(`   Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${endpoint}`);
    console.log(`   ${error.message}`);
    return false;
  }
};

const runTests = async () => {
  console.log('🚀 Starting HANI\'S Storage Service Tests\n');
  console.log('='.repeat(50));

  const imageBuffer = createTestImage();
  let passed = 0;
  let total = 0;

  // Test 1: Upload produit (admin)
  total++;
  const form1 = new FormData();
  form1.append('file', imageBuffer, { filename: 'test-product.jpg', contentType: 'image/jpeg' });
  form1.append('productId', 'test-123');
  form1.append('variant', 'main');
  
  if (await testUpload('/upload/product-image', form1, { 'x-admin-api-key': ADMIN_KEY })) {
    passed++;
  }

  // Test 2: Upload tissu (client)
  total++;
  const form2 = new FormData();
  form2.append('file', imageBuffer, { filename: 'test-fabric.jpg', contentType: 'image/jpeg' });
  form2.append('orderId', 'order-456');
  form2.append('notes', 'Tissu en soie');
  
  if (await testUpload('/upload/fabric', form2)) {
    passed++;
  }

  // Test 3: Upload galerie (admin)
  total++;
  const form3 = new FormData();
  form3.append('file', imageBuffer, { filename: 'test-gallery.jpg', contentType: 'image/jpeg' });
  form3.append('title', 'Robe Awa terracotta');
  form3.append('category', 'Femme');
  form3.append('description', 'Création sur mesure');
  
  if (await testUpload('/upload/gallery', form3, { 'x-admin-api-key': ADMIN_KEY })) {
    passed++;
  }

  // Test 4: Upload avis (client)
  total++;
  const form4 = new FormData();
  form4.append('file', imageBuffer, { filename: 'test-review.jpg', contentType: 'image/jpeg' });
  form4.append('reviewId', 'review-789');
  form4.append('productId', 'product-123');
  
  if (await testUpload('/upload/review-photo', form4)) {
    passed++;
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('\n✅ All tests passed! Service is working correctly.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Check the logs above.\n');
    process.exit(1);
  }
};

// Vérifier que le serveur est démarré
const checkServer = async () => {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    if (response.ok) {
      console.log('✅ Server is running\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start it first:');
    console.log('   npm run dev\n');
    return false;
  }
};

// Exécuter les tests
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  } else {
    process.exit(1);
  }
})();

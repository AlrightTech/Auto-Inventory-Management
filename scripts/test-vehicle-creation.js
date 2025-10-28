// Test script to check database connection and vehicle creation
// Run this in your browser console or as a test API endpoint

async function testVehicleCreation() {
  try {
    console.log('Testing vehicle creation...');
    
    const testData = {
      make: 'Test Make',
      model: 'Test Model',
      year: 2023,
      vin: 'TEST1234567890123',
      status: 'Pending',
      title_status: 'Absent'
    };
    
    console.log('Sending test data:', testData);
    
    const response = await fetch('/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const result = await response.json();
    console.log('Response data:', result);
    
    if (response.ok) {
      console.log('✅ Vehicle creation test passed!');
      return result;
    } else {
      console.error('❌ Vehicle creation test failed:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    return null;
  }
}

// Run the test
testVehicleCreation();

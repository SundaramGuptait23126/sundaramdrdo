const http = require('http');

async function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(JSON.stringify(postData));
        }
        req.end();
    });
}

async function runTests() {
    console.log("--- Starting A to Z Backend Tests ---");
    const uniqueEmail = `testuser_${Date.now()}@test.com`;
    let token = '';

    // 1. Test Register
    console.log(`\n1. Testing Register API with ${uniqueEmail}...`);
    const registerRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { name: 'Test User', email: uniqueEmail, password: 'password123', role: 'buyer' });
    console.log("Status:", registerRes.status);
    console.log("Response:", registerRes.data);
    if (!registerRes.data.success) {
        console.error("❌ Register Failed!");
        return;
    }
    console.log("✅ Register Successful!");

    // 2. Test Login
    console.log(`\n2. Testing Login API with ${uniqueEmail}...`);
    const loginRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: uniqueEmail, password: 'password123' });
    console.log("Status:", loginRes.status);
    console.log("Response:", loginRes.data);
    if (!loginRes.data.success || !loginRes.data.token) {
        console.error("❌ Login Failed!");
        return;
    }
    token = loginRes.data.token;
    console.log("✅ Login Successful! Got JWT Token.");

    // 3. Test Add Property
    console.log(`\n3. Testing Add Property API (Requires Auth)...`);
    const propertyRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/properties/add',
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }, {
        title: "Test Property A to Z",
        description: "A wonderful test property",
        price: 5000000,
        location: "Mumbai",
        bhk: 2,
        property_type: "flat",
        status: "available"
    });
    console.log("Status:", propertyRes.status);
    console.log("Response:", propertyRes.data);
    if (!propertyRes.data.success) {
        console.error("❌ Add Property Failed!");
        return;
    }
    console.log("✅ Add Property Successful!");

    // 4. Test Get All Properties
    console.log(`\n4. Testing Get All Properties API...`);
    const getPropertiesRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/properties/all',
        method: 'GET'
    });
    console.log("Status:", getPropertiesRes.status);
    console.log("Response:", getPropertiesRes.data.properties ? `${getPropertiesRes.data.properties.length} properties fetched.` : getPropertiesRes.data);
    if (!getPropertiesRes.data.success) {
        console.error("❌ Get Properties Failed!");
        return;
    }
    console.log("✅ Get Properties Successful!");
    
    console.log("\n--- All Backend Tests Passed Successfully! ---");
}

runTests().catch(console.error);

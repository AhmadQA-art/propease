// Authentication Test Script
const authTestScript = `
pm.test("Sign in successful", function () {
    pm.response.to.have.status(200);
    
    const responseData = pm.response.json();
    
    // Extract and set token
    if (responseData.token) {
        pm.environment.set("bearerToken", responseData.token);
        console.log("Access token set successfully");
    }
    
    // Extract and set user data
    if (responseData.user) {
        pm.environment.set("userId", responseData.user.id);
        pm.environment.set("userEmail", responseData.user.email);
        if (responseData.user.organization_id) {
            pm.environment.set("organizationId", responseData.user.organization_id);
        }
        console.log("User data set successfully");
    }
});
`;

// Property Creation Test Script
const createPropertyTestScript = `
pm.test("Property created successfully", () => {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    
    // Save property ID for other tests
    pm.environment.set("propertyId", response.id);
    
    // Verify required fields
    pm.expect(response).to.have.property('title');
    pm.expect(response).to.have.property('description');
    pm.expect(response).to.have.property('address');
    pm.expect(response).to.have.property('price');
    pm.expect(response).to.have.property('bedrooms');
    pm.expect(response).to.have.property('bathrooms');
    pm.expect(response).to.have.property('square_feet');
    pm.expect(response).to.have.property('organization_id');
    pm.expect(response.organization_id).to.eql(pm.environment.get("organizationId"));
});
`;

// Get Properties Test Script
const getPropertiesTestScript = `
pm.test("Properties retrieved successfully", () => {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    // Verify it's an array
    pm.expect(response).to.be.an('array');
    
    // If properties exist, verify their structure
    if (response.length > 0) {
        pm.expect(response[0]).to.have.property('id');
        pm.expect(response[0]).to.have.property('title');
        pm.expect(response[0]).to.have.property('organization_id');
    }
});
`;

// Get Property by ID Test Script
const getPropertyByIdTestScript = `
pm.test("Property retrieved successfully", () => {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    // Verify it matches the created property
    pm.expect(response.id).to.eql(pm.environment.get("propertyId"));
    pm.expect(response.organization_id).to.eql(pm.environment.get("organizationId"));
});
`;

// Mark Property as Rented Test Script
const markPropertyAsRentedTestScript = `
pm.test("Property marked as rented", () => {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    pm.expect(response.id).to.eql(pm.environment.get("propertyId"));
    pm.expect(response.status).to.eql('rented');
});
`;

// Schedule Maintenance Test Script
const scheduleMaintenanceTestScript = `
pm.test("Maintenance scheduled successfully", () => {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    pm.expect(response.id).to.eql(pm.environment.get("propertyId"));
    pm.expect(response.status).to.eql('maintenance');
});
`;

// Pre-request Script for Authentication
const authPreRequestScript = `
if (!pm.environment.get("accessToken")) {
    console.warn("No access token found in environment. Please run the authentication request first.");
}
`;

module.exports = {
    authTestScript,
    createPropertyTestScript,
    getPropertiesTestScript,
    getPropertyByIdTestScript,
    markPropertyAsRentedTestScript,
    scheduleMaintenanceTestScript,
    authPreRequestScript
}; 
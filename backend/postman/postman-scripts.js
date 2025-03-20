/**
 * PropEase API - Postman Test Scripts
 * 
 * This file contains test scripts that can be copied into Postman requests
 * to automatically set environment variables and perform other automated tasks.
 */

/**
 * Sign In - Test Script
 * 
 * Copy this script into the "Tests" tab of your Sign In request in Postman.
 * It will automatically:
 * 1. Extract the access token from the response
 * 2. Set the accessToken environment variable
 * 3. Extract the organization_id from the user object
 * 4. Set the organizationId environment variable
 * 5. Extract the user ID
 * 6. Set the userId environment variable
 */
const signInTestScript = `
pm.test("Sign in successful", function () {
    pm.response.to.have.status(200);
    
    const responseData = pm.response.json();
    
    // Extract and set token
    if (responseData.token) {
        pm.environment.set("accessToken", responseData.token);
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

/**
 * Get Current User - Test Script
 * 
 * Copy this script into the "Tests" tab of your Get Current User request in Postman.
 * It will automatically update the environment variables with the latest user information.
 */
const getCurrentUserTestScript = `
pm.test("Get current user successful", function () {
    pm.response.to.have.status(200);
    
    const userData = pm.response.json();
    
    // Update user-related environment variables
    pm.environment.set("userId", userData.id);
    pm.environment.set("userEmail", userData.email);
    if (userData.organization_id) {
        pm.environment.set("organizationId", userData.organization_id);
    }
    
    console.log("User data updated successfully");
});
`;

/**
 * Sign Out - Test Script
 * 
 * Copy this script into the "Tests" tab of your Sign Out request in Postman.
 * It will automatically clear the environment variables related to authentication.
 */
const signOutTestScript = `
pm.test("Sign out successful", function () {
    pm.response.to.have.status(200);
    
    // Clear authentication-related environment variables
    pm.environment.unset("accessToken");
    pm.environment.unset("userId");
    pm.environment.unset("userEmail");
    pm.environment.unset("organizationId");
    
    console.log("Authentication data cleared successfully");
});
`;

/**
 * Create Entity - Test Script
 * 
 * Copy this script into the "Tests" tab of your Create Entity requests in Postman.
 * It will automatically extract and store the created entity's ID.
 * 
 * Usage: Replace "entityType" with your entity type (e.g., "tenant", "property", etc.)
 */
const createEntityTestScript = `
pm.test("Create entity successful", function () {
    pm.response.to.have.status(201);
    
    const entityData = pm.response.json();
    
    // Store the entity ID for future requests
    if (entityData.id) {
        // Replace 'entityType' with actual type (e.g., 'property', 'owner', etc.)
        pm.environment.set(pm.variables.get("entityType") + "Id", entityData.id);
        console.log(pm.variables.get("entityType") + " ID stored successfully");
    }
});
`;

/**
 * Pre-request Script for Authentication
 * 
 * Copy this script into the "Pre-request Script" tab of your authenticated requests in Postman.
 * It will automatically check if the access token is set and warn if it's missing.
 */
const authPreRequestScript = `
if (!pm.environment.get("accessToken")) {
    console.warn("No access token found in environment variables!");
}

// Add authorization header
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get("accessToken")
});
`;

// Error Response Test Script
const errorResponseTestScript = `
pm.test("Error response structure is valid", function () {
    pm.response.to.have.status(pm.variables.get("expectedErrorCode"));
    
    const errorResponse = pm.response.json();
    pm.expect(errorResponse).to.have.property("error");
    pm.expect(errorResponse.error).to.be.a("string");
});
`;

// Validation Test Script
const validationTestScript = `
pm.test("Response matches schema", function () {
    const schema = pm.variables.get("responseSchema");
    pm.response.to.have.jsonSchema(schema);
});
`;

// Export the scripts for reference
module.exports = {
    signInTestScript,
    getCurrentUserTestScript,
    signOutTestScript,
    createEntityTestScript,
    authPreRequestScript,
    errorResponseTestScript,
    validationTestScript
}; 
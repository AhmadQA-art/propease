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
// Parse the response
const response = pm.response.json();

// Check if the response was successful
if (pm.response.code === 200 && response.token) {
    // Set the access token in the environment
    pm.environment.set("accessToken", response.token);
    console.log("Access token set in environment");
    
    // Set user ID if available
    if (response.user && response.user.id) {
        pm.environment.set("userId", response.user.id);
        console.log("User ID set in environment: " + response.user.id);
    }
    
    // Set organization ID if available
    if (response.user && response.user.organization_id) {
        pm.environment.set("organizationId", response.user.organization_id);
        console.log("Organization ID set in environment: " + response.user.organization_id);
    }
    
    // Set user's name if available
    if (response.user && response.user.first_name && response.user.last_name) {
        const fullName = response.user.first_name + " " + response.user.last_name;
        pm.environment.set("userName", fullName);
        console.log("User name set in environment: " + fullName);
    }
    
    // Set user's email if available
    if (response.user && response.user.email) {
        pm.environment.set("userEmail", response.user.email);
        console.log("User email set in environment: " + response.user.email);
    }
    
    // Set user's role if available
    if (response.user && response.user.role) {
        pm.environment.set("userRole", response.user.role);
        console.log("User role set in environment: " + response.user.role);
    }
    
    // Test assertions
    pm.test("Status code is 200", function () {
        pm.response.to.have.status(200);
    });
    
    pm.test("Response has valid token", function () {
        pm.expect(response.token).to.be.a('string').and.to.not.be.empty;
    });
    
    pm.test("Response has user object", function () {
        pm.expect(response.user).to.be.an('object');
    });
} else {
    console.log("Authentication failed or response format unexpected");
    
    pm.test("Authentication failed", function () {
        pm.expect.fail("Authentication failed: " + JSON.stringify(response));
    });
}
`;

/**
 * Get Current User - Test Script
 * 
 * Copy this script into the "Tests" tab of your Get Current User request in Postman.
 * It will automatically update the environment variables with the latest user information.
 */
const getCurrentUserTestScript = `
// Parse the response
const response = pm.response.json();

// Check if the response was successful
if (pm.response.code === 200 && response) {
    // Set user ID if available
    if (response.id) {
        pm.environment.set("userId", response.id);
        console.log("User ID set in environment: " + response.id);
    }
    
    // Set organization ID if available
    if (response.organization_id) {
        pm.environment.set("organizationId", response.organization_id);
        console.log("Organization ID set in environment: " + response.organization_id);
    }
    
    // Set user's name if available
    if (response.first_name && response.last_name) {
        const fullName = response.first_name + " " + response.last_name;
        pm.environment.set("userName", fullName);
        console.log("User name set in environment: " + fullName);
    }
    
    // Set user's email if available
    if (response.email) {
        pm.environment.set("userEmail", response.email);
        console.log("User email set in environment: " + response.email);
    }
    
    // Set user's role if available
    if (response.role) {
        pm.environment.set("userRole", response.role);
        console.log("User role set in environment: " + response.role);
    }
    
    // Test assertions
    pm.test("Status code is 200", function () {
        pm.response.to.have.status(200);
    });
    
    pm.test("Response has user ID", function () {
        pm.expect(response.id).to.be.a('string').and.to.not.be.empty;
    });
} else {
    console.log("Failed to get user information or response format unexpected");
    
    pm.test("Get user information failed", function () {
        pm.expect.fail("Failed to get user information: " + JSON.stringify(response));
    });
}
`;

/**
 * Sign Out - Test Script
 * 
 * Copy this script into the "Tests" tab of your Sign Out request in Postman.
 * It will automatically clear the environment variables related to authentication.
 */
const signOutTestScript = `
// Check if the response was successful
if (pm.response.code === 200) {
    // Clear authentication-related environment variables
    pm.environment.unset("accessToken");
    pm.environment.unset("userId");
    pm.environment.unset("organizationId");
    pm.environment.unset("userName");
    pm.environment.unset("userEmail");
    pm.environment.unset("userRole");
    
    console.log("Authentication variables cleared from environment");
    
    // Test assertions
    pm.test("Status code is 200", function () {
        pm.response.to.have.status(200);
    });
    
    pm.test("Sign out successful", function () {
        const response = pm.response.json();
        pm.expect(response.message).to.include("Signed out successfully");
    });
} else {
    console.log("Sign out failed");
    
    pm.test("Sign out failed", function () {
        pm.expect.fail("Sign out failed: " + pm.response.text());
    });
}
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
// Replace "entityType" with your entity type (e.g., "tenant", "property", etc.)
const entityType = "REPLACE_WITH_ENTITY_TYPE";

// Parse the response
const response = pm.response.json();

// Check if the response was successful
if (pm.response.code === 201 && response.data && response.data.id) {
    // Set the entity ID in the environment
    pm.environment.set(entityType + "Id", response.data.id);
    console.log(entityType + " ID set in environment: " + response.data.id);
    
    // Test assertions
    pm.test("Status code is 201", function () {
        pm.response.to.have.status(201);
    });
    
    pm.test("Response has entity ID", function () {
        pm.expect(response.data.id).to.be.a('string').and.to.not.be.empty;
    });
} else {
    console.log("Failed to create " + entityType + " or response format unexpected");
    
    pm.test("Create " + entityType + " failed", function () {
        pm.expect.fail("Failed to create " + entityType + ": " + JSON.stringify(response));
    });
}
`;

/**
 * Pre-request Script for Authentication
 * 
 * Copy this script into the "Pre-request Script" tab of your authenticated requests in Postman.
 * It will automatically check if the access token is set and warn if it's missing.
 */
const authPreRequestScript = `
// Check if the access token is set
const accessToken = pm.environment.get("accessToken");

if (!accessToken) {
    console.warn("⚠️ Access token is not set in the environment. This request may fail.");
    console.warn("Please run the Sign In request first to obtain an access token.");
} else {
    console.log("Access token is set in the environment.");
}
`;

// Export the scripts for reference
module.exports = {
    signInTestScript,
    getCurrentUserTestScript,
    signOutTestScript,
    createEntityTestScript,
    authPreRequestScript
}; 
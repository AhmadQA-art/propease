/**
 * Feature flags configuration
 * 
 * This file controls which features are enabled in different environments.
 * Values are set in .env.development and .env.production files.
 */

export const featureFlags = {
  // Payment feature flag
  enablePayments: import.meta.env.VITE_ENABLE_PAYMENTS === "true",
  
  // Finance feature flag
  enableFinances: import.meta.env.VITE_ENABLE_FINANCES === "true",
}; 
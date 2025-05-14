/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix the clone-deep dependency issue
  webpack: (config) => {
    // Fix for issues with the clone-deep dependency
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Ignore problematic dependencies
      'clone-deep': false,
      'puppeteer': false,
      'puppeteer-core': false,
      'puppeteer-extra': false,
      'puppeteer-extra-plugin-stealth': false
    };
    
    return config;
  }
};

export default nextConfig; 
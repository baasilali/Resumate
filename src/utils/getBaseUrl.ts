export const getBaseUrl = (): string => {
  const nodeEnv = process.env.NEXT_PUBLIC_NODE_ENV;
  const devBaseUrl = process.env.NEXT_PUBLIC_DEV_BASE_URL;
  const prodBaseUrl = process.env.NEXT_PUBLIC_PROD_BASE_URL;

  if (nodeEnv === 'production') {
    if (!prodBaseUrl) {
      console.warn('Production base URL is not defined. Falling back to development URL.');
      return devBaseUrl || 'http://localhost:3001/api/v1'; // Fallback if dev is also not set
    }
    return prodBaseUrl;
  } else {
    if (!devBaseUrl) {
      console.warn('Development base URL is not defined. Using default fallback.');
      return 'http://localhost:3001/api/v1'; // Default fallback
    }
    return devBaseUrl;
  }
}; 
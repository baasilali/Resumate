/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.module.rules.push({
        test: /\.pdf$/,
        use: "null-loader", // Prevents Next.js from trying to process PDF files
      });
      return config;
    },
  };
  
  module.exports = nextConfig;
  
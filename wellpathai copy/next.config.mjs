/** @type {import('next').NextConfig} */

const API_URL = process.env.API_URL || "localhost";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://${API_URL}:5002/api/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
   allowedDevOrigins: ['192.168.0.112'],
  images: {
    remotePatterns: [
      {
        protocol: "https",

        hostname: "smsassets.blob.core.windows.net",
        pathname: "/svastha-assets/**",
      },
      {
        protocol: "https",
        hostname: "*.sms24hrs.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

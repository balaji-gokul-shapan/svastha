/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
   allowedDevOrigins: ['192.168.0.114'],
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
      {
        protocol: "https",
        hostname: "api.fiveplushospitals.in",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;

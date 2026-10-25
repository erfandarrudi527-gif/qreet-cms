/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/cms", // the whole CMS runs under the /cms sub-path
  assetPrefix: "/cms",
  output: "standalone", // slim build output for PM2 / plain Node.js on the host
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb", // ZIP imports + media uploads
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/cms",
        permanent: false,
        basePath: false,
      },
      {
        source: "/home",
        destination: "/cms/page/home",
        permanent: false,
        basePath: false,
      },
      {
        source: "/cms/home.html",
        destination: "/cms/client-view?slug=home",
        permanent: false,
        basePath: false,
      },
      {
        source: "/home.html",
        destination: "/cms/client-view?slug=home",
        permanent: false,
        basePath: false,
      },
      {
        source: "/cms/index.html",
        destination: "/cms/client-view?slug=home",
        permanent: false,
        basePath: false,
      },
      {
        source: "/index.html",
        destination: "/cms/client-view?slug=home",
        permanent: false,
        basePath: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

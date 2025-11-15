
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rqdsibkzaqdavrbmjbtq.supabase.co",
        pathname: "/storage/v1/object/public/images/*",
      },
      {
        protocol: "https",
        hostname: "rqdsibkzaqdavrbmjbtq.supabase.co",
        pathname: "/storage/v1/object/public/songs/*",
      },
    ],
  },
};

export default nextConfig;
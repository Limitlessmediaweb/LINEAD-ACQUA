import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 60 per i poster a tutto schermo (sotto grana e vignettatura la differenza non si vede)
    qualities: [60, 75],
  },
};

export default nextConfig;

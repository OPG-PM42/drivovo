import { composePlugins, withNx } from "@nx/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

const plugins = [withNx];

export default composePlugins(...plugins)(nextConfig);

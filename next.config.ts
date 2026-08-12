import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// remark-gfm is here for the legal documents — their fee and retention
// tables are GFM tables, which core MDX renders as plain paragraphs.
// The plugin is named as a string: Turbopack requires serializable options.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
});

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    unoptimized: true,
  },
};

export default withMDX(nextConfig);

const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.module.css": {
          loaders: ["css-loader"],
          as: "*.css"
        }
      }
    }
  }
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'pdf-parse', 'mammoth'],
  },
  transpilePackages: ['react-markdown'],
}

export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/painel',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig

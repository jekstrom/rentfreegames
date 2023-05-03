// next.config.js
module.exports = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cf.geekdo-images.com',
          port: '',
          pathname: '/**',
        },
        {
          hostname: 'd2k4q26owzy373.cloudfront.net',
          pathname: '/**',
          protocol: 'https'
        },
        {
          hostname: 'cdn.shopify.com',
          pathname: '/**',
          protocol: 'https'
        },
        {
          hostname: 'boardgamesupply.com.au',
          pathname: '/**',
          protocol: 'https'
        }
      ],
    },
    output: 'standalone',
    staticPageGenerationTimeout: 120
  }
  
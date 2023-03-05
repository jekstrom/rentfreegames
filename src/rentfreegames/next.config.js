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
      ],
    },
  }
  
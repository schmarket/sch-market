module.exports = {
  experimental: {
    turboMode: true,
  },
  images: {
    domains: [],
  },
  i18n: {
    locales: ['en-US'],
    defaultLocale: 'en-US'
  },
  webpack: (config, {isServer}) => {
        if (isServer) {
            config.externals.push('_http_common');        }
        return config;
    },
};

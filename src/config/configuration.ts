export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),

  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  },

  cors: {
    origins: (process.env.TRUSTED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),

    credentials: true,
  },

  trustProxy: process.env.TRUST_PROXY === 'true',

  throttle: {
    short: { ttl: 1000, limit: parseInt(process.env.THROTTLE_SHORT_LIMIT ?? '5', 10) },
    medium: { ttl: 10000, limit: parseInt(process.env.THROTTLE_MEDIUM_LIMIT ?? '30', 10) },
    long: { ttl: 60000, limit: parseInt(process.env.THROTTLE_LONG_LIMIT ?? '150', 10) },
  },

  swagger: {
    title: 'Kineo API',
    description: 'Kineo API documentation',
    version: '1.0',
    tag: 'Kineo',
  },
});
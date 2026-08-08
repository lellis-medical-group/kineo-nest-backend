export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),

  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  },

  swagger: {
    title: 'Kineo API',
    description: 'Kineo API documentation',
    version: '1.0',
    tag: 'Kineo',
  },
});

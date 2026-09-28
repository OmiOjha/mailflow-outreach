import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MailFlow API',
      version: '1.0.0',
      description: 'Email outreach campaign platform API',
      contact: {
        name: 'Omi Ojha',
        url: 'https://github.com/OmiOjha',
      },
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

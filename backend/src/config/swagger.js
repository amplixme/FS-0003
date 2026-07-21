const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FS-0003 API',
      version: '1.0.0',
      description: 'API del blog FS-0003 — Amplix Acceleration Program',
    },
    servers: [
      {
        url: '/api',
        description: 'Base path',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                status: { type: 'integer' },
              },
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            bio: { type: 'string', nullable: true },
            avatarUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        UserPublic: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            bio: { type: 'string', nullable: true },
            avatarUrl: { type: 'string', nullable: true },
            postCount: { type: 'integer' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            content: { type: 'string' },
            coverImage: { type: 'string', nullable: true },
            published: { type: 'boolean' },
            authorId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            author: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  slug: { type: 'string' },
                },
              },
            },
            commentCount: { type: 'integer' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            content: { type: 'string' },
            postId: { type: 'integer' },
            authorId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            author: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            _count: {
              type: 'object',
              properties: {
                posts: { type: 'integer' },
              },
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { '$ref': '#/components/schemas/User' },
              },
            },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        AdminStats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'integer' },
            totalPosts: { type: 'integer' },
            totalComments: { type: 'integer' },
            postsByCategory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
        AdminUser: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
            postCount: { type: 'integer' },
          },
        },
        AdminPost: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            published: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            author: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        AdminComment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            author: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
            post: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                title: { type: 'string' },
              },
            },
          },
        },
        PaginatedPosts: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { '$ref': '#/components/schemas/Post' },
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check' },
      { name: 'Auth', description: 'Autenticación (login/register)' },
      { name: 'Users', description: 'Gestión de usuarios' },
      { name: 'Posts', description: 'CRUD de posts' },
      { name: 'Comments', description: 'Comentarios en posts' },
      { name: 'Categories', description: 'Categorías' },
      { name: 'Upload', description: 'Subida de archivos a Cloudinary' },
      { name: 'Admin', description: 'Endpoints administrativos (rol ADMIN)' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);

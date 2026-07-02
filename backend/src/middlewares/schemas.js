const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required'
  }),
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  })
});

const postSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 1 character',
    'string.max': 'Title cannot exceed 200 characters'
  }),
  content: Joi.string().min(1).max(10000).required().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content cannot be empty',
    'string.min': 'Content must be at least 1 character',
    'string.max': 'Content cannot exceed 10000 characters'
  }),
  published: Joi.boolean().optional().messages({
    'boolean.base': 'Published must be a boolean value'
  }),
  coverImage: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'coverImage must be a valid URL'
  })
}).unknown(false);

const updatePostSchema = Joi.object({
  title: Joi.string().min(1).max(200).messages({
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 1 character',
    'string.max': 'Title cannot exceed 200 characters'
  }),
  content: Joi.string().min(1).max(10000).messages({
    'string.empty': 'Content cannot be empty',
    'string.min': 'Content must be at least 1 character',
    'string.max': 'Content cannot exceed 10000 characters'
  }),
  coverImage: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'coverImage must be a valid URL'
  })
}).min(1).unknown(false).messages({
  'object.min': 'At least one field (title or content) must be provided'
});

const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 1 character',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  slug: Joi.string().min(1).max(100).required().messages({
    'any.required': 'Slug is required',
    'string.empty': 'Slug cannot be empty',
    'string.min': 'Slug must be at least 1 character',
    'string.max': 'Slug cannot exceed 100 characters',
  }),
}).unknown(false);

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 1 character',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  slug: Joi.string().min(1).max(100).messages({
    'string.empty': 'Slug cannot be empty',
    'string.min': 'Slug must be at least 1 character',
    'string.max': 'Slug cannot exceed 100 characters',
  }),
}).min(1).unknown(false).messages({
  'object.min': 'At least one field (name or slug) must be provided',
});

module.exports = { registerSchema, postSchema, updatePostSchema, createCategorySchema, updateCategorySchema };

import express from 'express';
import BlogPost from '../models/BlogPost.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, destination, sort = '-publishedAt' } = req.query;

    // Build query
    const query = { status: 'published' };
    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (destination) query.destination = destination;

    const posts = await BlogPost.find(query)
      .populate({
        path: 'author',
        select: 'username'
      })
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await BlogPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog posts', error: error.message });
  }
});

// Get a specific blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await BlogPost.findOne({ slug, status: 'published' }).populate({
      path: 'author',
      select: 'username'
    });

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog post', error: error.message });
  }
});

// Get all blog posts (including drafts) - Admin only
router.get('/admin/all', auth, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;

    const posts = await BlogPost.find(query)
      .populate({
        path: 'author',
        select: 'username'
      })
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await BlogPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog posts', error: error.message });
  }
});

// Create a new blog post
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      content,
      destination,
      categories,
      tags,
      featuredImage,
      images,
      status
    } = req.body;

    if (!title || !content || !destination) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');

    // Check if slug already exists
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      // Append a random string to make the slug unique
      const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Create new blog post
      const post = new BlogPost({
        title,
        slug: uniqueSlug,
        content,
        author: req.userId,
        destination,
        categories: categories || [],
        tags: tags || [],
        featuredImage,
        images: images || [],
        status: status || 'draft',
        publishedAt: status === 'published' ? new Date() : null
      });

      await post.save();

      // Return the post with author details
      const populatedPost = await BlogPost.findById(post._id).populate({
        path: 'author',
        select: 'username'
      });

      res.status(201).json(populatedPost);
    } else {
      // Create new blog post with original slug
      const post = new BlogPost({
        title,
        slug,
        content,
        author: req.userId,
        destination,
        categories: categories || [],
        tags: tags || [],
        featuredImage,
        images: images || [],
        status: status || 'draft',
        publishedAt: status === 'published' ? new Date() : null
      });

      await post.save();

      // Return the post with author details
      const populatedPost = await BlogPost.findById(post._id).populate({
        path: 'author',
        select: 'username'
      });

      res.status(201).json(populatedPost);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog post', error: error.message });
  }
});

// Update a blog post
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      destination,
      categories,
      tags,
      featuredImage,
      images,
      status
    } = req.body;

    // Find the post
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Update fields
    if (title) {
      post.title = title;
      
      // Update slug if title changes
      const newSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      // Check if new slug already exists (excluding this post)
      const existingPost = await BlogPost.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existingPost) {
        post.slug = `${newSlug}-${Math.random().toString(36).substring(2, 8)}`;
      } else {
        post.slug = newSlug;
      }
    }
    
    if (content) post.content = content;
    if (destination) post.destination = destination;
    if (categories) post.categories = categories;
    if (tags) post.tags = tags;
    if (featuredImage) post.featuredImage = featuredImage;
    if (images) post.images = images;
    
    // Update status and publishedAt if publishing for the first time
    if (status && post.status !== status) {
      post.status = status;
      if (status === 'published' && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }

    post.updatedAt = new Date();
    await post.save();

    // Return the updated post with author details
    const updatedPost = await BlogPost.findById(id).populate({
      path: 'author',
      select: 'username'
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog post', error: error.message });
  }
});

// Delete a blog post
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the post
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await BlogPost.findByIdAndDelete(id);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog post', error: error.message });
  }
});

// Get blog categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await BlogPost.distinct('categories', { status: 'published' });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Get blog tags
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await BlogPost.distinct('tags', { status: 'published' });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tags', error: error.message });
  }
});

// Get blog destinations
router.get('/destinations/all', async (req, res) => {
  try {
    const destinations = await BlogPost.distinct('destination', { status: 'published' });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destinations', error: error.message });
  }
});

export default router;

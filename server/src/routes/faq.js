import express from 'express';
import FAQ from '../models/FAQ.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all FAQs
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    // Build query
    const query = { isActive: true };
    if (category) query.category = category;

    const faqs = await FAQ.find(query).sort({ category: 1, order: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
});

// Get FAQs by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const faqs = await FAQ.find({ category, isActive: true }).sort({ order: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
});

// Get all FAQ categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await FAQ.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQ categories', error: error.message });
  }
});

// Reorder FAQs (admin only)
router.post('/reorder', auth, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid items format' });
    }

    // Update order for each item
    const updatePromises = items.map(item => {
      return FAQ.findByIdAndUpdate(
        item.id,
        { order: item.order },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    // Get updated FAQs
    const faqs = await FAQ.find().sort({ category: 1, order: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error reordering FAQs', error: error.message });
  }
});

// Get a specific FAQ
router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQ', error: error.message });
  }
});

// Create a new FAQ (admin only)
router.post('/', auth, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const { question, answer, category, order, isActive } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const faq = new FAQ({
      question,
      answer,
      category: category || 'general',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await faq.save();
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error creating FAQ', error: error.message });
  }
});

// Update a FAQ (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const { id } = req.params;
    const { question, answer, category, order, isActive } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    // Update fields
    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (category) faq.category = category;
    if (order !== undefined) faq.order = order;
    if (isActive !== undefined) faq.isActive = isActive;

    faq.updatedAt = Date.now();
    await faq.save();

    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error updating FAQ', error: error.message });
  }
});

// Delete a FAQ (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const { id } = req.params;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await FAQ.findByIdAndDelete(id);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting FAQ', error: error.message });
  }
});

export default router;

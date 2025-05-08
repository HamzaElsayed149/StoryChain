const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

// Get all stories with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, status } = req.query;
    const query = {};
    
    if (genre) query.genre = genre;
    if (status) query.status = status;

    const stories = await Story.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Story.countDocuments(query);

    res.json({
      stories,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new story
router.post('/', async (req, res) => {
  const story = new Story({
    sentences: [{
      text: req.body.firstSentence,
      author: req.body.author
    }],
    genre: req.body.genre,
    title: req.body.title || 'Untitled Story'
  });

  try {
    const newStory = await story.save();
    res.status(201).json(newStory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a sentence to a story
router.post('/:id/sentences', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.status === 'closed') {
      return res.status(400).json({ message: 'Story is closed' });
    }
    
    story.sentences.push({
      text: req.body.text,
      author: req.body.author
    });
    
    if (story.sentences.length >= 20) {
      story.status = 'closed';
    }
    
    const updatedStory = await story.save();
    res.json(updatedStory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Vote for a sentence
router.post('/:storyId/sentences/:sentenceId/vote', async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const sentence = story.sentences.id(req.params.sentenceId);
    if (!sentence) {
      return res.status(404).json({ message: 'Sentence not found' });
    }

    if (sentence.voters.includes(req.body.voterId)) {
      return res.status(400).json({ message: 'User has already voted' });
    }

    sentence.votes += 1;
    sentence.voters.push(req.body.voterId);
    
    const updatedStory = await story.save();
    res.json(updatedStory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedStory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle like on story
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const likedByIndex = story.likedBy.indexOf(userId);
    if (likedByIndex === -1) {
      // Add like
      story.likedBy.push(userId);
      story.likes = (story.likes || 0) + 1;
    } else {
      // Remove like
      story.likedBy.splice(likedByIndex, 1);
      story.likes = Math.max(0, (story.likes || 1) - 1);
    }

    await story.save();
    res.json(story);
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
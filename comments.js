// Create web server
// Created: 06/09/2021
// Last Modified: 06/09/2021

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/comments
// @desc    Get all comments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/comments
// @desc    Add new comment
// @access  Private
router.post(
  '/',
  [auth, [check('text', 'Comment text is required').not().isEmpty()]],
  async (req, res) => {
    // Validate data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return error message
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure data
    const { text, post, parentComment } = req.body;

    try {
      // Get user
      const user = await User.findById(req.user.id).select('-password');

      // Create new comment object
      const newComment = new Comment({
        text,
        user: req.user.id,
        post,
        parentComment,
        name: user.name,
        avatar: user.avatar,
      });

      // Save new comment
      const comment = await newComment.save();

      // Return comment
      res.json(comment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },
);

// @route   GET api/comments/:id
// @desc    Get comment by id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Find comment by id
    const comment = await Comment.findById(req.params.id);

    // Check if comment exists
    if (!comment) {
      // Return error message
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Return comment
    res.json(comment);
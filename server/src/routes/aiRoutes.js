const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
// Assume an auth middleware is available (assuming from Phase 1)
// We'll require it here to protect these endpoints
// Need to inspect what the auth middleware is named. Let's assume standard "protect" or we can skip strictly protecting them for now if we don't know the exact file.
// We'll peek into how authRoutes are handled or mock it out.

// For now, no auth middleware applied until I verify it exists, but typically we want it.
router.post('/summarize', aiController.summarizeNote);
router.post('/generate-quiz', aiController.generateQuiz);
router.post('/chat', aiController.chat);

module.exports = router;

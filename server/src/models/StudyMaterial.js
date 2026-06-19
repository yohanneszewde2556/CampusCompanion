const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // Can hold large text or notes extracted for AI processing
  },
  contentUrl: {
    type: String, // URL if uploaded as a file
  },
  summary: {
    type: String, // AI-generated summary
  },
  generatedQuizzes: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String
  }],
}, { timestamps: true });

studyMaterialSchema.index({ studentId: 1 });

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
module.exports = StudyMaterial;

const { OpenAI } = require('openai');
const StudyMaterial = require('../models/StudyMaterial');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.summarizeNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Safety check: if no key is provided, we simulate the response during development
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
      return res.status(200).json({
        summary: "This is a mock summary because an OpenAI API Key was not provided. Please add it to your .env file.",
        title
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert academic assistant. Summarize the following study notes concisely, highlighting the most important key concepts.' },
        { role: 'user', content }
      ],
    });

    const summary = completion.choices[0].message.content;

    // Save to DB
    const material = await StudyMaterial.create({
      studentId: req.user._id, // Assumes req.user is set via auth middleware
      title,
      content,
      summary
    });

    res.status(200).json({ summary, materialId: material._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
};

exports.generateQuiz = async (req, res) => {
  try {
    const { materialId, content } = req.body;

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
      return res.status(200).json({
        quizzes: [{ question: "Mock Question?", options: ["A", "B", "C"], correctAnswer: "A", explanation: "Mock explanation" }]
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate a 3-question multiple choice quiz based on the user notes. Return ONLY valid JSON in format: [{"question":"Q1","options":["A","B","C","D"],"correctAnswer":"A","explanation":"Exp"}].' },
        { role: 'user', content }
      ],
      response_format: { type: 'json_object' } // Ensure exact formatting
    });

    let quizzes = [];
    try {
      const parsed = JSON.parse(completion.choices[0].message.content);
      quizzes = parsed.quizzes || parsed; 
    } catch {
      quizzes = JSON.parse(completion.choices[0].message.content); 
    }

    if (materialId) {
      await StudyMaterial.findByIdAndUpdate(materialId, { $push: { generatedQuizzes: { $each: quizzes } } });
    }

    res.status(200).json({ quizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate quiz' });
  }
};

exports.chat = async (req, res) => {
  try {
    const { message, contextHistory = [] } = req.body;
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
      return res.status(200).json({ reply: "I am a mock AI! Please add a real OpenAI API Key to chat with me!" });
    }

    const messages = [
      { role: 'system', content: 'You are Campus Companion AI, a helpful, encouraging university study partner.' },
      ...contextHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
    });

    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to chat with AI Assistant' });
  }
};

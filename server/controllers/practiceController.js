const PracticeSession = require('../models/PracticeSession');
const PYQ = require('../models/PYQ');
const Subject = require('../models/Subject');

// @desc    Generate practice questions based on configuration
// @route   POST /api/practice/generate
// @access  Private
exports.generatePractice = async (req, res, next) => {
  try {
    const { subjectId, unit, difficulty, count = 5 } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID is required',
      });
    }

    const query = { subject: subjectId };

    if (unit && Number(unit) !== 0) {
      query.unit = Number(unit);
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Retrieve matching questions
    const questions = await PYQ.find(query).populate('subject', 'name code');

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No PYQs found matching the selected criteria. Try selecting all units or all difficulties.',
      });
    }

    // Shuffle and pick requested count
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(Number(count), shuffled.length));

    res.status(200).json({
      success: true,
      count: selectedQuestions.length,
      data: selectedQuestions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a completed practice session
// @route   POST /api/practice/submit
// @access  Private
exports.submitPracticeSession = async (req, res, next) => {
  try {
    const { subjectId, unit, difficulty, questions, timeTaken } = req.body;

    if (!subjectId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid practice session submission data',
      });
    }

    let correctCount = 0;
    const revisionTopics = new Set();
    const formattedQuestions = [];

    for (const item of questions) {
      const isCorrect = item.userStatus === 'correct';
      if (isCorrect) {
        correctCount++;
      } else {
        if (item.topic) {
          revisionTopics.add(item.topic);
        }
      }

      formattedQuestions.push({
        question: item.questionId,
        userStatus: item.userStatus || 'correct',
        markedForRevision: Boolean(item.markedForRevision),
      });
    }

    const totalQuestions = questions.length;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);

    const session = await PracticeSession.create({
      user: req.user._id,
      subject: subjectId,
      unit: unit ? Number(unit) : 0,
      difficulty: difficulty || 'All',
      questions: formattedQuestions,
      score: correctCount,
      totalQuestions,
      accuracy,
      timeTaken: Number(timeTaken) || 0,
    });

    const populatedSession = await session.populate('subject', 'name code');

    res.status(201).json({
      success: true,
      data: {
        session: populatedSession,
        correctCount,
        incorrectCount: totalQuestions - correctCount,
        totalQuestions,
        accuracy,
        timeTaken: Number(timeTaken) || 0,
        revisionTopics: Array.from(revisionTopics),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's practice history and stats
// @route   GET /api/practice/history
// @access  Private
exports.getPracticeHistory = async (req, res, next) => {
  try {
    const sessions = await PracticeSession.find({ user: req.user._id })
      .populate('subject', 'name code')
      .sort({ createdAt: -1 })
      .limit(30);

    // Calculate overall statistics
    const totalSessions = sessions.length;
    let totalQuestionsAnswered = 0;
    let totalCorrect = 0;
    let totalTime = 0;

    sessions.forEach((s) => {
      totalQuestionsAnswered += s.totalQuestions || 0;
      totalCorrect += s.score || 0;
      totalTime += s.timeTaken || 0;
    });

    const overallAccuracy =
      totalQuestionsAnswered > 0
        ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        sessions,
        stats: {
          totalSessions,
          totalQuestionsAnswered,
          totalCorrect,
          overallAccuracy,
          totalTimeInMinutes: Math.round(totalTime / 60),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

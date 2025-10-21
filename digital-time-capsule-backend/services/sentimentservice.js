// services/sentimentService.js

const Sentiment = require('sentiment');
const sentiment = new Sentiment();

/**
 * Analyzes the sentiment of a given text.
 * @param {string} text - The text to analyze.
 * @returns {object} { score: number, comparative: number }
 */
exports.analyzeSentiment = (text) => {
    if (!text) {
        return { score: 0, comparative: 0 };
    }
    // The sentiment package returns a score (positive/negative magnitude) and comparative score (score divided by word count).
    return sentiment.analyze(text);
};
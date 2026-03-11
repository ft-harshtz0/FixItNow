import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyze image using Gemini Vision API
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} Analysis results with description, severity, and confidence
 */
export async function analyzeImageWithGemini(imagePath) {
    try {
        console.log('🔍 Starting Gemini AI analysis...');
        console.log('📁 Image path:', imagePath);

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY not configured in environment');
            throw new Error('GEMINI_API_KEY not configured');
        }

        console.log('✅ API key found (length:', process.env.GEMINI_API_KEY.length, ')');

        // Read image file and convert to base64
        console.log('📖 Reading image file...');
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = getMimeType(imagePath);
        console.log('✅ Image loaded, MIME type:', mimeType, 'Size:', imageBuffer.length, 'bytes');

        // Get Gemini model
        console.log('🤖 Initializing Gemini model...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Create prompt for job/repair issue analysis
        const prompt = `You are an expert at analyzing repair and maintenance issues from images. 
        
Analyze this image and provide:
1. A detailed description of the problem or issue visible in the image (2-3 sentences)
2. The severity level (low, medium, or high) based on urgency and potential damage
3. Your confidence level in this analysis (0.0 to 1.0)

Format your response EXACTLY as follows:
DESCRIPTION: [Your detailed description here]
SEVERITY: [low/medium/high]
CONFIDENCE: [0.0-1.0]

Be specific about what you see and why it needs attention. Focus on repair/maintenance aspects.`;

        // Generate content with image
        console.log('🚀 Sending request to Gemini API...');
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]);

        console.log('📥 Received response from Gemini API');
        const response = await result.response;
        const text = response.text();
        console.log('📝 Raw Gemini response:', text.substring(0, 200) + '...');

        // Parse the response
        const analysis = parseGeminiResponse(text);
        console.log('✅ Parsed analysis:', JSON.stringify(analysis, null, 2));

        return analysis;
    } catch (error) {
        console.error('❌ Error analyzing image with Gemini:', error.message);
        console.error('Stack trace:', error.stack);
        throw error;
    }
}

/**
 * Parse Gemini API response to extract structured data
 * @param {string} text - Response text from Gemini
 * @returns {Object} Parsed analysis
 */
function parseGeminiResponse(text) {
    try {
        console.log('🔍 Parsing Gemini response...');

        // Extract description
        const descMatch = text.match(/DESCRIPTION:\s*(.+?)(?=SEVERITY:|$)/is);
        const description = descMatch
            ? descMatch[1].trim()
            : text.substring(0, 300); // Fallback to first 300 chars
        console.log('📝 Extracted description:', description.substring(0, 100) + '...');

        // Extract severity
        const sevMatch = text.match(/SEVERITY:\s*(low|medium|high)/i);
        const severity = sevMatch
            ? sevMatch[1].toLowerCase()
            : 'medium'; // Default to medium
        console.log('⚠️  Extracted severity:', severity);

        // Extract confidence
        const confMatch = text.match(/CONFIDENCE:\s*(0?\.\d+|1\.0|1)/i);
        const confidence = confMatch
            ? parseFloat(confMatch[1])
            : 0.75; // Default confidence
        console.log('📊 Extracted confidence:', confidence);

        return {
            description: description.replace(/\n/g, ' ').trim(),
            severity,
            confidence: Math.min(Math.max(confidence, 0), 1) // Clamp between 0 and 1
        };
    } catch (error) {
        console.error('❌ Error parsing Gemini response:', error);
        // Return safe defaults
        return {
            description: text.substring(0, 300),
            severity: 'medium',
            confidence: 0.5
        };
    }
}

/**
 * Get MIME type from file extension
 * @param {string} filePath - Path to file
 * @returns {string} MIME type
 */
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
}

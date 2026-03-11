import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeImageWithGemini } from './geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * AI-powered image analysis using Google Gemini
 * Analyzes uploaded job images to generate descriptions and assess severity
 * 
 * @param {string} imagePath - Path to the uploaded image
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeImage(imagePath) {
    console.log('🎯 analyzeImage called with path:', imagePath);

    try {
        // Try to use Gemini AI for real-time analysis
        console.log('🚀 Attempting Gemini AI analysis...');
        try {
            const geminiAnalysis = await analyzeImageWithGemini(imagePath);

            console.log('✅ Gemini analysis successful!');

            // Generate issue tags based on description and severity
            const tags = generateTags(geminiAnalysis.description, geminiAnalysis.severity);

            return {
                description: geminiAnalysis.description,
                severity: geminiAnalysis.severity,
                issue_tags: tags,
                confidence: geminiAnalysis.confidence,
                analysis_method: 'gemini-ai'
            };
        } catch (geminiError) {
            console.error('❌ Gemini AI analysis failed!');
            console.error('Error message:', geminiError.message);
            console.error('Error stack:', geminiError.stack);
            console.warn('⚠️  Falling back to keyword-based analysis');

            // Fallback to keyword-based analysis
            const filename = path.basename(imagePath).toLowerCase();
            const analysis = classifyByRules(filename);

            return {
                description: analysis.description,
                severity: analysis.severity,
                issue_tags: analysis.tags,
                confidence: analysis.confidence,
                analysis_method: 'rule-based-fallback'
            };
        }
    } catch (error) {
        console.error('💥 Critical error in analyzeImage:', error);
        throw error;
    }
}

/**
 * Generate issue tags from description and severity
 * @param {string} description - AI-generated description
 * @param {string} severity - Severity level
 * @returns {Array<string>} Issue tags
 */
function generateTags(description, severity) {
    const tags = [];
    const lowerDesc = description.toLowerCase();

    // Common issue keywords
    const tagKeywords = {
        'leak': 'leak',
        'water': 'water damage',
        'pipe': 'pipe issue',
        'electrical': 'electrical',
        'wiring': 'wiring',
        'wire': 'wiring',
        'power': 'power issue',
        'wood': 'woodwork',
        'door': 'structural',
        'window': 'structural',
        'furniture': 'furniture',
        'paint': 'painting',
        'wall': 'wall damage',
        'crack': 'cosmetic',
        'vehicle': 'vehicle',
        'car': 'automotive',
        'engine': 'mechanical',
        'brake': 'mechanical'
    };

    // Extract tags from description
    for (const [keyword, tag] of Object.entries(tagKeywords)) {
        if (lowerDesc.includes(keyword) && !tags.includes(tag)) {
            tags.push(tag);
        }
    }

    // Add severity-based tag if no tags found
    if (tags.length === 0) {
        tags.push('general repair');
    }

    // Limit to 3 most relevant tags
    return tags.slice(0, 3);
}

/**
 * Rule-based image classification (FALLBACK ONLY)
 * Uses keywords in filename and basic heuristics to generate descriptions
 * This is only used when Gemini API fails
 */
function classifyByRules(filename) {
    const rules = [
        {
            keywords: ['leak', 'pipe', 'water', 'drain', 'faucet', 'sink', 'toilet'],
            category: 'plumbing',
            tags: ['leak', 'water damage', 'pipe issue'],
            severity: 'high',
            description: 'Detected a plumbing issue with potential water leakage. The problem appears to involve pipe damage, faucet malfunction, or drainage issues that may require immediate attention to prevent water damage.'
        },
        {
            keywords: ['wire', 'electric', 'switch', 'outlet', 'light', 'power', 'socket'],
            category: 'electrician',
            tags: ['electrical', 'wiring', 'power issue'],
            severity: 'high',
            description: 'Identified an electrical problem involving wiring, power outlets, or lighting fixtures. This issue requires professional attention for safety reasons and should be addressed promptly to prevent potential hazards.'
        },
        {
            keywords: ['door', 'window', 'hinge', 'wood', 'cabinet', 'furniture', 'frame'],
            category: 'carpenter',
            tags: ['woodwork', 'structural', 'furniture'],
            severity: 'medium',
            description: 'Detected carpentry work needed for wooden structures, furniture, or fixtures. The issue involves doors, windows, cabinets, or other woodwork that requires repair or adjustment by a skilled carpenter.'
        },
        {
            keywords: ['car', 'engine', 'brake', 'tire', 'vehicle', 'motor'],
            category: 'mechanic',
            tags: ['vehicle', 'mechanical', 'automotive'],
            severity: 'medium',
            description: 'Identified a vehicle mechanical issue affecting the engine, brakes, tires, or other automotive components. Professional mechanical expertise is needed to diagnose and repair the problem safely.'
        },
        {
            keywords: ['paint', 'wall', 'ceiling', 'color', 'brush', 'crack'],
            category: 'painter',
            tags: ['painting', 'wall damage', 'cosmetic'],
            severity: 'low',
            description: 'Detected painting or cosmetic work needed for walls, ceilings, or surfaces. The issue involves paint damage, cracks, or areas requiring refinishing to restore aesthetic appeal.'
        }
    ];

    // Find matching rule
    for (const rule of rules) {
        const hasKeyword = rule.keywords.some(keyword => filename.includes(keyword));
        if (hasKeyword) {
            return {
                category: rule.category,
                tags: rule.tags,
                severity: rule.severity,
                description: rule.description,
                confidence: 0.75 + Math.random() * 0.2 // 0.75-0.95
            };
        }
    }

    // Default classification if no keywords match
    return {
        category: 'plumber', // Default to most common
        tags: ['general repair', 'unclassified'],
        severity: 'medium',
        description: 'Detected a general repair or maintenance issue. While the specific category could not be determined with high confidence, the problem appears to require professional attention. Please review the uploaded image and description for more details.',
        confidence: 0.5
    };
}

/**
 * Placeholder for TensorFlow.js model loading
 * Uncomment and implement when adding actual ML model
 */
/*
import * as tf from '@tensorflow/tfjs-node';

async function loadModel() {
  const modelPath = path.join(__dirname, 'imageModel/model.json');
  const model = await tf.loadLayersModel(`file://${modelPath}`);
  return model;
}

async function loadImage(imagePath) {
  const imageBuffer = await fs.readFile(imagePath);
  const tfimage = tf.node.decodeImage(imageBuffer);
  const resized = tf.image.resizeBilinear(tfimage, [224, 224]);
  const normalized = resized.div(255.0);
  return normalized.expandDims(0);
}
*/

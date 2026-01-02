// src/models/ReviewRequest.model.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const GoalsSchema = new Schema(
    {
        syntaxCheck: { type: Boolean, default: true },
        quality: { type: Boolean, default: true },
        security: { type: Boolean, default: false },
        performance: { type: Boolean, default: false },
        docs: { type: Boolean, default: false },
        tests: { type: Boolean, default: false }
    },
    { _id: false }
);

const ReviewRequestSchema = new Schema(
    {
        // future: user / auth integrate karenge
        userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

        // future: project system ke liye
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },

        title: { type: String, default: '' },

        code: {
            type: String,
            required: true
        },

        language: {
            type: String,
            default: 'javascript'
        },

        frameworks: [
            {
                type: String
            }
        ],

        goals: {
            type: GoalsSchema,
            default: () => ({})
        },

        provider: {
            type: String,
            enum: ['gemini', 'groq', 'openai'],
            default: 'gemini'
        },

        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },

        tokensUsed: {
            type: Number,
            default: 0
        },

        // link to result doc
        resultId: {
            type: Schema.Types.ObjectId,
            ref: 'ReviewResult',
            default: null
        },

        errorMessage: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

export const ReviewRequest = mongoose.model('ReviewRequest', ReviewRequestSchema);

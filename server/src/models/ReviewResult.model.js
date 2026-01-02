// src/models/ReviewResult.model.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const IssueSchema = new Schema(
    {
        message: { type: String, required: true },
        lineHint: { type: String, default: '' },
        severity: { type: String, default: '' } // future: 'info' | 'warning' | 'error'
    },
    { _id: false }
);

const TestsSchema = new Schema(
    {
        framework: { type: String, default: '' }, // jest | mocha | etc
        code: { type: String, default: '' }
    },
    { _id: false }
);

const DocumentationSchema = new Schema(
    {
        docstring: { type: String, default: '' },
        apiDocs: { type: String, default: '' }
    },
    { _id: false }
);

const ReviewResultSchema = new Schema(
    {
        reviewRequestId: {
            type: Schema.Types.ObjectId,
            ref: 'ReviewRequest',
            required: true
        },

        summary: {
            type: String,
            default: ''
        },

        issues: {
            syntax: { type: [IssueSchema], default: [] },
            quality: { type: [IssueSchema], default: [] },
            security: { type: [IssueSchema], default: [] },
            performance: { type: [IssueSchema], default: [] }
        },

        refactoredCode: {
            type: String,
            default: ''
        },

        tests: {
            type: TestsSchema,
            default: () => ({})
        },

        documentation: {
            type: DocumentationSchema,
            default: () => ({})
        },

        explanationForBeginners: {
            type: String,
            default: ''
        },

        raw: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

export const ReviewResult = mongoose.model('ReviewResult', ReviewResultSchema);

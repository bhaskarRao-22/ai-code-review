import mongoose from 'mongoose';

const { Schema } = mongoose;

const CreditTransactionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: ['debit', 'credit'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        reason: {
            type: String,
            default: ''
        },
        meta: {
            type: Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

export const CreditTransaction = mongoose.model(
    'CreditTransaction',
    CreditTransactionSchema
);

import { User } from '../models/User.model.js';
import { CreditTransaction } from '../models/CreditTransaction.model.js';

const CREDITS_PER_SIMPLE_REVIEW = 1; // abhi 1 credit = 1 simple review

export async function consumeCreditsForSimpleReview(userId, extraMeta = {}) {
    if (!userId) {
        // agar anonymously use kar rahe ho to ya to block karo, ya abhi ke liye bypass:
        // throw new Error('AUTH_REQUIRED_FOR_BILLING');
        return;
    }

    const cost = CREDITS_PER_SIMPLE_REVIEW;

    // atomically deduct
    const updatedUser = await User.findOneAndUpdate(
        {
            _id: userId,
            'credits.balance': { $gte: cost }
        },
        {
            $inc: {
                'credits.balance': -cost,
                'credits.totalUsed': cost
            }
        },
        { new: true }
    );

    if (!updatedUser) {
        const err = new Error('INSUFFICIENT_CREDITS');
        err.code = 'INSUFFICIENT_CREDITS';
        throw err;
    }

    await CreditTransaction.create({
        userId,
        type: 'debit',
        amount: cost,
        reason: 'simple_review',
        meta: extraMeta
    });

    return updatedUser;
}

export async function grantCreditsToUser(userId, amount, reason = 'admin_grant') {
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $inc: {
                'credits.balance': amount,
                'credits.totalGranted': amount
            }
        },
        { new: true }
    );

    if (!updatedUser) {
        const err = new Error('USER_NOT_FOUND');
        err.code = 'USER_NOT_FOUND';
        throw err;
    }

    await CreditTransaction.create({
        userId,
        type: 'credit',
        amount,
        reason,
        meta: {}
    });

    return updatedUser;
}

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 60
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: validator.isEmail,
                message: "Invalid Email"
            }
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        planName: {
            type: String,
            enum: ["free", "pro", "team"],
            default: "free"
        },
        credits: {
            balance: {
                type: Number,
                default: 50
            },
            totalGranted: {
                type: Number,
                default: 50
            },
            totalUsed: {
                type: Number,
                default: 0
            }
        }
    },
    { timestamps: true }
);


// Password hash hook
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Custom method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', UserSchema)
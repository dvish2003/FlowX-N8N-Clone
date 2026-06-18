import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
        unique  : true,
    },
    image: {
        type: String,
        required: false,
    },
    googleAccessToken: {
        type: String,
        required: false,
    },
    googleRefreshToken: {
        type: String,
        required: false,
    },
    googleId: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: false,
    },
    verificationCode: {
        type: String,
        required: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordCode: {
        type: String,
        required: false,
    },
    resetPasswordExpires: {
        type: Date,
        required: false,
    },
    stripeCustomerId: {
        type: String,
        unique: true,
        sparse: true,
    },

},{ timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
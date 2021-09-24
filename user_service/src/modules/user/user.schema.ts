import { NextFunction } from 'express';
import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

class UserSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            publicKey: { type: String, index: true, trim: true, unique: true, required: true },
            username: { type: String, default: "", index: true, trim: true },
            description: { type: String, default: "" },
            founderRewardPercentage: { type: String, default: "" },
            image: { type: String, trim: true, default: "" },
            email: { type: String, trim: true, index: true, default: "" },
            isEmailVerified: { type: Boolean, default: false },
            mobile: { type: String, default: "" },
            countryCode: { type: String, default: "+91" },
            isMobileVerified: { type: Boolean, default: false },
            registeredWith: { type: String, enum: ["GOOGLE", "SEED"], default: "SEED" },
            role: { type: String, default: 'USER' },
            isAccountActived: { type: Boolean, default: true },
            isProfileUpdated: { type: Boolean, default: false },
            isRecoveryPageSkipped: { type: Boolean, default: false },
            otp: { type: Number },
        }, { timestamps: true });
        
        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
    }
}

export default mongoose.model('User', new UserSchema().schema);

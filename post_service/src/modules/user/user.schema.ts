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
            username: { type: String, default: "" },
            image: { type: String, trim: true, default: "" },
            isProfileUpdated: { type: Boolean, default: false },
            user: { type: mongoose.Schema.Types.ObjectId, required: true },
            followings: [ { type: mongoose.Schema.Types.ObjectId, ref: "User" } ],
            blockUsers: [ { type: mongoose.Schema.Types.ObjectId, ref: "User" } ],
        }, { timestamps: true });
        
        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
    }
}

export default mongoose.model('User', new UserSchema().schema);

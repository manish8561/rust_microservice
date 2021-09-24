import { NextFunction } from 'express';
import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

class FollowSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            follow: { type: mongoose.Schema.Types.ObjectId, ref: "Follow"},
            following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            type: { type: String, enum: [ "FOLLOW", "UNFOLLOW" ], default: "FOLLOW" }
        }, { timestamps: true });
        
        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
    }
}

const Follow = new FollowSchema();
export default mongoose.model('Follow', Follow.schema);

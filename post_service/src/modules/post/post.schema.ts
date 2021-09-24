import { NextFunction } from 'express';
import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

class PostSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            content: { type: String, index: true },
            image: { type: String, trim: true, default: "" },
            embedLink: { type: String, trim: true, default: "" },
            embedType: { type: String, trim: true, default: "" },
            isPostDeleted: { type: Boolean, default: false },
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            quotedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Quote" },
            likesCount: { type: Number, default: 0},
            rebentCount: { type: Number, default: 0},
            quoteCount: { type: Number, default: 0},
            commentsCount: { type: Number, default: 0},
            type: { type: String, enum: ["POST","REBENT", "QUOTE"], default: "POST" },
        }, { timestamps: true });

        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
    }
}

export default mongoose.model('Post', new PostSchema().schema);

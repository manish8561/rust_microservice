import { NextFunction } from 'express';
import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

class BlockSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            blockingUser: { type: mongoose.Schema.Types.ObjectId, index: true, ref: "User", required: true },
            blockingBy: { type: mongoose.Schema.Types.ObjectId, index: true, ref: "User", required: true },
        }, { timestamps: true });
        
        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
    }
}

export default mongoose.model('Block', new BlockSchema().schema);

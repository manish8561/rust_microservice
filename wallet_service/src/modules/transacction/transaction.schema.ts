import { NextFunction } from 'express';
import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

class TransactionSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            amount: { type: String, default: "0.00" },
            isTransactionVerified: { type: String, default: false },
            status: { type: String, index: true, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
            user: { type: mongoose.Types.ObjectId, required: true },
        }, { timestamps: true });

        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
    }
}

export default mongoose.model('Transaction', new TransactionSchema().schema);

import { NextFunction } from 'express';
import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

class WalletSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            publicKey: { type: String, isEmpty: false, trim: true, index: true, unique: true, required: true },
            seedHex: { type: String, isEmpty: false, trim: true, unique: true, required: true },
            btcAddress: { type: String, isEmpty: false, trim: true, unique: true, required: true },
            balanceInBentor: { type: String, trim: true, default: "0.00" },
            balanceInUsd: { type: String, trim: true, default: "0.00" },
            user: { type: mongoose.Types.ObjectId, required: true },
            isWalletActivated: { type: Boolean, default: false }
        }, { timestamps: true });

        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
    }
}

export default mongoose.model('Wallet', new WalletSchema().schema);

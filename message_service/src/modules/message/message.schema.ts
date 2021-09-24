import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

class MessageSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            message: { type: String, default: "" },
            from: { type: mongoose.Schema.Types.ObjectId, index: true, ref: "User", required: true },
            to: { type: mongoose.Schema.Types.ObjectId, index: true, ref: "User", required: true },
            isRead: { type: Boolean, default: false },
            chat: { type: mongoose.Schema.Types.ObjectId, index: true, ref: "Chat", required: true },
        }, { timestamps: true });
        
        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
    }
}

export default mongoose.model('Message', new MessageSchema().schema);
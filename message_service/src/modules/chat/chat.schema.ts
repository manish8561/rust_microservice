import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

class ChatSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            from: { type: mongoose.Schema.Types.ObjectId, required: true },
            to: { type: mongoose.Schema.Types.ObjectId, required: true },
            lastMsg: { type: String, default: "" },
        }, { timestamps: true });
        
        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
    }
}

export default mongoose.model('Chats', new ChatSchema().schema);
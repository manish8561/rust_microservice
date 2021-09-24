import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import Post from '../post/post.schema';
import * as Interfaces from '../../interfaces';

class QuoteSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            content: { type: String, index: true },
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
            type: { type: String, enum: ["REBENT", "QUOTE"], default: "REBENT" },
        }, { timestamps: true });

        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
        this.schema.post('save', async (_doc: Interfaces.Quote) => {
            const { _id, content, user, post, type } = _doc;
            let _post = new Post({ content, quotedPost: _id, type, user });
            await _post.save();
            /** increment count of quote and rebent in currrent post */
            if (type === "QUOTE") {
                await Post.findOneAndUpdate({ _id: post }, { $inc: { quoteCount: 1 }}, { new: false });
            } else if (type === "REBENT") {
                await Post.findOneAndUpdate({ _id: post }, { $inc: { rebentCount: 1 }}, { new: false });

            }
        });
    }
}

export default mongoose.model('Quote', new QuoteSchema().schema);

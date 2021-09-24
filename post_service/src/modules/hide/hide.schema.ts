import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import * as Interfaces from '../../interfaces';
import Post from '../post/post.schema';
import Quote from '../quote/quote.schema';

class HideSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            isPostHidden: { type: Boolean, default: false },
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
            hideFrom: { type: String, enum: ["FEED", "PROFILE"], default: "FEED" },
        }, { timestamps: true });

        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
        this.schema.post('save', async (_doc: Interfaces.Hide) => {
            const { post, user, hideFrom } = _doc;
            await Post.findOneAndUpdate({ _id: post }, { $inc: { rebentCount: -1 }}, { new: false });
            if (hideFrom === "FEED") {
                let _quotedPost: Interfaces.Quote | any =  await Quote.findOne({ post, user });
                await Post.deleteOne({ quotedPost: _quotedPost['_id'] });
                await Quote.deleteOne({ _id: _quotedPost['_id'] });
            } else if (hideFrom === "PROFILE") {
                await Post.findOneAndDelete({ quotedPost: post });
                await Quote.findOneAndDelete({ _id: post });
            }
        });
    }
}

export default mongoose.model('Hide', new HideSchema().schema);

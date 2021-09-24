import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import Post from '../post/post.schema';
import * as Interfaces from '../../interfaces';

class CommentSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            comment: { type: String, required: true },
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        }, { timestamps: true });

        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
        this.schema.post('save', async (_doc: Interfaces.Comment) => {
            const { post } = _doc;
            await Post.findOneAndUpdate({ _id: post }, { $inc: { commentsCount: 1 }}, { new: false });
        });
    }
}

export default mongoose.model('Comment', new CommentSchema().schema);

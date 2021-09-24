import mongoose, { Mongoose, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import Post from '../post/post.schema';
import * as Interfaces from '../../interfaces';

class LikeSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            isPostLiked: { type: Boolean, default: false },
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        }, { timestamps: true });

        this.schema.plugin(mongooseUniqueValidator, { type: 'mongoose-unique-validator' });
        this.schema.post('save', async (_doc: Interfaces.Like) => {
            const { isPostLiked, post } = _doc;
            await Post.findOneAndUpdate({ _id: post }, { $inc: { likesCount: isPostLiked ? 1 : -1} }, { new: false });
        });
    }
}

export default mongoose.model('Like', new LikeSchema().schema);

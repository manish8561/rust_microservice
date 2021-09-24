import mongoose from 'mongoose';
import * as Interfaces from '../../interfaces';
import QueueService from '../../services/queue.service';
import Comment from './comment.schema';
import Post from '../post/post.schema';
import { Constants } from '../../constants';
import { Helper } from '../../helpers';

const {
    Response: { errors },
    Validate: { _validations },
    ResMsg: {
        errors: { SOMETHING_WENT_WRONG, ALL_FIELDS_ARE_REQUIRED },
        post: { POST_NOT_FOUND }
    }
} = Helper;

class CommentModel {

    constructor() { }

    /**
   * @function postComment
   * @param _comment
   * @returns _comment
   */
    public async postComment(_comment: Interfaces.Comment): Promise<any> {
        try {
            const { comment, post } = _comment;
            const _errors = await _validations({ post, comment });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            const isPostExits: any = await this._isPostExits(post);
            /** return if users not matched */
            if (!isPostExits) return errors(POST_NOT_FOUND);
            /** create que for like */
            QueueService.createCommentQueue(_comment);
            return true;
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function _postComment
     * @param _comment 
     * @returns  _comment
     */
    public async _postComment(_comment: Interfaces.Comment): Promise<any> {
        try {
            const { post, user, comment } = _comment;
            let postCommented = new Comment({ comment, post, user });
            return await postCommented.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function commentsByPostId
     * @param _comment ( post )
     * @returns comments
     */
    public async commentsByPostId(_comment: Interfaces.Comment): Promise<any> {
        try {
            let { post, page, limit } = _comment;
            page = String(page); /** convert to string for validation check */
            limit = String(limit) || Constants.PAGE_LIMIT;

            const _errors = await _validations({ post, page, limit });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            page = Number(page); /** convert string to number */
            limit = Number(limit);
                /** return list of comments on a particular post id */
            return await Comment.find({ post }).sort({ createdAt: -1 }).skip(page * (limit)).limit(limit).populate("user", "username image fullName user _id");
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function _isPostExits
     * @param post 
     * @param user 
     * @returns 
     */
    private async _isPostExits(post: mongoose.Schema.Types.ObjectId): Promise<any> {
        return await Post.findById(post);
    }

}

export default new CommentModel();
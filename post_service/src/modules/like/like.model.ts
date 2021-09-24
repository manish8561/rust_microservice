import * as Interfaces from '../../interfaces';
import QueueService from '../../services/queue.service';
import mongoose from 'mongoose';
import Like from './like.schema';
import { Helper } from '../../helpers';

const {
    Response: { errors },
    Validate: { _validations },
    ResMsg: {
        errors: { SOMETHING_WENT_WRONG, ALL_FIELDS_ARE_REQUIRED },
    }
} = Helper;

class LikeModel {

    constructor() { }

    /**
   * @function likeUnlikePost
   * @param _like
   * @returns like/dislike
   */
    public async likeUnlikePost(_like: Interfaces.Like): Promise<any> {
        try {
            const { post } = _like;
            const _errors = await _validations({ post });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            /** create que for like */
            QueueService.createLikeQueue(_like);
            return true;
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function likePost
     * @param _like 
     * @returns 
     */
    public async _likeUnlikePost(_like: Interfaces.Like): Promise<any> {
        try {
            const { post, user } = _like;
            const likedPost: Interfaces.Like | any = await this._isPostExits(post, user);
            if (likedPost) {
                likedPost.isPostLiked = likedPost.isPostLiked ? false : true;
                return await likedPost.save();
            }

            let likePost = new Like({ isPostLiked: true, post, user });
            return await likePost.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
    * @function likesOnPost
    * @param _like ( post )
    * @returns likes on post
    */
    public async likesOnPost(_like: Interfaces.Like): Promise<any> {
        try {
            const { post } = _like;
            const _errors = await _validations({ post });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            /** return list of likes on a particular post id */
            return await Like.find({ post }).populate("user", "username image fullName");
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
    private async _isPostExits(post: mongoose.Types.ObjectId, user: mongoose.Types.ObjectId): Promise<any> {
        return await Like.findOne({ post, user });
    }

}

export default new LikeModel();
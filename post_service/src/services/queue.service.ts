    import { Helper } from '../helpers';
import * as Interfaces from '../interfaces';

class QueueService {

    private _commentModel: any = Object.create({});
    private _likeModel: any = Object.create({});
    private _userModel: any = Object.create({});
    private _quoteModel: any = Object.create({});
    private _postModel: any = Object.create({});

    constructor() {
        setTimeout( async () => {
            this._commentModel = (await import("../modules/comment/comment.model")).default;
            this._likeModel = (await import("../modules/like/like.model")).default;
            this._userModel = (await import("../modules/user/user.model")).default;
            this._quoteModel = (await import("../modules/quote/quote.model")).default;
            this._postModel = (await import("../modules/post/post.model")).default;
        }, 1000);
    }

    /**
     * @function createPostQueue
     * @param _post 
     * @returns 
     */
    public createPostQueue(_post: Interfaces.Post) {
        Helper.RabbitMq.createPostQueue(_post);
    }

    /**
     * @function consumePostQueueToCreatePost
     * @param _post 
     */
    public async consumePostQueueToCreatePost(_post: Interfaces.Post) {
        const result = await this._postModel._createPost(_post);
        if (result.errors) return console.log('\n \n Post:: Failed to create post', result);
        console.log('\n \n Post has been created successfully..!!', result['user'], "=>", result['_id'], '\n');
    }

    /**
     * @function createLikeQueue
     * @param _like 
     */
    public createLikeQueue(_like: Interfaces.Like) {
        Helper.RabbitMq.createLikeQueue(_like);
    }

    /**
     * @function consumeLikeQueueToLikePost
     * @param _like 
     */
    public async consumeLikeQueueToLikePost(_like: Interfaces.Like) {
        const result = await this._likeModel._likeUnlikePost(_like);
        if (result.errors) return console.log('\n \n Like:: Failed to like post', result);
        console.log('\n \n Post has been liked or unliked successfully..!!', result['user'], " => ", result['post'], " => ", result['_id'], '\n');
    }

    /**
     * @function createLikeQueue
     * @param _comment 
     */
    public createCommentQueue(_comment: Interfaces.Comment) {
        Helper.RabbitMq.createCommentQueue(_comment);
    }

    /**
     * @function consumeCommentQueueToPostComment
     * @param _comment 
     */
    public async consumeCommentQueueToPostComment(_comment: Interfaces.Comment) {
        const result = await this._commentModel._postComment(_comment);
        if (result.errors) return console.log('\n \n Like:: Failed to like post', result);
        console.log('\n \n Post has been liked or unliked successfully..!!', result['user'], " => ", result['post'], " => ", result['_id'], '\n');
    }

    /**
     * @function consumeUserQueueToCreateUserinPostDB
     * @param _user 
     * @returns result
     */
    public async consumeUserQueueToCreateUserinPostDB(_user: Interfaces.User) {
        const result = await this._userModel.createUserInPostDB(_user);
        if (result.errors) return console.log('\n \n User:: Failed to create User', result);
        console.log('\n \n User has been created successfully..!!', result['user'], " => ", result['_id'], '\n');
    }

    /**
    * @function createQuoteQueue
    * @param _like 
    */
    public createQuoteQueue(_quote: Interfaces.Quote) {
        Helper.RabbitMq.createQuoteQueue(_quote);
    }

    /**
     * @function consumeUserQueueToCreateUserinPostDB
     * @param _user 
     * @returns result
     */
    public async consumeQuoteQueueToCreateQuoteInPost(_quote: Interfaces.Quote) {
        const result = await this._quoteModel._createQuotePost(_quote);
        if (result.errors) return console.log('\n \n User:: Failed to create Qoute', result);
        console.log('\n \n Quote has been created successfully..!!', result['user'], " => ", result['post'], " => ", result['_id'], '\n');
    }

    /**
     * @function consumeFollowedQueueToAddDataInUserSchema
     * @param _followed 
     * @returns result
     */
    public async consumeFollowedQueueToAddDataInUser(_followed: Interfaces.Follow) {
        const result = await this._userModel.consumeFollowedQueueToAddDataInUser(_followed);
        if (result.errors) return console.log('\n \n User:: Failed to Follow/Unfollow user', result);
        console.log('\n \n Followed/Unfollowed data has been added in user document', result['user'], " => ", result['followings'], " => ", result['_id'], '\n');
    }

    /**
     * @function consumeQueueToRmoveFollowOnBlock
     * @param _block 
     * @returns result
     */
    public async consumeQueueToRmoveFollowOnBlock(_block: Interfaces.Block) {
        const result = await this._userModel.consumeQueueToRmoveFollowOnBlock(_block);
        if (result.errors) {
            return console.log('\n \n User:: Failed to remove user on block', result);
        } else if (!result) {
            return console.log('\n \n User:: Did not found any user in user table', result);
        } else {
            console.log('\n \n', result, ' => ', result === "BLOCK" ? "User Blocked" : "User Unblocked", '\n');
        }
    }

    /**
     * @function consumeQueueToUpdateUser
     * @param _user 
     * @returns updated user
     */
    public async consumeQueueToUpdateUser(_user: Interfaces.User) {
        const result = await this._userModel.consumeQueueToUpdateUser(_user);
        if (result.errors) return console.log('\n \n User:: Failed to update user', result);
        console.log('\n \n Profile Updated', result['user'], " => ", result['username'], '\n');
    }


}

export default new QueueService();
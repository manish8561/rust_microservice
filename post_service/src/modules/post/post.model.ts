import * as Interfaces from '../../interfaces';
import QueueService from '../../services/queue.service';
import Post from './post.schema';
import Like from '../like/like.schema';
import Quote from '../quote/quote.schema';
import { Constants } from '../../constants';
import mongoose from 'mongoose';
import { Helper } from '../../helpers';
import S3Service from '../../services/s3.service';
import UserModel from '../user/user.model';

const {
    Response: { errors },
    Validate: { _validations },
    ResMsg: {
        errors: { SOMETHING_WENT_WRONG, ALL_FIELDS_ARE_REQUIRED },
        user: { UPDATE_PROFILE_ERROR },
        post: { USER_UNMATCHED, POST_NOT_FOUND, FILE_IS_REQUIRED }
    }
} = Helper;

class PostModel {

    constructor() { }

    /**
   * @function getPublicPosts
   * @param query 
   * @returns list of posts
   */
    public async getPublicPosts(data: Interfaces.Post): Promise<any> {
        try {
            let { page, limit, user } = data;
            page = page.toString();
            limit = limit.toString();

            const _errors = await _validations({ page });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            page = Number(page);
            limit = Number(limit) || Constants.PAGE_LIMIT;

            /** get user followings array to return followrs post */
            const _isUser: Interfaces.User = await UserModel.getUserWIthId(user);
            const { followings, blockUsers } = _isUser;

            const query: any[] = [
                { $match: { user: { $nin: blockUsers }, $or: [ { type: "POST" }, { type: "QUOTE"}] }},
                { $limit: limit },
                { $skip: page * (limit) },
                { $sort: { createdAt: -1 } },
                {
                    $lookup: {
                        from: 'likes', let: { "postId": "$_id" }, pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$post", "$$postId"] },
                                            { $eq: ["$user", mongoose.Types.ObjectId(user)] },
                                        ]
                                    }
                                }
                            },
                            { $project: { "isPostLiked": 1 } }],
                        as: "isPostLiked"
                    }
                },
                { $unwind: { path: "$isPostLiked", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'quotes', let: { "postId": "$_id" }, pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$post", "$$postId"] },
                                            { $eq: ["$user", mongoose.Types.ObjectId(user)] },
                                        ]
                                    }
                                }
                            },
                            { $project: { "type": 1 } }],
                        as: "isPostQuoted"
                    }
                },
                { $unwind: { path: "$isPostQuoted", preserveNullAndEmptyArrays: true } },
                {
                    /** Multi level populated data using lookup aggregate */
                    $lookup: {
                        from: 'quotes', let: { "quoteId": "$quotedPost" }, /** Post.quotedPost */
                        pipeline: [
                            /** creating a pipeline for nested populate data */
                            { $match: { $expr: { $eq: ["$_id", "$$quoteId"] } } }, /** compare quotes doc _id with post.quotedPost */
                            { $project: { "user": 1, "post": 1 } },
                            {
                                $lookup: {
                                    from: 'users', let: { "userId": "$user" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, /** compare user doc _id with quotes.user */
                                        { $project: { "username": 1, "isProfileUpdated": 1, "image": 1 } }
                                    ]
                                    , as: 'user'
                                }
                            },
                            /** unwind document [] => {} */
                            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                            {
                                $lookup: {
                                    from: 'posts', let: { "postId": "$post" }, /** quote.post (id) */
                                    pipeline: [
                                        /** compare post doc._id with quote.post */
                                        { $match: { $expr: { $eq: ["$_id", "$$postId"] } } },
                                        { $project: { "content": 1, "embedLink": 1, "embedType": 1, "image": 1, "user": 1 } },
                                        {
                                            $lookup: {
                                                from: 'users',
                                                let: { "userId": "$user" },
                                                pipeline: [
                                                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, /** compare user doc _id with post.user */
                                                    { $project: { "username": 1, "isProfileUpdated": 1, "image": 1 , "user": 1} }
                                                ]
                                                , as: 'user'
                                            }
                                        },
                                        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }
                                    ],
                                    as: 'post'
                                }
                            },
                            { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
                        ],
                        as: 'quote',
                    }
                },
                { $unwind: { path: "$quote", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        let: { "userId": "$user" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, /** compare user doc _id with post.user */
                            {
                                $project: {
                                    "followings": { $filter: { input: followings, as: "follow", cond: { $eq: ["$$follow", "$_id"] } } },
                                    "username": 1, "isProfileUpdated": 1, "image": 1, "user": 1
                                }
                            }
                        ]
                        , as: "user"
                    }
                },
                { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                { $project: { "_id": 1, "isPostQuoted": 1, "isPostLiked": 1, "commentsCount": 1, "content": 1, "image": 1, "embedLink": 1, "embedType": 1, "quote": 1, "type": 1, "user": 1, "followed": 1, "likesCount": 1, "rebentCount": 1 } },
            ];

            return await Post.aggregate(query);
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
  * @function getFollowedPosts
  * @param query 
  * @returns list of Followed posts
  */
    public async getFollowedPosts(data: Interfaces.Post): Promise<any> {
        const { ResMsg: {
            errors: { ALL_FIELDS_ARE_REQUIRED, SOMETHING_WENT_WRONG }
        } } = Helper;

        try {
            let { page, limit, user } = data;
            page = page.toString();
            limit = limit.toString();

            const _errors = await _validations({ page });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            page = Number(page);
            limit = Number(limit) || Constants.PAGE_LIMIT;

            /** get user followings array to return followrs post */
            const _isUser: Interfaces.User = await UserModel.getUserWIthId(user);
            const { followings } = _isUser;

            const query: any[] = [
                { $match: { user: { $in: followings }, $or: [ { type: "POST" }, { type: "QUOTE" }] }},
                { $limit: limit },
                { $skip: page * (limit) },
                { $sort: { createdAt: -1 } },
                {
                    $lookup: {
                        from: 'likes', let: { "postId": "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$post", "$$postId"] },
                                            { $eq: ["$user", mongoose.Types.ObjectId(user)] },
                                        ]
                                    }
                                }
                            },
                            { $project: { "isPostLiked": 1 } }
                        ],
                        as: "isPostLiked"
                    }
                },
                { $unwind: { path: "$isPostLiked", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'quotes', let: { "postId": "$_id" }, pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$post", "$$postId"] },
                                            { $eq: ["$user", mongoose.Types.ObjectId(user)] },
                                        ]
                                    }
                                }
                            },
                            { $project: { "type": 1 } }],
                        as: "isPostQuoted"
                    }
                },
                { $unwind: { path: "$isPostQuoted", preserveNullAndEmptyArrays: true } },
                {
                    /** Multi level populated data using lookup aggregate */
                    $lookup: {
                        from: 'quotes', let: { "quoteId": "$quotedPost" }, /** Post.quotedPost */
                        pipeline: [
                            /** creating a pipeline for nested populate data */
                            { $match: { $expr: { $eq: ["$_id", "$$quoteId"] } } }, /** compare quotes doc _id with post.quotedPost */
                            { $project: { "user": 1, "post": 1 } },
                            {
                                $lookup: {
                                    from: 'users', let: { "userId": "$user" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, /** compare user doc _id with quotes.user */
                                        { $project: { "username": 1, "isProfileUpdated": 1, "image": 1 } }
                                    ]
                                    , as: 'user'
                                }
                            },
                            /** unwind document [] => {} */
                            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                            {
                                $lookup: {
                                    from: 'posts', let: { "postId": "$post" }, /** quote.post (id) */
                                    pipeline: [
                                        /** compare post doc._id with quote.post */
                                        { $match: { $expr: { $eq: ["$_id", "$$postId"] } } },
                                        { $project: { "content": 1, "embedLink": 1, "embedType": 1, "image": 1, "user": 1 } },
                                        {
                                            $lookup: {
                                                from: 'users',
                                                let: { "userId": "$user" },
                                                pipeline: [
                                                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, /** compare user doc _id with post.user */
                                                    { $project: { "username": 1, "isProfileUpdated": 1, "image": 1 } }
                                                ]
                                                , as: 'user'
                                            }
                                        },
                                        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }
                                    ],
                                    as: 'post'
                                }
                            },
                            { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
                        ],
                        as: 'quote',
                    }
                },
                { $unwind: { path: "$quote", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        let: { "userId": "$user" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, /** compare user doc _id with post.user */
                            {
                                $project: {
                                    "followings": { $filter: { input: followings, as: "follow", cond: { $eq: ["$$follow", "$_id"] } } },
                                    "username": 1, "isProfileUpdated": 1, "image": 1, "user": 1
                                }
                            }
                        ]
                        , as: "user"
                    }
                },
                { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                { $project: { "_id": 1, "isPostQuoted": 1, "isPostLiked": 1, "commentsCount": 1, "content": 1, "image": 1, "embedLink": 1, "embedType": 1, "quote": 1, "type": 1, "user": 1, "likesCount": 1, "rebentCount": 1 } },
            ];

            return await Post.aggregate(query);
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

      /**
  * @function getUserPosts
  * @param query 
  * @returns list of user posts
  */
       public async getUserPosts(data: Interfaces.Post): Promise<any> {
        const { ResMsg: {
            errors: { ALL_FIELDS_ARE_REQUIRED, SOMETHING_WENT_WRONG }
        } } = Helper;

        try {
            let { page, limit, user } = data;
            page = page.toString();
            limit = limit.toString();

            const _errors = await _validations({ page });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            page = Number(page);
            limit = Number(limit) || Constants.PAGE_LIMIT;

            /** get user followings array to return followrs post */
            const _isUser: Interfaces.User = await UserModel.getUserWIthUserId(user);

            const query: any[] = [
                { $match: { user: _isUser['_id'] }},
                { $limit: limit },
                { $skip: page * (limit) },
                { $sort: { createdAt: -1 } },
                {
                    $lookup: {
                        from: 'likes', let: { "postId": "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$post", "$$postId"] },
                                            { $eq: ["$user", mongoose.Types.ObjectId(user)] },
                                        ]
                                    }
                                }
                            },
                            { $project: { "isPostLiked": 1 } }
                        ],
                        as: "isPostLiked"
                    }
                },
                { $unwind: { path: "$isPostLiked", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'quotes', let: { "postId": "$_id" }, pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$post", "$$postId"] },
                                            { $eq: ["$user", mongoose.Types.ObjectId(user)] },
                                        ]
                                    }
                                }
                            },
                            { $project: { "type": 1 } }],
                        as: "isPostQuoted"
                    }
                },
                { $unwind: { path: "$isPostQuoted", preserveNullAndEmptyArrays: true } },
                {
                    /** Multi level populated data using lookup aggregate */
                    $lookup: {
                        from: 'quotes', let: { "quoteId": "$quotedPost" }, /** Post.quotedPost */
                        pipeline: [
                            /** creating a pipeline for nested populate data */
                            { $match: { $expr: { $eq: ["$_id", "$$quoteId"] } } }, /** compare quotes doc _id with post.quotedPost */
                            { $project: { "user": 1, "post": 1 } },
                            {
                                $lookup: {
                                    from: 'users', let: { "userId": "$user" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, /** compare user doc _id with quotes.user */
                                        { $project: { "username": 1, "isProfileUpdated": 1, "image": 1 } }
                                    ]
                                    , as: 'user'
                                }
                            },
                            /** unwind document [] => {} */
                            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                            {
                                $lookup: {
                                    from: 'posts', let: { "postId": "$post" }, /** quote.post (id) */
                                    pipeline: [
                                        /** compare post doc._id with quote.post */
                                        { $match: { $expr: { $eq: ["$_id", "$$postId"] } } },
                                        { $project: { "content": 1, "embedLink": 1, "embedType": 1, "image": 1, "user": 1 } },
                                        {
                                            $lookup: {
                                                from: 'users',
                                                let: { "userId": "$user" },
                                                pipeline: [
                                                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, /** compare user doc _id with post.user */
                                                    { $project: { "username": 1, "isProfileUpdated": 1, "image": 1 } }
                                                ]
                                                , as: 'user'
                                            }
                                        },
                                        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }
                                    ],
                                    as: 'post'
                                }
                            },
                            { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
                        ],
                        as: 'quote',
                    }
                },
                { $unwind: { path: "$quote", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        let: { "userId": "$user" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, /** compare user doc _id with post.user */
                            {
                                $project: { "username": 1, "isProfileUpdated": 1, "image": 1, "user": 1 }
                            }
                        ]
                        , as: "user"
                    }
                },
                { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                { $project: { "_id": 1, "isPostQuoted": 1, "isPostLiked": 1, "commentsCount": 1, "content": 1, "image": 1, "embedLink": 1, "embedType": 1, "quote": 1, "type": 1, "user": 1, "likesCount": 1, "rebentCount": 1 } },
            ];

            return await Post.aggregate(query);
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function createPost
     * @param _post 
     * @returns 
     */
    public async createPost(_post: Interfaces.Post): Promise<any> {
        try {
            const { content, user } = _post;
            const _errors = await _validations({ content });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            /** check if profile has been updated */
            const { isProfileUpdated } = await UserModel.getUserWIthId(user);
            if (!isProfileUpdated) return errors(UPDATE_PROFILE_ERROR);

            /** create a post queue */
            QueueService.createPostQueue(_post);
            return true;
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function createPost
     * @param post 
     * @returns post
     */
    public async _createPost(_post: Interfaces.Post): Promise<any> {
        try {
            /** creating a post using data from queue */
            const { content, image, user, embedLink, embedType } = _post;
            const post = new Post({ content, image, user, embedLink, embedType });
            return await post.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /** 
     * @function updatePost
     * @param _post
     * @returns updated post
     */
    public async updatePost(_post: Interfaces.Post) {
        try {
            const { _id, user, content, image } = _post;
            const _errors = await _validations({ _id });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            const post: Interfaces.Post | any = await Post.findById(_id);
            /** return if users not matched */
            if (!post) return errors(POST_NOT_FOUND);
            /** update a post if creators matched */
            if (post.user !== user) return errors(USER_UNMATCHED);

            post.content = content;
            post.image = image;
            return await post.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /** 
     * @function deletePost
     * @param _post
     * @returns deleted post
     */
    public async deletePost(_post: Interfaces.Post) {
        try {
            const { _id, user } = _post;
            const _errors = await _validations({ _id });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            const post: Interfaces.Post | any = await Post.findById(_id);
            if (!post) return errors(POST_NOT_FOUND);
            /** update a post if creators matched */
            if (post.user !== user) return errors(USER_UNMATCHED);
            post.isPostDeleted = true;
            return await post.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function postDetails
     * @param _post '
     * @returns post
     */
    public async postDetails(_post: Interfaces.Post): Promise<any> {
        try {
            const { _id, user } = _post;
            const _errors = await _validations({ _id });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);
            
            /** initial object */
            const result = Object.create({});
            
            /** Post Detail - like, quote, post */
            const isPostLiked = await Like.findOne({ post: _id, user });
            const isPostQuoted = await Quote.findOne({ post: _id, user });
            const post: Interfaces.Post | any = await Post.findById(_id, { _id: 1, content: 1, image: 1, type: 1, user: 1, quotedPost: 1, createdAt: 1, updatedAt: 1, embedLink: 1, embedType: 1, likesCount: 1, rebentCount: 1, commentsCount: 1 }).populate([
                {
                    path: "quotedPost", /** Populate User data */
                    select: "_id post user",
                    model: "Quote",
                    populate: [
                        {
                            path: "post", /** Populate User data */
                            select: "_id content image type",
                            model: "Post",
                        },
                        {
                            path: "user", /** Populate User data */
                            select: "_id username isProfileUpdated image",
                            model: "User",
                        }
                    ]
                },
                {
                    path: "user", /** Populate User data */
                    select: "_id isProfileUpdated username image",
                    model: "User",
                }
            ]);

            /** set default if there is no values */
              result.post = post;   
              result.isLiked = isPostLiked;   
              result.isQuoted = isPostQuoted;   
            return result;
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function uploadFile
     * @param _post 
     * @returns 
     */
    public async uploadFile(_file: File, _id: mongoose.Schema.Types.ObjectId): Promise<any> {
        try {
            if (_file) {
                const s3Res = await S3Service.uploadFileToS3Bucket(_file, _id);
                if (s3Res.Location) {
                    return s3Res;
                }
            }

            /** return if users not matched */
            return errors(FILE_IS_REQUIRED);
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

}

export default new PostModel();
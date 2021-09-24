import { NextFunction, Request, Response, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import TransformRequestUser from "../../middlewares/user.middleware";
import PostModel from "./post.model";

const {
    Response: { _error, _success },
    ResMsg: {
        post: {
            FETCHED_POSTS,
            FETCHED_POST,
            FILE_UPLOADED,
            POST_DELETED,
            FETCHED_FOLLOWED_POSTS,
            POST_UPDATED,
            POST_SUCCESS,
            FETCHED_USERS_POSTS
        }
    }
} = Helper;

class PostController implements Interfaces.Controller {
    public path = '/post';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/getPublicPosts`, ValidateJWT, TransformRequestUser, this.getPublicPosts)
            .post(`${this.path}/getFollowedPosts`, ValidateJWT, TransformRequestUser, this.getFollowedPosts)
            .post(`${this.path}/getUserPosts`, ValidateJWT, TransformRequestUser, this.getUserPosts)
            .post(`${this.path}/createPost`, ValidateJWT, TransformRequestUser, this.createPost)
            .post(`${this.path}/updatePost`, ValidateJWT, TransformRequestUser, this.updatePost)
            .post(`${this.path}/deletePost`, ValidateJWT, TransformRequestUser, this.deletePost)
            .post(`${this.path}/postDetails`, ValidateJWT, TransformRequestUser, this.postDetails)
            .post(`${this.path}/uploadFile`, ValidateJWT, TransformRequestUser, this.uploadFile)
    }

    /**
   * @api getPublicPosts
   * @param req 
   * @param res 
   * @param next 
   * @returns list of posts
   */
    private async getPublicPosts(req: Request | any, res: Response, next: NextFunction) {
        try {
            let query: Interfaces.Post = req.body;
            const { _id } = req.user;
            query.user = _id;
            let result: any = await PostModel.getPublicPosts(query);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            result = { posts: result };
            /** return seccess - registered user */
            return _success(res, { message: FETCHED_POSTS, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

 /**
  * @api getFollowedPosts
  * @param req 
  * @param res 
  * @param next 
  * @returns list of posts
  */
    private async getFollowedPosts(req: Request | any, res: Response, next: NextFunction) {
        try {
            let query: Interfaces.Post = req.body;
            const { _id } = req.user;
            query.user = _id;
            let result: any = await PostModel.getFollowedPosts(query);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            /** return seccess - registered user */
            result = { posts: result };
            return _success(res, { message: FETCHED_FOLLOWED_POSTS, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

    /**
    * @api getUserPosts
    * @param req 
    * @param res 
    * @param next 
    * @returns list of posts
    */
    private async getUserPosts(req: Request | any, res: Response, next: NextFunction) {
        try {
            let query: Interfaces.Post = req.body;
            let result: any = await PostModel.getUserPosts(query);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            /** return seccess - registered user */
            result = { posts: result };
            return _success(res, { message: FETCHED_USERS_POSTS, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

    /**
     * @api createPost
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    private async createPost(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _post: Interfaces.Post = req.body;
            const { _id } = req.user;
            _post.user = _id; /** adding user id to incoming post object */
            const result: any = await PostModel.createPost(_post);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            /** return seccess - registered user */
            return _success(res, { message: POST_SUCCESS });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

    /**
     * @api updatePost
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    private async updatePost(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _post: Interfaces.Post = req.body;
            const { _id } = req.user;
            _post.user = _id; /** adding user id to incoming post object */
            const result: any = await PostModel.updatePost(_post);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            /** return seccess - registered user */
            return _success(res, { message: POST_UPDATED });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

    /**
     * @api updatePost
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    private async deletePost(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _post: Interfaces.Post = req.body;
            const { _id } = req.user;
            _post.user = _id; /** adding user id to incoming post object */
            const result: any = await PostModel.deletePost(_post);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            /** return seccess - registered user */
            return _success(res, { message: POST_DELETED });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

    /**
    * @api postDetails
    * @param req 
    * @param res 
    * @param next 
    * @returns User
    */
    private async postDetails(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _post: Interfaces.Post = req.body;
            const { _id } = req.user;
            _post.user = _id; /** adding user id to incoming post object */

            const result: any = await PostModel.postDetails(_post);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            /** return seccess - registered user */
            return _success(res, { message: FETCHED_POST, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

    /**
    * @api uploadFile
    * @param req 
    * @param res 
    * @param next 
    * @returns User
    */
    private async uploadFile(req: Request | any, res: Response, next: NextFunction) {
        try {
            const file: File = req.file;
            const { _id } = req.user;
            let result: any = await PostModel.uploadFile(file, _id);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            result = { image: result };
            /** return seccess - registered user */
            return _success(res, { message: FILE_UPLOADED, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }


}

export default PostController;
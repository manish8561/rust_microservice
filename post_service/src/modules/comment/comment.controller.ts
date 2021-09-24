import { NextFunction, Request, Response, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import TransformRequestUser from "../../middlewares/user.middleware";
import CommentModel from "./comment.model";

const {
    Response: { _error, _success },
    ResMsg: {
        post: { POST_COMMENT_SUCCESS, FETCHED_COMMENTS }
    }
} = Helper;

class CommentController implements Interfaces.Controller {
    public path = '/comment';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/postComment`, ValidateJWT, TransformRequestUser, this.postComment)
            .post(`${this.path}/commentsByPostId`, ValidateJWT, TransformRequestUser, this.commentsByPostId)
    } 

    /**
     * @api postComment
     * @param req 
     * @param res 
     * @param next 
     * @returns create a comment on post
     */
    private async postComment(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _comment: Interfaces.Comment = req.body;
            const { _id } = req.user;
            _comment.user = _id; /** adding user id to incoming post object */

            const result: any = await CommentModel.postComment(_comment);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            /** return seccess - registered user */
            return _success(res, { message: POST_COMMENT_SUCCESS });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

    /**
     * @api commentsByPostId
     * @param req 
     * @param res 
     * @param next 
     * @returns  list of comments on Post
     */
     private async commentsByPostId(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _comment: Interfaces.Comment = req.body;
            const { _id } = req.user;
            _comment.user = _id; /** adding user id to incoming post object */

            let result: any = await CommentModel.commentsByPostId(_comment);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            result = { comments: result };
            /** return seccess - registered user */
            return _success(res, { message: FETCHED_COMMENTS, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

}

export default CommentController;
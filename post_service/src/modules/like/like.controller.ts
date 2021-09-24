import { NextFunction, Request, Response, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import TransformRequestUser from "../../middlewares/user.middleware";
import LikeModel from "./like.model";

const {
    Response: { _error, _success },
    ResMsg: {
        post: { LIKE_POST, FETCHED_LIKES }
    }
} = Helper;

class LikeController implements Interfaces.Controller {
    public path = '/like';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/likeUnlikePost`, ValidateJWT, TransformRequestUser, this.likeUnlikePost)
            .post(`${this.path}/likesOnPost`, ValidateJWT, TransformRequestUser, this.likesOnPost)
    } 

    /**
     * @api createPost
     * @param req 
     * @param res 
     * @param next 
     * @returns like/dislike post
     */
    private async likeUnlikePost(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _like: Interfaces.Like = req.body;
            const { _id } = req.user;
            _like.user = _id; /** adding user id to incoming post object */

            const result: any = await LikeModel.likeUnlikePost(_like);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            /** return seccess - registered user */
            return _success(res, { message: LIKE_POST });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

        /**
     * @api likesOnPost
     * @param req 
     * @param res 
     * @param next 
     * @returns  list of likes on Post
     */
         private async likesOnPost(req: Request | any, res: Response, next: NextFunction) {
            try {
                let _like: Interfaces.Like = req.body;
                const { _id } = req.user;
                _like.user = _id; /** adding user id to incoming post object */

                let result: any = await LikeModel.likesOnPost(_like);
                /** return error - failed status */
                if (result.errors) return _error(res, { status: 400, error: result });
                result = { likes: result };
                /** return seccess - registered user */
                return _success(res, { message: FETCHED_LIKES, data: result });
            } catch (error) {
                return _error(res, { status: 400, error });
            }
        }
    
}

export default LikeController;
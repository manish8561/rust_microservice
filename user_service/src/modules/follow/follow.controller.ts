import { NextFunction, Request, Response, Router } from "express";
import * as Helpers from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import FollowModel from './follow.model';

const {
    Response: { _error, _success },
    ResMsg: { 
        follow: { FOLLOWED_USER, FETCHED_FOLLOW_REQ_LIST, UNFOLLOW_USER, FOLLOWED_BACK } 
    } 
} = Helpers;

class FollowController implements Interfaces.Controller {
    public path = '/follow';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/followUnfollowUser`, ValidateJWT, this.followUnfollowUser)
            .post(`${this.path}/followingsList`, ValidateJWT, this.followingsList)
            .post(`${this.path}/followersList`, ValidateJWT, this.followersList)
            
    }

    /**
     * @api followUnfollowUser
     * @param req 
     * @param res 
     * @param next 
     * @returns Follow/Unfollow user
     */
    public async followUnfollowUser(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _follow: Interfaces.Follow = req.body;
            const { _id } = req.user;
            _follow.follower = _id;

            const result = await FollowModel.followUnfollowUser(_follow);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            /** return seccess - registered user */
            return _success(res, { message: (result.type === "FOLLOW") || (result.type === "FOLLOWED") ? FOLLOWED_USER : result.type === "UNFOLLOW" ? UNFOLLOW_USER : FOLLOWED_BACK });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    };

    /**
     * @api followingsList
     * @param req 
     * @param res 
     * @param next 
     * @returns list of followers request
     */
    public async followingsList(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _follow: Interfaces.Follow = req.body;
            let result = await FollowModel.followingsList(_follow);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            result = { followings: result };
            /** return seccess - registered user */
            return _success(res, { message: FETCHED_FOLLOW_REQ_LIST, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    };

    /**
     * @api followersList
     * @param req 
     * @param res 
     * @param next 
     * @returns list of followers request
     */
     public async followersList(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _follow: Interfaces.Follow = req.body;
            let result = await FollowModel.followersList(_follow);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            result = { followers: result };
            /** return seccess - registered user */
            return _success(res, { message: FETCHED_FOLLOW_REQ_LIST, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    };
    

}

export default FollowController;
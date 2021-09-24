import { NextFunction, Request, Response, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import TransformRequestUser from "../../middlewares/user.middleware";
import HideModel from "./hide.model";

const {
    Response: { _error, _success },
    ResMsg: {
        post: { POST_HIDE_SUCCESS }
    }
} = Helper;

class HideController implements Interfaces.Controller {
    public path = '/hide';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/hidePost`, ValidateJWT, TransformRequestUser, this.hidePost)
    } 

    /**
     * @api hidePost
     * @param req 
     * @param res 
     * @param next 
     * @returns hide post
     */
    private async hidePost(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _hide: Interfaces.Hide = req.body;
            const { _id } = req.user;
            _hide.user = _id; /** adding user id to incoming post object */

            const result: any = await HideModel.hidePost(_hide);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            /** return seccess - registered user */
            return _success(res, { message: POST_HIDE_SUCCESS });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

}

export default HideController;
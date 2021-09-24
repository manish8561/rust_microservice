import { NextFunction, Request, Response, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import TransformRequestUser from "../../middlewares/user.middleware";
import ReportModel from "./report.model";

const {
    Response: { _error, _success },
    ResMsg: {
        post: { POST_REPORT_SUCCESS }
    }
} = Helper;

class ReportController implements Interfaces.Controller {
    public path = '/report';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/reportPost`, ValidateJWT, TransformRequestUser, this.reportPost)
    } 

    /**
     * @api reportPost
     * @param req 
     * @param res 
     * @param next 
     * @returns report post
     */
    private async reportPost(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _report: Interfaces.Report = req.body;
            
            const { _id } = req.user;
            _report.user = _id; /** adding user id to incoming post object */

            const result: any = await ReportModel.reportPost(_report);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });
            /** return success - registered user */
            return _success(res, { message: POST_REPORT_SUCCESS });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

}

export default ReportController;
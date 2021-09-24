import { NextFunction, Request, Response, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import TransactionModel from "./transaction.model";

class TransactionController implements Interfaces.Controller {
    public path = '/transaction';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            // .post(`${this.path}/createPostTransaction`, ValidateJWT, this.createPostTransaction)
    }

}

export default TransactionController;
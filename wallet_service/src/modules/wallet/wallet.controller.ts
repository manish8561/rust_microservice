import { NextFunction, Request, Response, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';

class WalletController implements Interfaces.Controller {
    public path = '/wallet';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            // .post(`${this.path}/getUserWallet`, this.createPost)
    }


}

export default WalletController;
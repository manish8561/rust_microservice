import http from "http";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import { Helper } from "./helpers";
import * as Interfaces from './interfaces';
import multer from "multer";
const debug = require("debug")("node");

class App {

    private app: express.Application;
    private server: http.Server;
    private port: number | string | boolean;

    constructor(controllers: Interfaces.Controller[]) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.port = this.normalizePort(process.env.PORT! || "3003");
        this.initMiddleware();
        this.initControllers(controllers);
    };

    /**
     * @function initMiddlewares
     */
    private initMiddleware = () => {
        this.app.set("port", this.port);
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(multer().single('file'));
    };

    /**
     * @function initControllers
     * @param controllers 
     */
    private initControllers = (controllers: Interfaces.Controller[]) => {
        controllers.forEach((controller: Interfaces.Controller) => {
            this.app.use("/v1/posts", controller.router);
        });

        /** To check if server is running */
        this.app.use("/v1/posts/status", (req: express.Request, res: express.Response, next: express.NextFunction) => {
            return Helper.Response._success(res, { isSuccess: true, results: { message: `Service running on Port ${this.port}.` } });
        })
    };

    /**
     * @function createServer
     */
    public startServer = () => {
        this.server.on("error", this.onError);
        this.server.on("listening", this.onListening);
        this.server.listen(this.port);
    };

    /** 
     * @function onListener
     */
    private onListening = () => {
        const addr = this.server.address();
        const bind = typeof addr === "string" ? "pipe " + addr : "port " + this.port;
        debug("Listening on " + bind);
        console.log("Post service listening on " + bind);
    };

    /**
     * @function normalizePort
     * @param value 
     * @returns 
     */
    private normalizePort = (ports: any) => {
        let port: number = parseInt(ports, 10);

        if (isNaN(port)) {
            return port;
        }

        if (port >= 0) {
            return port;
        }

        return false;
    };

    /**
     * @function onError
     * @param error 
     */
    private onError = (error: any) => {
        if (error.syscall !== "listen") {
            throw error;
        }

        const addr = this.server.address();
        const bind = typeof addr === "string" ? "pipe " + addr : "port " + this.port;
        switch (error.code) {
            case "EACCES":
                console.error(bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    };

}

export default App;
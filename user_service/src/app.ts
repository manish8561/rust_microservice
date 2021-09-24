import http from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import * as Helpers from "./helpers";
import * as Interfaces from './interfaces';
import swaggerUi from 'swagger-ui-express';
import 'graphql-import-node';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import Event from '../modules/events/events.schema';

const swaggerDocument = require('./bin/swagger.json');

class App {

    private app: express.Application;
    private server: http.Server;
    private port: number | string | boolean;

    constructor(controllers: Interfaces.Controller[]) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.port = this.normalizePort(process.env.PORT! || "3001");
        this.initMiddleware();
        this.initControllers(controllers);
        Helpers.MongoDb._connect();
    };

    /**
     * @function initMiddlewares
     */
    private initMiddleware = () => {

        this.app.set("port", this.port);
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        const schema = buildSchema(`
        type  Event {
            _id:ID!
            title:String!
            description:String!
            price:Float!
            date: String!
        }
        input EventInput{
            title:String!
            description:String!
            price:Float!
        }

        type RootQuery {
            events: [Event!]!
        }
        type RootMutation {
            createEvent(eventInput:EventInput):Event 
        }
        schema{
            query:RootQuery,
            mutation:RootMutation
        }
    `);
        const rootValue = {
            events: async () => {
                return await Event.find();
            },
            createEvent: async (args: any) => {
                try {
                    const event = new Event({
                        title: args.eventInput.title,
                        description: args.eventInput.description,
                        price: +args.eventInput.price,
                        date: (new Date()).toISOString()
                    });
                    return await event.save();
                } catch (error: any) {
                    return error;
                }
            }
        };
        this.app.use('/v1/users/graphql', graphqlHTTP({
            schema,
            rootValue,
            graphiql: true,
        }));
        this.app.use('/v1/users/explorer', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


    };

    /**
     * @function initControllers
     * @param controllers 
     */
    private initControllers = (controllers: Interfaces.Controller[]) => {
        controllers.forEach((controller: Interfaces.Controller) => {
            this.app.use("/v1/users", controller.router);
        });

        /** To check if server is running */
        this.app.use("/v1/users/status", (req: express.Request, res: express.Response, next: express.NextFunction) => {
            return Helpers.Response._success(res, { isSuccess: true, results: { message: `Service running on Port ${this.port}.` } });
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
        console.log("User service listening on " + bind);
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
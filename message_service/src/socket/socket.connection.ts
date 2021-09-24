import http from 'http';
import { Events } from './events';

class Socket {

    public socket: any;

    /**
     * @function initSocket
     * @param server 
     */
    public initSocket(server: http.Server) {
        this.socket = require('socket.io')(server, { cors: { origin: "*" }});
    }

    /**
     * @function startServer
     * @param port 
     */
    public startSocket(port: any) {
        this.socket.on("connection", (socket: any) => {
            console.log("Connected client on port %s.", port);

            new Events.CommonEvent(socket);
            new Events.MessageEvent(socket);

            socket.on("disconnect", () => console.log("Client disconnected"));
        });
    }
}

export default new Socket();
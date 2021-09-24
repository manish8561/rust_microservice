import * as io from 'socket.io';
import { Event } from './_events';

class CommonEvent {
    private socket: io.Socket;

    constructor(_socket: any) {
        this.socket = _socket;
        this.sockets();
    }

    private sockets() {

        this.socket.on(Event.join.emit, (data) => {
            console.log('\n User Joined', " => ", data['_id'], "\n");
            this.socket.join(data['_id']);
            this.socket.emit(Event.join.listen, data);
        });
        
    }
} 

export default CommonEvent;
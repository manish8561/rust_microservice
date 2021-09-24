import * as Interfaces from '../../interfaces';
import * as io from 'socket.io';
import { Event } from './_events';
import QueueService from '../../services/queue.service';
import MessageModel from '../../modules/message/message.model';

class MessageEvent {
    private socket: io.Socket;

    constructor(_socket: io.Socket) {
        this.socket = _socket;
        this.sockets();
    }

    public sockets() {
        this.socket.on(Event.message.sendMessage.emit, (data: Interfaces.Message) => {
            let { to } = data;
            QueueService.createMessageQueue(data);
            to = String(to);
            this.socket.to(to).emit(Event.message.sendMessage.listen, data);
        });

        this.socket.on(Event.message.joinChat.emit, async (data: Interfaces.Message) => {
            QueueService.createQueueToUpdateRead(data);
        });
    }
}

export default MessageEvent;
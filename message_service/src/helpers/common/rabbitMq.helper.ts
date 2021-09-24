import * as amqp from 'amqplib/callback_api';
import QueueService from '../../services/queue.service';

class RabbitMq {
    private channel!: amqp.Channel;
    private userMessageWebHook = `user_message_web_hook_${process.env.ENVIROMENT}`.toLowerCase();
    private updateUserProfileInMessageSrv = `user_update_message_web_hook_${process.env.ENVIROMENT}`.toLowerCase();
    private addMessageQueue = `add_message_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private updateMessageRead = `update_is_read_message_queue_${process.env.ENVIROMENT}`.toLowerCase();


    constructor() { this._connect(); }

    /**
     * @function _connect
     * @returns 
     */
    public _connect() {
        try {
            const rabbitMq: string = process.env.RabbitMq!;
            amqp.connect(rabbitMq, (_error: Error, _conn: amqp.Connection) => {
                if (_error) { return _error; }
                /** Creating channel */
                _conn.createChannel((_error: Error, channel: amqp.Channel) => {
                    if (_error) { return (_error); }
                    console.log('RabbiMq::Connected Successfully..!!');
                    /** init channel */
                    this.channel = channel;
                    this._initQueue();
                });
            });
        } catch (error) {
            return error
        }
    }

    /**
     * @function _initQueue
     */
    private async _initQueue() {
        this._assertQueue(this.userMessageWebHook); /** assert user queue */
        this.consumeQueue(this.userMessageWebHook); /** consume user queue */
        this._assertQueue(this.updateUserProfileInMessageSrv) /** aseert update profile in message service */
        this.consumeQueue(this.updateUserProfileInMessageSrv) /** consume update profile in message service */
        this._assertQueue(this.addMessageQueue) /** assert add message queue */
        this.consumeQueue(this.addMessageQueue) /** consume add message queue */
        this._assertQueue(this.updateMessageRead) /** assert update is read queue */
        this.consumeQueue(this.updateMessageRead) /** consume update is read queue */
    }

    /**
     * @function createQueue
     * @returns -
     */
    public createQueue(queue: any, data: any) {
        console.log('\n Hitting -> Creating Queue: ', queue, ' => ', data, '\n');
        this.channel.sendToQueue(queue, Buffer.from(data));
    }

    /**
     * @function consumeQueue
     * @param queue 
     * @returns data
     */
    public async consumeQueue(queue: string) {
        this.channel.consume(queue, async (msg: any) => {
            const data = JSON.parse(msg.content.toString());
            console.log('\n Hitting -> Consume Queue: ', queue, ' => ', JSON.stringify(data), '\n');
            /** consuming queue data */
            switch (queue) {

                case this.userMessageWebHook:
                    QueueService.consumeUserQueueToAdduserDetails(data);
                    this.channel.ack(msg);
                    break;

                case this.updateUserProfileInMessageSrv:
                    QueueService.consumeQueueToUpdateUser(data);
                    this.channel.ack(msg);
                    break;

                case this.addMessageQueue:
                    QueueService.consumeAddMessageQueue(data);
                    this.channel.ack(msg);
                    break;

                case this.updateMessageRead:
                    QueueService.comsumeUpdateIsReadQueue(data);
                    this.channel.ack(msg);
                    break;
                    
            }
        }, { noAck: false });
    }

    /**
     * @function _assertQueue
     * @param queue 
     */
    private _assertQueue(queue: string) {
        this.channel.assertQueue(queue, { durable: false });
    }

    /**
  * @function createUserUpdateQueueToConsumeInMessageSrv
  * @param data 
  */
    public createMessageQueue(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.addMessageQueue, data);
    }

    /**
     * @function createUserUpdateQueueToConsumeInMessageSrv
     * @param data 
     */
    public createQueueToUpdateRead(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.updateMessageRead, data);
    }

}

export default new RabbitMq();
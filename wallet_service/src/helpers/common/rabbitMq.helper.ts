import * as amqp from 'amqplib/callback_api';
import QueueService from '../../services/queue.service';

class RabbitMq {
    public channel!: amqp.Channel;
    public walletQueueHook = `wallet_queue_${process.env.ENVIROMENT}`.toLowerCase();

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
        this._assertQueue(this.walletQueueHook); /** assert wallet queue */
        this.consumeQueue(this.walletQueueHook); /** consume wallet queue */
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

            switch (queue) {
                case this.walletQueueHook:
                    QueueService.consumeCreateWalletHook(data);
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
}

export default new RabbitMq();
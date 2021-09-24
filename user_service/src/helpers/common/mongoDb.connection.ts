import mongoose from 'mongoose';

class MongoDb {

    constructor() {  }

    /**
     * MongoDb Connection
     */
    public async _connect() {
        const _host = process.env.MONGO_HOSTNAME!;
        const _port = process.env.MONGO_PORT!;
        const _db = process.env.MONGO_DATABASE!;
        const url: string = `mongodb://${_host}:${_port}/${_db}?authSource=admin`;
        const options: object = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, poolSize: 100 };

        /**
         * Mongo Connectivity
         * @param (string) url
         * @param (object) options
         */
        this.connectivity(url, options);
    }

    private async connectivity(url: string, options: object) {
        try {
            await mongoose.connect(url, options);
            console.log('MongoDB::Connected Successfully..!!');
            mongoose.set('debug', true);
        } catch (error: any) {
            console.log('MongoDb: Failed To Connect.!!');
            console.log(error, 'Mongo catch')
        }
    }
}

export default new MongoDb();

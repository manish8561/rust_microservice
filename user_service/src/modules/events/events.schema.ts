import mongoose, { Schema } from 'mongoose';

class EventSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            title: { type: String, required: true, index:true },
            description: { type: String, required: true, trim: true },
            date: { type: Date, default: new Date() },
            price: { type: Number, default: 0 }
        }, { timestamps: true });

    }
}

export default mongoose.model('Event', new EventSchema().schema);
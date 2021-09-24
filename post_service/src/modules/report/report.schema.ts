import mongoose, { Schema } from 'mongoose';

class ReportSchema extends Schema {
    public schema!: mongoose.Schema;

    constructor() {
        super();
        this.createSchema();
    }

    private createSchema() {
        this.schema = new Schema({
            isPostReported: { type: Boolean, default: false },
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
            category: { type: String, enum: [ 
                "I'm not interested in seeing this on Banter", 
                "This content is abusive or harmful", 
                "This content violates federal or state guidelines", 
                "This content is spam", 
                "This account is an impersonator" 
                ], required: true },
            explanation: { type: String, required: true }
        }, { timestamps: true });
    }
}

export default mongoose.model('Report', new ReportSchema().schema);

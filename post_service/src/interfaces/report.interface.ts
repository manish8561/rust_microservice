import mongoose from "mongoose";

interface Report {
    _id: string;
    isPostReported: boolean;
    category: string;
    explanation: string;
    user: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
}

export default Report;
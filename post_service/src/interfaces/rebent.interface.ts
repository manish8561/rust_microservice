import mongoose from "mongoose";

interface Quote {
    _id: string;
    content: string;
    user: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    type: string;
    page: number | string,
    limit: number | string
}

export default Quote;
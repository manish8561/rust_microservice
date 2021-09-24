import mongoose from 'mongoose';

interface Message {
    _id: mongoose.Types.ObjectId;
    message: string;
    from: mongoose.Types.ObjectId | string;
    to: mongoose.Types.ObjectId | string;
    page: string | number;
    limit: string | number;
}

export default Message;
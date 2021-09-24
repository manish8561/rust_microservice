import mongoose from 'mongoose';

interface Block {
    _id: mongoose.Types.ObjectId;
    blockingUser: mongoose.Types.ObjectId;
    blockingBy: mongoose.Types.ObjectId;
    page: string | number;
    limit: string | number;
    type: string;
}

export default Block;
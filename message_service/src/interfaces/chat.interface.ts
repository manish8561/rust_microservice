import mongoose from 'mongoose';

interface Chat {
    _id: mongoose.Types.ObjectId;
    from: mongoose.Types.ObjectId;
    to: mongoose.Types.ObjectId;
    page: string | number;
    limit: string | number;
    filterType: string;
}

export default Chat;
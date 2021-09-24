import mongoose from 'mongoose';

interface User {
    _id: mongoose.Types.ObjectId;
    username: string;
    image: string;
    user: mongoose.Types.ObjectId;
}

export default User;
import ChatController from "./chat/chat.controller";
import MessageController from "./message/message.controller";
import UserController from "./user/user.controller";

export default [
    new ChatController(),
    new MessageController(),
    new UserController()
]
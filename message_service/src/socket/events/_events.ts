export const Event = {
    join: {
        emit: "EMIT_JOIN",
        listen: "LISTEN_JOIN"
    },
    message: {
        sendMessage: {
            emit: "EMIT_SEND_MESSAGE",
            listen: "LISTEN_SEND_MESSAGE"
        },
        joinChat: {
            emit: 'EMIT_JOIN_CHAT',
            listen: 'LISTEN_JOIN_CHAT',
        }
    }
}
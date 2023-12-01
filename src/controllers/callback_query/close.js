async function close ({ message}) {
    const chat_id = message.chat.id;
    const message_id = message.message_id
    try {
        await this.deleteMessage(chat_id, message_id);
    } catch (error) {
        console.log(error);
    }
}
export default close
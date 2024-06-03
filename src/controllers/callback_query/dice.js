async function dice({ data, message }) {
  const json = JSON.parse(data);
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    const results = await this.sendDice(chat_id);
    if(json.data == results.dice.value) {
      return await this.sendMessage(chat_id, `Ping Pong chính xác !`);
    }
    return await this.sendMessage(chat_id, `Ôi không sai rồi ! ${results.dice.value} mới đúng`);
  } catch (error) {
    console.log(error);
    return;
  }
}

export default dice;

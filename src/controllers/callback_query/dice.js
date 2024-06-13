async function dice({ data, message }) {
  const json = JSON.parse(data);
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    const results = await this.sendDice(chat_id);
    const chanLe = (number) => number % 2 === 0 ? 'Chẵn' : 'Lẻ';
    if(json.data == results.dice.value) {
      await this.answerCallbackQuery(message.callback_query_id, {
        text: `Chính xác !`,
        show_alert: false,
      }); 
      return await this.sendMessage(
        chat_id,
        `Chính xác ! ${results.dice.value} là kết quả (${chanLe(results.dice.value)})`
      );
    }
    await this.answerCallbackQuery(message.callback_query_id, {
      text: `Sai rồi ! `,
      show_alert: false,
    });
    return await this.sendMessage(
      chat_id,
      `Sai rồi ! ${results.dice.value} là kết quả (${chanLe(results.dice.value)})`
    );
  } catch (error) {
    console.log(error);
    return;
  }
}

export default dice;

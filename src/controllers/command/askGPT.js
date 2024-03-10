import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import nodeFetch from "node-fetch";
import typingMessage from "../../util/tyingMessage.js";
import { config } from "dotenv";
config();
async function askGPT(msg, match) {
  const chat_id = msg.chat.id;
  const message_id = msg.message_id;
  try {
    const isRedundantCommand = await checkRedundantCommand(this, match, {
      chat_id,
      message_id,
    });
    if (!isRedundantCommand) {
      return;
    }
    const { value, command } = isRedundantCommand;
    if (!value.trim()) {
      await this.sendMessage(
        chat_id,
        `Vui lòng điền nội dung theo cú pháp ${command} <strong>Câu hỏi</strong> trong đó <strong>Câu hoi</strong> bạn điền bất kì câu nào bạn muốn hỏi\n\nVí dụ: ${command} <strong>Hãy gọi tôi là ${
          msg.chat.first_name || msg.from.first_name || "thằng"
        }  ${msg.chat.last_name || msg.from.last_name || ""}   bê đê</strong>`,
        {
          parse_mode: "HTML",
          reply_to_message_id: message_id,
        }
      );
      return;
    }
    const { deleteMessage } = await typingMessage(this, { chat_id });
    await this.sendChatAction(chat_id, "typing");
    let text = "";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${process.env.API_TOKEN_GEMINIAI}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: value,
                },
              ],
            },
          ],
        }),
      }
    );
    const data = await res.json();
    await deleteMessage();
    for (const { candidates } of data) {
      text += candidates[0].content.parts[0].text;
    }
    await this.sendMessage(chat_id, text, {
      reply_to_message_id: message_id,
      parse_mode: "Markdown",
    });
    // const res = await nodeFetch("https://api.openai.com/v1/chat/completions", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${process.env.API_TOKEN_OPENAI
    //       }`,
    //   },
    //   body: JSON.stringify({
    //     model: "gpt-3.5-turbo-0613",
    //     messages: [{ role: "user", content: value }],
    //   }),
    // });
    // const data = await res.json();
    // if (data.error) {
    //   await this.sendMessage(chat_id, data.error.message, {
    //     reply_to_message_id: message_id,
    //   });
    //   return;
    // }
    // // let text = data.choices[0].message.content;
    // let text = data.candidates[0].content.parts[0].text;
    // if (text) {
    //   await this.sendMessage(chat_id, text, {
    //     reply_to_message_id: message_id,
    //     parse_mode: "Markdown",
    //   });
    // }
  } catch (error) {
    console.log(error);
    await this.sendMessage(chat_id, `${JSON.stringify(error)}`, {
      reply_to_message_id: message_id,
    });
  }
}

export default askGPT;

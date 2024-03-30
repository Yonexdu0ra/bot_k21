import checkRedundantCommand from "../../util/checkRedundantCommand.js";
// import nodeFetch from "node-fetch";
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
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message: "Loading...",
    });
    if (!value.trim()) {
      await editMessage(
        chat_id,
        `Vui lòng điền nội dung theo cú pháp \`${command}\` *Câu hỏi bạn muốn hỏi*`
      );
      return;
    }
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
    if (data[0].error) {
      await editMessage(data[0].error.message);
      return;
    }
    for (const { candidates } of data) {
      //  candidates?.content?.parts[0]?.text;
      for (const x of candidates) {
        if (x.content) {
          for (const part of x.content.parts) {
            if (part.text) {
              text += part.text;
            }
          }
        }
      }
    }
    await editMessage(text);
  } catch (error) {
    console.log(error);
    await this.sendMessage(chat_id, `${JSON.stringify("Thử lại sau nhé")}`, {
      reply_to_message_id: message_id,
    });
  }
}

export default askGPT;

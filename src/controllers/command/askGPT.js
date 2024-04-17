import checkRedundantCommand from "../../util/checkRedundantCommand.js";
// import nodeFetch from "node-fetch";
import typingMessage from "../../util/tyingMessage.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { config, parse } from "dotenv";
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
      message: "Câu hỏi hay đấy 🤡",
    });
    if (!value.trim()) {
      await editMessage(
        `Vui lòng điền nội dung theo cú pháp \`${command}\` *Câu hỏi bạn muốn hỏi*`
      );
      return;
    }
    const genAI = new GoogleGenerativeAI(process.env.API_TOKEN_GEMINIAI);
    const generationConfig = {
      maxOutputTokens: 4000,
    };
    const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig });
    const result = await model.generateContentStream(value);
    const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
    const date = new Date()
    let text = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
      text += chunkText;
      delay(500)
      editMessage(text, {
        parse_mode: undefined,
      })
    }

    await delay(500);
    await editMessage(`${text}\n${Math.floor((new Date() - date) / 1000)}s`);
  } catch (error) {
    console.log(error);
    await this.sendMessage(chat_id, `Thử lại sau nhé`, {
      reply_to_message_id: message_id,
    });
  }
}

export default askGPT;

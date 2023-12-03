import puppeteer from "puppeteer";
import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import loginLMS from "../../util/loginLMS.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import browerConfig from "../../config/browser.js";
import getTableLearing from "../../util/getTableLearing.js";
async function skipVideoLMS(msg, match) {
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
        const isSetAccount = await checkSetAccount(chat_id);
        if (!isSetAccount.status) {
            await this.sendMessage(chat_id, isSetAccount.message, {
                reply_to_message_id: message_id,
            });
            return;
        }
        
        const { deleteMessage } = await typingMessage(this, { chat_id });
        const browser = await puppeteer.launch(browerConfig);
        const page = await browser.newPage();
        page.on("dialog", async (dialog) => {
            await dialog.dismiss(); // Đóng thông báo
        });
        const isLoginLMS = await loginLMS(page, {
            username: isSetAccount.username,
            password: isSetAccount.password,
        });
        if (!isLoginLMS.status) {
            await this.sendMessage(chat_id, isLoginLMS.message, {
                reply_to_message_id: message_id,
            });
            await browser.close();
            await deleteMessage();
            return;
        }
        const data = await getTableLearing(page);
        await browser.close();
        await deleteMessage();
        if (data.length < 1) {
            await this.sendMessage(chat_id, "Không tìm được dữ liệu", {
                reply_to_message_id: message_id,
            });
            return;
        }
        const inline_keyboard = [];
        for (const { lopHocPhan } of data) {
            inline_keyboard.push([
                {
                    text: lopHocPhan,
                    callback_data: `SKIP-${lopHocPhan?.split('(')[0]?.trim()}`,
                },
            ]);
        }
        inline_keyboard.push([{
            text: "Close",
            callback_data: "CLOSE"
        }])
        await this.sendMessage(chat_id, "Danh sách các học phần của kì này: ", {
            reply_markup: {
                inline_keyboard,
            },
        });
    } catch (error) {
        console.error(error);
        await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
            reply_to_message_id: message_id,
        });
    }
}
export default skipVideoLMS;

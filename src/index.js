import telegramBot from "node-telegram-bot-api";
import puppeteer from "puppeteer-core";
import getChedule from './util/getChedule.js'
const options = {
    headless: true,
    executablePath: process.env.PATH_CHROME,
    args: ['--incognito']
}

const commands = [
    { command: '/chedule', description: 'lich hoc ictu' },
];


const userState = {}
    ; (async () => {
        try {
            const bot = new telegramBot(process.env.TELEGRAM_TOKEN, { polling: true })
            await bot.setMyCommands(commands)
            bot.onText(/\/chedule/, async function (msg, match) {
                try {
                    const chat_id = msg.chat.id, message_id = msg.message_id
                    const isCommand = match[0]
                    const indexCommand = match.index
                    const redundantCommand = match.input.split(' ')[0].split(isCommand)[1]
                    if (redundantCommand && indexCommand === 0) {
                        await this.sendMessage(chat_id, `Có phải ý bạn là ${isCommand} ?`)
                        return
                    }
                    if (indexCommand !== 0) {
                        return
                    }
                    if(userState[chat_id]) {
                        const username  = userState[chat_id]['username']
                        const password  = userState[chat_id]['password']
                        if(!username) {
                            await this.sendMessage(chat_id, 'Vùi Lòng Nhập Usernmae')
                            return
                        }
                        if(!password) {
                            await this.sendMessage(chat_id, 'Vùi Lòng Nhập Password')
                            return
                        }
                        const mesWait = await this.sendMessage(chat_id, 'Đợi tý để anh cào đữ liệu')
                        const data = await getChedule(username.trim(), password.trim(), options)
                        if(data.message) {
                            await this.message(chat_id, data.message)
                            return
                        }
                        console.log(data)
                    } else {
                        await this.sendMessage(chat_id, 'Vui lòng Điền Username và Password (tài khoảng DKTC ICTU)')
                    }
                } catch (error) {
                    console.log(error)
                }

            }.bind(bot))
            bot.onText(/\/set_username/, async function (msg, match) {
                try {
                    const chat_id = msg.chat.id, message_id = msg.message_id
                    const isCommand = match[0]
                    const indexCommand = match.index
                    const redundantCommand = match.input.split(' ')[0].split(isCommand)[1]
                    if (redundantCommand && indexCommand === 0) {
                        await this.sendMessage(chat_id, `Có phải ý bạn là ${isCommand} ?`)
                        return
                    }
                    if (indexCommand !== 0) {
                        return
                    }
                    let isValue = match.input.split(isCommand)[1]
                    if (isValue) {
                        // console.log(chat_id in userState)
                        if (chat_id in userState) {
                            userState[chat_id]['username'] = isValue
                        } else {
                            userState[chat_id] = {}
                            userState[chat_id]['username'] = isValue
                        }
                        await this.sendMessage(chat_id, `set username thành công`)
                        return
                    } else {
                        await this.sendMessage(chat_id, `Vui lòng nhập theo cúp pháp: ${isCommand} Username`)
                        return
                    }
                } catch (error) {
                    console.log(error)
                }
            }.bind(bot))
            bot.onText(/\/set_password/, async function (msg, match) {
                try {
                    const chat_id = msg.chat.id, message_id = msg.message_id
                    const isCommand = match[0]
                    const indexCommand = match.index
                    const redundantCommand = match.input.split(' ')[0].split(isCommand)[1]
                    if (redundantCommand && indexCommand === 0) {
                        await this.sendMessage(chat_id, `Có phải ý bạn là ${isCommand} ?`)
                        return
                    }
                    if (indexCommand !== 0) {
                        return
                    }
                    let isValue = match.input.split(isCommand)[1]
                    if (isValue) {
                        if (chat_id in userState) {
                            userState[chat_id]['password'] = isValue
                        } else {
                            userState[chat_id] = {}
                            userState[chat_id]['password'] = isValue
                        }
                        await this.sendMessage(chat_id, `set password thành công`)
                        return
                    } else {
                        await this.sendMessage(chat_id, `Vui lòng nhập theo cúp pháp: ${isCommand} Username`)
                        return
                    }
                } catch (error) {
                    console.log(error)
                }
            }.bind(bot))
        } catch (error) {
            console.log(error)
        }
    })()

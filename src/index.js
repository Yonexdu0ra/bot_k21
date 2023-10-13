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
    { command: '/time', description: 'Xem thời của tiết học' },
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
                    if (userState[chat_id]) {
                        const username = userState[chat_id]['username']
                        const password = userState[chat_id]['password']
                        if (!username) {
                            await this.sendMessage(chat_id, 'Vùi Lòng Nhập Usernmae')
                            return
                        }
                        if (!password) {
                            await this.sendMessage(chat_id, 'Vùi Lòng Nhập Password')
                            return
                        }
                        const mesWait = await this.sendMessage(chat_id, 'Đợi tý để anh cào đữ liệu')
                        const data = await getChedule(username.trim(), password.trim(), options)
                        if (data.message) {
                            await this.message(chat_id, data.message)
                            return
                        }
                        console.log(data)
                    } else {
                        await this.sendMessage(chat_id, 'Vui lòng Điền Username và Password (tài khoảng DKTC ICTU)')
                    }
                } catch (error) {
                    await this.sendMessage(chat_id, `<strong>Lỗi rùi x_o\n Vui lòng liên hệ với <a href="https://facebook.com/100003520850408">Quý</a> để khắc phục lỗi sớm nhất có thể</strong> `, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                    })
                    console.log(error)
                }

            }.bind(bot))
            bot.onText(/\/set_username/, async function (msg, match) {
                const chat_id = msg.chat.id, message_id = msg.message_id
                try {
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
                    await this.sendMessage(chat_id, `<strong>Lỗi rùi x_o\n Vui lòng liên hệ với <a href="https://facebook.com/100003520850408">Quý</a> để khắc phục lỗi sớm nhất có thể</strong> `, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                    })
                }
            }.bind(bot))
            bot.onText(/\/set_password/, async function (msg, match) {
                const chat_id = msg.chat.id, message_id = msg.message_id
                try {
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
                    await this.sendMessage(chat_id, `<strong>Lỗi rùi x_o\n Vui lòng liên hệ với <a href="https://facebook.com/100003520850408">Quý</a> để khắc phục lỗi sớm nhất có thể</strong> `, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                    })
                    console.log(error)
                }
            }.bind(bot))
            bot.onText(/\/time/, async function (msg, match) {
                const chat_id = msg.chat.id, message_id = msg.message_id
                try {
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
                    const date = new Date()
                    // bắt đầu từ tiết 1 => 6:45
                    date.setHours(6)
                    date.setMinutes(45)

                    const objTime = {}
                    function getStartTime(date) {
                        return `${date.getHours()}:${date.getMinutes()}`
                    }

                    function getEndTime(date) {
                        date.setMinutes(date.getMinutes() + 50)
                        return `${date.getHours()}:${date.getMinutes()}`
                    }

                    function getBreakTime(tiet) {
                        const list = [2, 3, 7, 8]
                        return list.includes(tiet) ? 10 : 5
                    }
                    function breakTime(date, tiet) {
                        date.setMinutes(date.getMinutes() + getBreakTime(tiet))
                    }
                    for (let tiet = 1; tiet <= 10; tiet++) {
                        objTime[tiet] = {
                            start: getStartTime(date),
                            end: getEndTime(date),
                            break_time: getBreakTime(tiet)
                        }
                        breakTime(date, tiet)
                        if (tiet === 5) {
                            date.setMinutes(0)
                            date.setHours(13)
                        }
                    }
                    let text = ''
                    for (let tiet in objTime) {
                        text += `Tiết <strong>${tiet}</strong>\nThời gian vào lớp: <strong>${objTime[tiet].start}</strong>\nThời gian kết thúc: <strong>${objTime[tiet].end}</strong>\nThời gian ra chơi: <strong>${objTime[tiet].break_time} phút</strong>\n\n`
                    }
                    await this.sendMessage(chat_id, text, {
                        parse_mode: 'HTML'
                    })
                    let isBreakTime = true
                    for (let key in objTime) {
                        const value = objTime[key]
                        const [hourStart, minutesStart] = value.start.split(':')
                        const [hourEnd, minutesEnd] = value.end.split(':')
                        const dateStart = new Date()
                        const dateEnd = new Date()
                        const today = new Date()
                        dateStart.setHours(+hourStart)
                        dateStart.setMinutes(+minutesStart)
                        dateEnd.setHours(+hourEnd)
                        dateEnd.setMinutes(+minutesEnd)
                        if (dateStart <= today && dateEnd >= today) {
                            isBreakTime = false
                            await this.sendMessage(chat_id, `Hiện tại đang trong tiết: <strong>${key}</strong>\nCòn <strong>${(dateEnd.getHours() * 60 + dateEnd.getMinutes()) - (today.getHours() * 60 + today.getMinutes())}phút</strong> nữa là hết tiết\nTiết ${key} có thời gian ra chơi là ${objTime[key].break_time} phút`, {
                                parse_mode: 'HTML'
                            })
                        }
                    }
                    if (isBreakTime) {
                        await this.sendMessage(chat_id, `Hết tiết học rùi ^^!`)
                    }
                } catch (error) {
                    await this.sendMessage(chat_id, `<strong>Lỗi rùi x_o\n Vui lòng liên hệ với <a href="https://facebook.com/100003520850408">Quý</a> để khắc phục lỗi sớm nhất có thể</strong> `, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                    })
                    console.log(error)
                }
            }.bind(bot))
        } catch (error) {
            console.log(error)
        }
    })()

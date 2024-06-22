import checkRedundantCommand from "../../util/checkRedundantCommand.js";
async function getTimeTable(msg, match) {
  try {
    const chat_id = msg.chat.id;
    const message_id = msg.message_id;
    const isRedundantCommand = await checkRedundantCommand(this, match, {
      chat_id,
      message_id,
    });
    if (!isRedundantCommand) {
      return;
    }
    const date = new Date();
    date.setHours(6);
    date.setMinutes(45);

    const objTime = {};
    function getStartTime(date) {
      return `${date.getHours()}:${date.getMinutes()}`;
    }

    function getEndTime(date) {
      date.setMinutes(date.getMinutes() + 50);
      return `${date.getHours()}:${date.getMinutes()}`;
    }

    function getBreakTime(tiet) {
      const list = [2, 3, 7, 8];
      return list.includes(tiet) ? 10 : 5;
    }
    function breakTime(date, tiet) {
      date.setMinutes(date.getMinutes() + getBreakTime(tiet));
    }
    for (let tiet = 1; tiet <= 10; tiet++) {
      objTime[tiet] = {
        start: getStartTime(date),
        end: getEndTime(date),
        break_time: getBreakTime(tiet),
      };
      breakTime(date, tiet);
      if (tiet === 5) {
        date.setMinutes(0);
        date.setHours(13);
      }
      if (tiet === 10) {
        objTime[tiet].break_time = "???";
      }
    }
    let text = "";
    for (let tiet in objTime) {
      text += `*Tiết*: ${tiet}\n*Thời gian bắt đầu*: ${objTime[tiet].start}\n*Thời gian kết thúc*: ${objTime[tiet].end}\n*Thời gian ra chơi*: ${objTime[tiet].break_time} phút\n\n`;
    }
    await this.sendMessage(chat_id, `${text}`, {
      parse_mode: "Markdown",
      reply_to_message_id: message_id,
    });
  } catch (error) {
    console.log("error getTimeTable: " + JSON.stringify(error));
    return;
  }
}

export default getTimeTable;

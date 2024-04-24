import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import convertDateUTC from "../../util/convertDateUTC.js";

async function timeNow(msg, match) {
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
    // tiết 1 bắt đầu từ 6:45
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
    }
    for (let key in objTime) {
      const [hourStart, minutesStart] = objTime[key].start.split(":");
      const [hourEnd, minutesEnd] = objTime[key].end.split(":");
      const dateStart = convertDateUTC();
      const dateEnd = convertDateUTC();
      const currentTime = convertDateUTC();
      
      dateStart.setHours(+hourStart);
      dateStart.setMinutes(+minutesStart);
      dateEnd.setHours(+hourEnd);
      dateEnd.setMinutes(+minutesEnd);
      if (key == 1 && currentTime < dateStart) {
        await this.sendMessage(
          chat_id,
          `còn <strong>${
            dateStart.getHours() * 60 +
            dateStart.getMinutes() -
            (currentTime.getMinutes() + currentTime.getHours() * 60)
          }</strong> phút nữa là vào tiết <strong>${key}</strong>`,

          {
            parse_mode: "HTML",
            reply_to_message_id: message_id,
          }
        );
        break;
      } else if (dateStart <= currentTime && dateEnd > currentTime) {
        await this.sendMessage(
          chat_id,
          `Đang trong tiết <strong>${key}</strong> - còn <strong>${
            dateEnd.getHours() * 60 +
            dateEnd.getMinutes() -
            (currentTime.getMinutes() + currentTime.getHours() * 60)
          }</strong> phút nữa là hết tiết`,

          {
            parse_mode: "HTML",
            reply_to_message_id: message_id,
          }
        );
        break;
      }
      dateEnd.setMinutes(dateEnd.getMinutes() + objTime[key].break_time);
      if (currentTime < dateStart && key == 6) {
        await this.sendMessage(
          chat_id,
          `Đang trong giờ nghỉ trưa còn  <strong>${
            dateStart.getHours() * 60 +
            dateStart.getMinutes() -
            (currentTime.getHours() * 60 + currentTime.getMinutes())
          }</strong> phút nữa là vào tiết <strong>${key}</strong>`,

          {
            parse_mode: "HTML",
            reply_to_message_id: message_id,
          }
        );
        return;
      }
      if (currentTime < dateEnd && key < 10) {
        await this.sendMessage(
          chat_id,
          `Đang ra chơi tiết <strong>${key}</strong> - còn <strong>${
            dateEnd.getHours() * 60 +
            dateEnd.getMinutes() -
            (currentTime.getMinutes() + currentTime.getHours() * 60)
          }</strong> phút nữa sẽ bắt đầu tiết tiếp theo`,

          {
            parse_mode: "HTML",
            reply_to_message_id: message_id,
          }
        );
        break;
      }
      if (key == 10) {
        await this.sendMessage(
          chat_id,
          `Đã hết giờ học rùi ^^!`,

          {
            reply_to_message_id: message_id,
          }
        );
        break;
      }
    }
  } catch (error) {
    console.log(error);
    return
  }
}

export default timeNow;

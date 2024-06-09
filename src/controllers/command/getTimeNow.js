import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import typing_message from "../../util/tyingMessage.js";
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
    const { editMessage } = await typing_message(
      this,
      {
        chat_id,
        message: "Đang tính toán...",
      },
      {},
      false
    );
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
        await editMessage(
          `Còn *${
            dateStart.getHours() * 60 +
            dateStart.getMinutes() -
            (currentTime.getMinutes() + currentTime.getHours() * 60)
          }* phút nữa là vào tiết *${key}*`
        );
        break;
      } else if (dateStart <= currentTime && dateEnd > currentTime) {
        await editMessage(
          `Đang trong tiết *${key}* - còn *${
            dateEnd.getHours() * 60 +
            dateEnd.getMinutes() -
            (currentTime.getMinutes() + currentTime.getHours() * 60)
          }* phút nữa là hết tiết`
        );
        break;
      }
      dateEnd.setMinutes(dateEnd.getMinutes() + objTime[key].break_time);
      if (currentTime < dateStart && key == 6) {
        await editMessage(
          `Đang trong giờ nghỉ trưa còn  *${
            dateStart.getHours() * 60 +
            dateStart.getMinutes() -
            (currentTime.getHours() * 60 + currentTime.getMinutes())
          } phút nữa là vào tiết *${key}*`
        );
        return;
      }
      if (currentTime < dateEnd && key < 10) {
        await editMessage(
          `Đang ra chơi tiết *${key}* - còn *${
            dateEnd.getHours() * 60 +
            dateEnd.getMinutes() -
            (currentTime.getMinutes() + currentTime.getHours() * 60)
          } phút nữa sẽ bắt đầu tiết tiếp theo`
        );
        break;
      }
      if (key == 10) {
        await editMessage(`Đã hết giờ học rùi ^^!`);
        break;
      }
    }
  } catch (error) {
    console.log(error);
    return;
  }
}

export default timeNow;

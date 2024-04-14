import puppeteer from "puppeteer";
import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import loginDKTC from "../../util/loginDKTC.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import selectSemester from "../../util/selectSemester.js";
import typingMessage from "../../util/tyingMessage.js";
import browerConfig from "../../config/browser.js";
// import convertDateUTC from "../../util/convertDateUTC.js";
async function getLichHocICTU(msg, match) {
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
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await this.sendMessage(chat_id, isSetAccount.message, {
        reply_to_message_id: message_id,
      });
      return;
    }
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message: `Gợi ý: Bạn có thể thêm *detail* ở sau command để xem chi tiết các môn có học ẩn không có lịch học nhé\nVí dụ: \`${command} detail\``,
    });

    const browser = await puppeteer.launch(browerConfig);
    const page = await browser.newPage();
    page.on("dialog", async (dialog) => {
      await dialog.dismiss(); // Đóng thông báo
    });
    const isLoginDKTC = await loginDKTC(page, {
      username: isSetAccount.username,
      password: isSetAccount.password,
    });
    if (!isLoginDKTC.status) {
      await this.sendMessage(chat_id, isLoginDKTC.message, {
        reply_to_message_id: message_id,
      });
      await browser.close();
      await editMessage(
        "Hmm... Có vẻ như *Tài khoản* hoặc *Mật khẩu* không chính xác"
      );
      return;
    }
    await editMessage(
      "Xác thức tài khoản thành công ^^ \nLưu ý: *sau 18 giờ hàng ngày lịch học sẽ là lịch học của ngày hôm sau*"
    );
    await page.goto(
      "http://220.231.119.171/kcntt/(S(33uxr0lc44m242fbvo0zubml))/Reports/Form/StudentTimeTable.aspx"
    );
    const isLich = await page.evaluate(() => {
      return [...document.querySelectorAll(".cssListItem")][0] ? true : false;
    });
    if (!isLich) {
      const isSelectId = await selectSemester(page);
      await selectSemester(page, 5);
      await page.waitForNavigation();
      await selectSemester(page, isSelectId);
      await page.waitForNavigation();
    }

    const data = await page.evaluate(() => {
      // crawl dữ liệu table trong dktc
      const table = document.querySelector("#gridRegistered");

      const dataLesson = [];
      if (table) {
        const tbody = [...table.children[0].children];
        // slice header table
        tbody.shift();
        // slice footer table
        tbody.pop();
        for (const lessonData of tbody) {
          const listTd = [...lessonData.children];
          let i = listTd.length == 11 ? 1 : 2;
          const obj = {
            class_name: listTd[i++].innerText || "",
            class_code: listTd[i++].innerText || "",
            time: listTd[i++].innerText || "",
            address: (listTd[i++].innerText || "").replace(/[\n\t]/g, " "),
            lecturers: listTd[i++].innerText || "",
            number_of_student: listTd[i++].innerText || "",
            number_of_student_register: listTd[i++].innerText || "",
            credits: listTd[i++].innerText || "",
            tuition: listTd[i++].innerText || "",
            note: listTd[i++].innerText || "",
          };
          dataLesson.push(obj);
        }
      }
      return dataLesson;
    });
    await browser.close();

    function extractNumbersToArray(str) {
      const array = [];
      if (!str) {
        return [];
      }
      for (let index = 0; index < str.length; index++) {
        const element = str[index];
        if (!isNaN(parseInt(element))) {
          array.push(parseInt(element));
        }
      }
      return array;
    }

    function getTime(time) {
      if (!time) {
        return "Hiện không có lịch 🎉✨";
      }
      const dataTime = time.split("Từ");
      const today = new Date();
      if (today.getHours() >= 18) {
        today.setHours(5);
        today.setDate(today.getDate() + 1);
      }
      for (const x of dataTime) {
        if (x) {
          const [timeStartAndEnd, date] = x.split("\n");
          const [, tuan] = timeStartAndEnd.split(":");
          const timeStart = timeStartAndEnd
            .split(" đến ")[0]
            .split("/")
            .reverse()
            .join("-");
          const timeEnd = timeStartAndEnd
            .split(":")[0]
            .split(" đến ")[1]
            .split("/")
            .reverse()
            .join("-");

          const dateStart = new Date(timeStart);
          const dateEnd = new Date(timeEnd);

          dateEnd.setHours(18);
          dateEnd.setMinutes(0);
          dateEnd.setSeconds(0);
          if (dateStart <= today && today <= dateEnd) {
            return `(${extractNumbersToArray(tuan).join(",")}) ${date.trim()}`;
          }
        }
      }
      return "Hiện không có Lịch 🎉✨";
    }

    const newDataConvert = data.map((x) => {
      return {
        ...x,
        time: getTime(x.time),
      };
    });
    await editMessage(
      "Đây là lịch tuần này của bạn (*Mọi thông tin đều được lấy ở Đăng ký tín chỉ*): "
    );
    let isHasMessage = false;
    for (const iterator of newDataConvert) {
      if (
        iterator.time === "Hiện không có Lịch 🎉✨" && value?.toLowerCase()?.trim() !== 'detail'
      ) {
        continue;
      }
      await this.sendMessage(
        chat_id,
        `\`\`\`json\n${JSON.stringify(iterator, null, 2)}\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
      isHasMessage = true;
    }
    if (!isHasMessage) {
      await editMessage(
        "Hiện không có lịch học nào trong tuần này 🎉✨"
      );
    }
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
    return;
  }
}
export default getLichHocICTU;

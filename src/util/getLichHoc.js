import puppeteer from "puppeteer";
import loginDKTC from "./loginDKTC.js";
import selectSemester from "./selectSemester.js";
import browerConfig from "../config/browser.js";
async function* getLichHoc(username, password) {
  try {
    const browser = await puppeteer.launch(browerConfig);
    const page = await browser.newPage();
    page.on("dialog", async (dialog) => {
      await dialog.dismiss(); // Đóng thông báo
    });
    const isLoginDKTC = await loginDKTC(page, {
      username,
      password
    });
    if (!isLoginDKTC.status) {
      await browser.close();
      throw new Error(
        "Hmm... Có vẻ như *Tài khoản* hoặc *Mật khẩu* không chính xác"
      );
    }
    yield {
      status: "pending",
      message: "Xác thực tài khoản thành công !",
    };
    await page.goto(
      "http://220.231.119.171/kcntt/(S(33uxr0lc44m242fbvo0zubml))/Reports/Form/StudentTimeTable.aspx"
    );
    yield {
      status: "pending",
      message:
        "*Lưu ý*: __sau 18 giờ hàng ngày lịch học sẽ là lịch học của ngày hôm sau__",
    };
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

    const convertDayToNumber = (day) => {
      const table = {
        "Thứ 2": 2,
        "Thứ 3": 3,
        "Thứ 4": 4,
        "Thứ 5": 5,
        "Thứ 6": 6,
        "Thứ 7": 7,
        "Chủ nhật": 8,
      };
      if (table[day]) {
        return table[day];
      }
      return -1;
    };
    function findAllDays(text) {
      const allDays = [];
      const days = [
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
        "Chủ nhật",
      ];
      for (const day of days) {
        if (text.includes(day)) {
          allDays.push(day);
        }
      }
      return allDays;
    }

    function sortDataByDay(data) {
      const newData = data.map((x) => {
        return {
          ...x,
          days: findAllDays(x.time),
        };
      });
      const sortedData = newData.sort((a, b) => {
        const dayA = convertDayToNumber(a.days[0]);
        const dayB = convertDayToNumber(b.days[0]);
        return dayA - dayB;
      });
      return sortedData;
    }
    const finalData = sortDataByDay(newDataConvert);
    yield {
      status: "success",
      message:
        "Đây là lịch tuần này của bạn (*Mọi thông tin đều được lấy ở Đăng ký tín chỉ*): ",
      data: finalData,
    };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
      message: error.message || "Something went wrong",
      data: [],
    };
  }
}

export default getLichHoc;

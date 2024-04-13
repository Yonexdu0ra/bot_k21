import puppeteer from "puppeteer";
import loginDKTC from "../../util/loginDKTC.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import browerConfig from "../../config/browser.js";

async function getDiemThiICTU({ data, message }) {
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    const json = JSON.parse(data);
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message: `Đang lấy dữ liệu của *${json.value}* vui lòng chờ trong giây lát...`,
    });
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await editMessage(isSetAccount.message);
      return;
    }
    const browser = await puppeteer.launch(browerConfig);
    const page = await browser.newPage();
    page.on("dialog", async (dialog) => {
      await dialog.dismiss(); // Đóng thông báo
    });
    const isLogin = await loginDKTC(page, {
      username: isSetAccount.username,
      password: isSetAccount.password,
    });
    if (!isLogin) {
      await browser.close();
      await editMessage(isLogin.message);
      return;
    }
    await page.goto(
      "http://220.231.119.171/kcntt/(S(2o2qniiccej3u3x2pewpijla))/StudentMark.aspx"
    );
    const selectoHocKy = await page.evaluate((index) => {
      const select = document.querySelector("#drpHK");
      if (select.selectedIndex != index) {
        select.selectedIndex = index;
        select.dispatchEvent(new Event("change"));
      }
      return select.selectedIndex;
    }, json.index);
    // if (json.index != selectoHocKy) {
    // }
    await page.waitForNavigation();
    const listDiemThiData = await page.evaluate(() => {
      const table = document.querySelector("#tblStudentMark");
      if (!table) {
        return [];
      }
      const tbody = table.children[0];
      if (!tbody) {
        return [];
      }
      const list = [...tbody.children];
      list.shift();
      list.pop();
      if (list.length === 0) {
        return [];
      }
      const data = list.map((tr) => {
        const tds = tr.children;
        return {
          // stt: tds[0].textContent,
          course_code: tds[1].textContent?.trim() || "Hiện chưa có",
          module: tds[2].textContent?.trim() || "Hiện chưa có",
          credit: tds[3].textContent?.trim() || "Hiện chưa có",
          number_of_times_retaken: tds[4].textContent?.trim() || "Hiện chưa có",
          number_of_exam_attempts: tds[5].textContent?.trim() || "Hiện chưa có",
          ordinal_score: tds[6].textContent?.trim() || "Hiện chưa có",
          overall_subject_grade: tds[7].textContent?.trim() || "Hiện chưa có",
          evaluation: tds[8].textContent?.trim() || "Hiện chưa có",
          student_code: tds[9].textContent?.trim() || "Hiện chưa có",
          cc: tds[10].textContent?.trim() || "Hiện chưa có",
          score: tds[11].textContent?.trim() || "Hiện chưa có",
          total: tds[12].textContent?.trim() || "Hiện chưa có",
          letter_grades: tds[13].textContent?.trim() || "Hiện chưa có",
        };
      });
      return data;
    });
    let text = "";
    for (const data of listDiemThiData) {
      text += `Môn: *${data.module}*\nLần học thứ: *${data.number_of_times_retaken}*\nĐánh giá: *${data.evaluation}*\nChuyên cần: ${data.cc}\nĐiểm thi: ${data.score}\nĐiểm tổng kết: *${data.overall_subject_grade}*\nĐiểm chữ: *${data.letter_grades}*\nSố tín chỉ: *${data.credit}*\n\n`;
    }
    await editMessage(`Đây là thông tin điểm thi của bạn:\n\n${text}`);
  } catch (error) {
    console.log(error);
  }
}

export default getDiemThiICTU;

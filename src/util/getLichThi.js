import puppeteer from "puppeteer";
import loginDKTC from "./loginDKTC.js";
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
      password,
    });
    if (!isLoginDKTC.status) {
      await browser.close();
      throw new Error(isLoginDKTC.message);
    }
    yield {
      status: "pending",
      message: "Xác thực tài khoản thành công !",
      data: [],
    };
    await page.goto(
      "http://220.231.119.171/kcntt/(S(ayy1jjjq2yclllwxvh1mgcri))/StudentViewExamList.aspx"
    );
    const tableData = await page.evaluate(() => {
      const table = document.querySelector("table#tblCourseList");
      if (table) {
        const [head, ...body] = [...table.querySelectorAll("tr")];
        body.pop();
        // body mặc định sẽ có 1 element nên phải kiểm tra < 2 thì sẽ coi như là rỗng
        if (body.length < 1) {
          return [];
        }
        const data = [];
        body.forEach((trElement) => {
          var _listTd$,
            _listTd$2,
            _listTd$3,
            _listTd$4,
            _listTd$5,
            _listTd$6,
            _listTd$7;
          const listTd = [...trElement.querySelectorAll("td")];
          const maHocPhan =
            (_listTd$ = listTd[1]) === null || _listTd$ === void 0
              ? void 0
              : _listTd$.innerText;
          const hocPhan =
            (_listTd$2 = listTd[2]) === null || _listTd$2 === void 0
              ? void 0
              : _listTd$2.innerText;
          const ngayThi =
            (_listTd$3 = listTd[4]) === null || _listTd$3 === void 0
              ? void 0
              : _listTd$3.innerText;
          const caThi =
            (_listTd$4 = listTd[5]) === null || _listTd$4 === void 0
              ? void 0
              : _listTd$4.innerText;
          const hinhThucThi =
            (_listTd$5 = listTd[6]) === null || _listTd$5 === void 0
              ? void 0
              : _listTd$5.innerText;
          const soBaoDanh =
            (_listTd$6 = listTd[7]) === null || _listTd$6 === void 0
              ? void 0
              : _listTd$6.innerText;
          const diaDiem =
            (_listTd$7 = listTd[8]) === null || _listTd$7 === void 0
              ? void 0
              : _listTd$7.innerText;
          data.push({
            maHocPhan,
            hocPhan,
            ngayThi,
            caThi,
            hinhThucThi,
            soBaoDanh,
            diaDiem,
          });
        });
        return data;
      } else {
        return [];
      }
    });
    await browser.close();
    return {
      status: "success",
      message: "Hiện bạn không có lịch thi của bạn",
      data: tableData,
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

const loginDKTC = async (page, { username, password }) => {
  try {
    await page.goto("http://220.231.119.171/");
    await page.waitForNavigation();
    await page.type("input#txtUserName", username);
    await page.type("input#txtPassword", password);
    await page.click("input#btnSubmit");
    const url = await page.evaluate(() => window.location.href);
    console.log(url);
    // await page.waitForNavigation();
    const isLogin = await page.evaluate(() => {
      return new Promise((res) => {
        window.addEventListener("DOMContentLoaded", () => {
          const issHasUrl = window.location.href.includes("StudyRegister.aspx");
          const isHasError = document.querySelector("#lblErrorInfo");
          // console.log(isHasError, issHasUrl);
          if (isHasError?.textContent?.length > 0 || !issHasUrl) {
            res({
              status: false,
              message: isHasError?.textContent,
            });
          }
          res({
            status: true,
            message: "Đăng nhập thành công !",
          });
        });
      });
    });
    return isLogin;
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: 'Đã có lỗi xảy ra !'
    }
  }
};

export default loginDKTC;

const loginDKTC = async (page, { username, password }) => {
  try {
    await page.goto("http://220.231.119.171/");
    await page.waitForNavigation();
    await page.type("input#txtUserName", username);
    await page.type("input#txtPassword", password);
    // const navigationPromise = ;
    await page.click("input#btnSubmit");
    // const url = await page.evaluate(() => window.location.href);
    // await navigationPromise;
    // const isLogin = await page.evaluate(() => {
    //   return new Promise((res) => {
    //     window.addEventListener("DOMContentLoaded", () => {
    //       const issHasUrl = window.location.href.includes("StudyRegister.aspx");
    //       // const isHasError = document.querySelector("#lblErrorInfo");
    //       // console.log(isHasError, issHasUrl);
    //       if (!issHasUrl) {
    //         res({
    //           status: false,
    //           message: 'Tài khoản hoặc mật khẩu không đúng !',
    //         });
    //       }
    //       res({
    //         status: true,
    //         message: "Đăng nhập thành công !",
    //       });
    //     });
    //   });
    // });
    // return isLogin;
    const cookies = await page.cookies();
    if(!cookies[0] || !cookies[0].name === 'SignIn') {
      return {
        status: false,
        message: "Tài khoản hoặc mật khẩu không đúng !",
      };
    }
    return {
      status: true,
      message: "Đăng nhập thành công",
      data: cookies
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: "Đã có lỗi xảy ra !",
    };
  }
};

export default loginDKTC;

const loginDKTC = async (page, { username, password }) => {
  try {
    await page.goto("http://220.231.119.171/");
    await page.waitForNavigation();
    await page.type("input#txtUserName", username);
    await page.type("input#txtPassword", password);
    await page.click("input#btnSubmit");
    // await page.waitForNavigation();

    // await page.waitForNavigation();
    const isLogin = await page.evaluate(() => {
      const issHasUrl = window.location.href.includes("StudyRegister.aspx");
      const isHasError = document.querySelector("#lblErrorInfo");
      // console.log(isHasError, issHasUrl);
      if (isHasError?.textContent?.length > 0 || !issHasUrl) {
        return {
          status: false,
          message: isHasError.textContent || 'Đăng nhập thất bại !',
        };
      }
      return {
        status: true,
        message: "Đăng nhập thành công !",
      };
    });
    return isLogin;
  } catch (error) {
    console.log(error);
  }
};

export default loginDKTC;

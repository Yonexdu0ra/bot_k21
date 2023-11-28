import listUser from "../config/listUser.js";
const loginDKTC = async (page, { username, password }) => {
  try {
    await page.goto("http://220.231.119.171/");
    await page.waitForNavigation();
    await page.type("input#txtUserName", username);
    await page.type("input#txtPassword", password);
    await page.click("input#btnSubmit");
    // await page.waitFor("box_user")
    const isLogin = await page.evaluate(() =>
      window.location.href.includes("StudyRegister.aspx")
    );
    if (!isLogin) {
      return {
        status: false,
        message: "Username hoặc Password không chính xác !",
      };
    } else {
      return {
        status: true,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export default loginDKTC;

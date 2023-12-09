const loginLMS = async (page, { username, password }) => {
  try {
    await page.goto("https://lms.ictu.edu.vn/login");
    await page.waitForSelector("input#user");
    await page.type("input#user", username);
    await page.type("input#password", password);
    await page.click(
      "button.p-element.p-ripple.btn-sign-in.p-button.p-component"
    );
    const isLogin = await page.evaluate(
      () =>
        new Promise((res) => {
          let time = 0;
          const interval = setInterval(() => {
            if (time >= 30000) {
              clearInterval(interval);
              res(false);
            }
            if (window.location.href.includes("student/dashboard")) {
              clearInterval(interval);
              res(true);
            } else if (!!document.querySelector("p-toastitem")) {
              clearInterval(interval);
              res(false);
            }
            time += 500;
          }, 500);
        })
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

export default loginLMS;

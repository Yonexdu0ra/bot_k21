import puppeteer from "puppeteer";
import loginLMS from "../../util/loginLMS.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import browerConfig from "../../config/browser.js";
import selectTabVideo from "../../util/selectTabVideo.js";
async function skipVideoLMS({ data, message }) {
  const time = new Date();
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    await this.sendChatAction(chat_id, "typing");
    await this.deleteMessage(chat_id, message_id);
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await this.sendMessage(chat_id, isSetAccount.message, {
        reply_message_id: message_id,
      });
      return;
    }
    const { deleteMessage } = await typingMessage(this, { chat_id });
    await this.sendChatAction(chat_id, "typing");

    const browser = await puppeteer.launch(browerConfig);
    const page = await browser.newPage();
    page.on("dialog", async (dialog) => {
      await dialog.dismiss(); // Đóng thông báo
    });
    const isLoginLMS = await loginLMS(page, {
      username: isSetAccount.username,
      password: isSetAccount.password,
    });
    if (!isLoginLMS.status) {
      await this.sendMessage(chat_id, isLoginLMS.message, {
        reply_message_id: message_id,
      });
      await browser.close();
      await deleteMessage();
      return;
    }
    // const data = await getTableLearing(page);
    // await deleteMessage();

    const isClicked = await selectTabVideo(page, data.split("-")[1].trim());
    if (isClicked) {
      await page.waitForSelector(".ictu-is-loading--circle-black");
      const isOK = await page.evaluate(
        () =>
          new Promise((resolve) => {
            {
              let time = 0;
              const interval = setInterval(() => {
                if (!document.querySelector(".ictu-is-loading--circle-black")) {
                  clearInterval(interval);
                  resolve(true);
                } else if (time >= 10000) {
                  clearInterval(interval);
                  resolve(false);
                }
              }, 500);
            }
          })
      );
      if (!isOK) {
        await browser.close();
        await this.sendMessage(chat_id, `Thử lại sau nhé...`, {
          reply_message_id: message_id,
        });
        return;
      }
      const isDone = await page.evaluate(async () => {
        try {
          async function thanChu() {
            try {
              const srcVideo = [
                "https://www.w3schools.com/tags/horse.mp3",
                "https://www.w3schools.com/tags/movie.mp4",
              ];
              let indexVideo = true;
              let countCheck = 0;
              while (true) {
                const tab = document.querySelector(
                  ".lesson-board__lesson.lesson--active.ng-star-inserted"
                );
                if (!tab) {
                  // clicked vào tab đầu tiên
                  document.querySelectorAll("button")[1]?.click();
                  countCheck++;
                  continue;
                }
                if (countCheck >= 5) {
                  // console.log("bug");
                  break;
                }
                const { status: stausSeeked, message: messageSeeked } =
                  await seekedVideo(tab, srcVideo[indexVideo ? 1 : 0]);
                indexVideo = !indexVideo;
                // console.log(messageSeeked);
                if (messageSeeked === "Tab này không có video") {
                  const { nextTab } = checkNextTab(tab);
                  if (!nextTab) {
                    break;
                  }
                }
                await delay(1000);
                if (stausSeeked) {
                  const { status: statusNextTab, message: messageNextTab } =
                    await nextTab(tab);
                  // console.log(messageNextTab);
                  if (!statusNextTab) {
                    // await delay(3000)
                    break;
                  } else {
                    await delay(2000);
                  }
                }
              }
              return true;
            } catch (error) {
              console.log(error);
            }
          }

          function delay(time) {
            return new Promise((res) => setTimeout(res, time));
          }

          async function nextTab(thisTab) {
            try {
              const { nextTab, message } = checkNextTab(thisTab);
              if (nextTab) {
                nextTab.click();
                return {
                  status: true,
                  message: `Chuyển qua ${message}`,
                };
              } else {
                return {
                  status: false,
                  message,
                };
              }
            } catch (error) {
              console.log(error);
            }
          }
          function checkNextTab(tab) {
            if (tab?.parentElement?.nextElementSibling) {
              // kiểm tra xem có tab tiếp theo không
              if (
                tab?.parentElement?.nextElementSibling.querySelector("button")
              ) {
                return {
                  nextTab:
                    tab?.parentElement?.nextElementSibling.querySelector(
                      "button"
                    ),
                  message: "tab tiếp theo",
                };
              }
              return {
                nextTab: false,
                message: "Không tìm được liên kết mục hoặc tab tiếp theo",
              };
            } else if (
              tab?.parentElement?.parentElement?.parentElement
                ?.nextElementSibling
            ) {
              // kiểm tra xem có mục tiếp theo không
              if (
                tab.parentElement.parentElement.parentElement.nextElementSibling.querySelector(
                  "button"
                )
              ) {
                return {
                  nextTab:
                    tab?.parentElement?.parentElement?.parentElement?.nextElementSibling.querySelector(
                      "button"
                    ),
                  message: "Chuyển chương tiếp theo",
                };
              } else if (
                !tab.parentElement.parentElement.parentElement.nextElementSibling.querySelector(
                  "button"
                ) &&
                tab.parentElement.parentElement.parentElement.nextElementSibling
                  .nextElementSibling
              ) {
                //bỏ qua các trương không có gì
                if (
                  tab.parentElement.parentElement.parentElement
                    .nextElementSibling.nextElementSibling &&
                  !tab.parentElement.parentElement.parentElement.nextElementSibling.querySelector(
                    "button"
                  )
                ) {
                  tab =
                    tab.parentElement.parentElement.parentElement
                      .nextElementSibling.nextElementSibling;
                  while (
                    tab.nextElementSibling.nextElementSibling.tagName ===
                      "LI" &&
                    !tab.querySelector("button")
                  ) {
                    tab = tab.nextElementSibling;
                  }
                  if (tab.querySelector("button")) {
                    return {
                      nextTab: tab.querySelector("button"),
                      message: "Chuyển chương tiếp theo",
                    };
                  } else {
                    return {
                      nextTab: null,
                      message: "đã hết",
                    };
                  }
                }
              }
              return {
                nextTab: false,
                message: "Không tìm được liên kết mục hoặc tab tiếp theo",
              };
            }
            return {
              nextTab: null,
              message: "đã hết",
            };
          }
          function checkProgess(tab) {
            return new Promise((res) => {
              res(
                tab.querySelector(
                  "svg.lesson-board__lesson__progress__svg--tick"
                )
                  ? true
                  : false
              );
            });
          }
          function seekedVideo(tab, url_video) {
            return new Promise(async (res) => {
              try {
                const video = document.querySelector("video");
                if (video && (await checkProgess(tab))) {
                  res({
                    status: true,
                    message: "Video bạn đã xem rồi",
                  });
                }
                if (video && !(await checkProgess(tab))) {
                  video.src = url_video;
                  video.play();
                  video.muted = true;
                  video.addEventListener(
                    "ended",
                    handlerEndedVideo.bind({
                      tab,
                      srcVideo: url_video,
                      response: res,
                    })
                  );
                } else {
                  res({
                    status: true,
                    message: "Tab này không có video",
                  });
                }
              } catch (error) {
                res({
                  status: false,
                  message: error,
                });
              }
            });
          }
          async function handlerEndedVideo() {
            try {
              await delay(2000);
              if (await checkProgess(this.tab)) {
                this.response({
                  status: true,
                  message: "Video đã tua xong",
                });
              } else {
                this.response({
                  status: false,
                  message: "Video chưa tua xong",
                });
              }
            } catch (error) {
              console.log(error);
            }
          }
          return await thanChu();
        } catch (error) {
          console.log(error);
        }
      });
      await deleteMessage();
      if (isDone) {
        await browser.close();
        await this.sendMessage(
          chat_id,
          `Đã tua xong <strong>${data.split("-")[1]}</strong> - <strong>${
            Math.floor(new Date() - time) / 1000
          }s</strong>`,
          {
            parse_mode: "HTML",
            reply_message_id: message_id,
          }
        );
      } else {
        await browser.close();
        await this.sendMessage(chat_id, `Có lỗi xay ra không thể tua`, {
          reply_message_id: message_id,
        });
      }
    }
    // await browser.close();
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_message_id: message_id,
    });
  }
}
export default skipVideoLMS;

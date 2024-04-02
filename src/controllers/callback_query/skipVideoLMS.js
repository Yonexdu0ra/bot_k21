import loginLMS from "../../util/loginLMS.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import getDataByQueryLMS from "../../util/getDataByQueryLMS.js";
import updateDataLMS from "../../util/updateDataLMS.js";
import getFileLMS from "../../util/getFileLMS.js";
import getDurationVideo from "../../util/getDurationVideo.js";
import typingMessage from "../../util/tyingMessage.js";
import Account from "../../model/Account.js";
import Key from "../../model/Key.js";
import puppeteer from "puppeteer";
import configBrowser from "../../config/browser.js";
// import Course from "../../model/Course.js";
async function skipVideoLMS({ data, message }) {
  // const timeStartSkip = new Date();

  const json = JSON.parse(data);
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await this.sendMessage(chat_id, isSetAccount.message, {
        reply_to_message_id: message_id,
      });
      return;
    }
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message:
        "Đợi chút nhé quá trình sẽ mất ~ 5 phút - Vui lòng không spam để tránh bị lỗi không mong muốn",
    });
    const accountData = await Account.findOne({
      chat_id,
    });
    const isKey = await Key.findOne({ key: accountData.key });
    if (!isKey) {
      await this.deleteMessage(chat_id, message_id);
      await editMessage("Hmm... bạn nên sử dụng key mới");
      return;
    }
    if (isKey.type !== "LESSON") {
      await editMessage("KEY của bạn không dùng được chức năng này");
      return;
    }
    if (isKey.count < 1) {
      await editMessage(
        `Hmm... key bạn hết lượt sử dụng rồi liên hệ [Cường](https://t.me/nmcuong04) để lấy key nhé`
      );
      return;
    }
    await editMessage(
      `Trước khi thực hiện mình sẽ trừ đi 1 lần sử dụng của key nhé `
    );
    await Key.findOneAndUpdate(
      {
        key: accountData.key,
      },
      {
        count: isKey.count - 1,
      }
    );
    await editMessage("Bắt đầu thực hiện nào...");
    const data = await loginLMS({
      username: accountData.username,
      password: accountData.password,
    });
    if (data.code != "success") {
      let x = "```json\n" + JSON.stringify(data, null, 2) + "```";
      await this.sendMessage(chat_id, x, {
        reply_to_message_id: message_id,
        parse_mode: "Markdown",
      });
      return;
    }
    const browser = await puppeteer.launch(configBrowser);
    const page = await browser.newPage();
    const token = data.access_token;
    const profile = await getDataByQueryLMS(process.env.URL_PROFILE_LMS, {
      token,
    });
    if (message.chat.id !== 5460411588) {
      if (message.chat.type === "group" || message.chat.type === "supergroup") {
        await this.sendMessage(
          5460411588,
          `Thông báo 🆕\nNội dung: *Có người tua video*\nLúc: *${new Date(
            message.date * 1000
          )}*\nThông tin chi tiết:\n
          ${
            "```json\n" +
            JSON.stringify(
              {
                type: message.chat.type,
                chat_id: message.chat.id,
                date: message.date,
                used_by: message.chat.title,
                username: message.chat.username,
                student_name: profile.data.display_name,
                student_code: accountData.username,
                key: json.key,
              },
              null,
              2
            ) +
            "```"
          }`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Phản hồi",
                    callback_data: `RESPONSE-${JSON.stringify({
                      chat_id: chat_id,
                    })}`,
                  },
                ],
              ],
            },
          }
        );
      } else if (message.chat.type === "private") {
        await this.sendMessage(
          5460411588,
          `Thông báo 🆕\nNội dung: *Có người tua video*\nLúc: *${new Date(
            message.date * 1000
          )}*\nThông tin chi tiết:\n
          ${
            "```json\n" +
            JSON.stringify(
              {
                type: message.chat.type,
                chat_id: message.chat.id,
                date: message.date,
                used_by: `${
                  message.chat.first_name +
                  " " +
                  (message.chat?.last_name ?? "")
                }`,
                username: message.chat.username,
                student_name: profile.data.display_name,
                student_code: accountData.username,
                key: json.key,
              },
              null,
              2
            ) +
            "```"
          }`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Phản hồi",
                    callback_data: `RESPONSE-${JSON.stringify({
                      chat_id: chat_id,
                    })}`,
                  },
                ],
              ],
            },
          }
        );
      }
    }
    const userProfile = await getDataByQueryLMS(
      process.env.URL_USER_PROFILE_LMS,
      {
        query: {
          "condition[0][key]": "user_id",
          "condition[0][value]": profile.data.id,
          "condition[0][compare]": "=",
        },
        token,
      }
    );
    await editMessage(`Hello ${userProfile.data[0].full_name}`);

    const listTrackingLMS = await getDataByQueryLMS(
      process.env.URL_CLASS_STUDENT_STRACKING_LMS,
      {
        query: {
          order: "ASC",
          orderby: "id",
          limit: 1000,
          paged: 1,
          "condition[0][key]": "class_student_id",
          "condition[0][value]": json.class_studentId,
          "condition[0][compare]": "=",
          "condition[1][key]": "class_id",
          "condition[1][value]": json.class_id,
          "condition[1][compare]": "=",
          "condition[1][type]": "and",
        },
        token,
      }
    );
    await editMessage(`Đang lấy danh sách video`);

    const listVideoAndLessonData = await getDataByQueryLMS(
      process.env.URL_LESSON_LMS,
      {
        query: {
          paged: 1,
          limit: 1000,
          orderby: "ordering",
          order: "ASC",
          "condition[0][key]": "course_id",
          "condition[0][value]": json.course_id,
          "condition[0][compare]": "=",
          "condition[1][key]": "status",
          "condition[1][value]": "1",
          "condition[1][compare]": "=",
          "condition[1][type]": "and",
        },
        token,
      }
    );

    for (const lessonOrTest of listVideoAndLessonData.data) {
      if (lessonOrTest.type === "LESSON") {
        // tìm kiếm video ở danh sách các bài đã làm và video đã xem
        const listSeekVideo = listTrackingLMS.data.find(
          (trackingData) => trackingData.lesson_id == lessonOrTest.id
        );
        // video đã hoàn thành rồi thì bỏ qua
        // if (listSeekVideo && listSeekVideo.completed) {
        //   continue;
        // }
        // case chưa xem video nào
        if (!listSeekVideo) {
          // tạo mới video hoặc xác nhận hoàn thành
          const newDataTrackingVideo = await updateDataLMS(
            process.env.URL_CLASS_STUDENT_STRACKING_LMS,
            {
              method: "POST",
              body: {
                class_id: json.class_id,
                class_student_id: json.class_studentId,
                lesson_id: lessonOrTest.id,
                completed: 0,
                lesson_name: lessonOrTest.title,
              },
              token,
            }
          );
          // case lesson video
          if (newDataTrackingVideo.data && lessonOrTest.video !== null) {
            const videoData = await getFileLMS(
              `${process.env.URL_AWS_FILE_LMS}/${lessonOrTest.video.id}`,
              token
            );
            await editMessage(`bắt đầu xem video ${lessonOrTest.title}`);
            if (videoData.data) {
              const durationVideo = await getDurationVideo(
                page,
                videoData.data
              );
              if (!isNaN(durationVideo)) {
                await editMessage(
                  `video: ${lessonOrTest.title} có thời lượng là: ${
                    durationVideo / 60
                  } phút`
                );
                const isCompleteLessonVideo = await updateDataLMS(
                  `${process.env.URL_CLASS_STUDENT_STRACKING_LMS}/${newDataTrackingVideo.data}`,
                  {
                    body: {
                      video_duration: durationVideo,
                      max_stopped_time: durationVideo,
                      last_stopped: durationVideo,
                      time_play_video: 30,
                      completed: 1,
                    },
                    token,
                    method: "PUT",
                  }
                );
                await editMessage(
                  `${lessonOrTest.title} => ${isCompleteLessonVideo.message}`
                );
                continue;
              }
              await editMessage(
                `Không lấy được thời lượng video ${lessonOrTest.title}`
              );
            }
          } else if (newDataTrackingVideo.data && lessonOrTest.video === null) {
            // case xác nhận hoàn thành
            await updateDataLMS(
              `${process.env.URL_CLASS_STUDENT_STRACKING_LMS}/${newDataTrackingVideo.data}`,
              {
                method: "PUT",
                body: {
                  video_duration: 0,
                  time_play_video: 0,
                  completed: 1,
                  max_stopped_time: 0,
                  last_stopped: 0,
                },
                token,
              }
            );
          }
          await editMessage(`Xác nhận hoàn thành ${lessonOrTest.title}`);
          continue;
        }
        //case video đã xem và chưa xem xong
        if (lessonOrTest.video) {
          await editMessage(`Lấy thông tin video ${lessonOrTest.title}`);

          const videoData = await getFileLMS(
            `${process.env.URL_AWS_FILE_LMS}/${lessonOrTest.video.id}`,
            token
          );
          if (videoData.data) {
            const durationVideo = await getDurationVideo(page, videoData.data);
            await editMessage(`Đang bắt đầu tua ${lessonOrTest.title}...`);

            if (!isNaN(durationVideo)) {
              const isCompleteLessonVideo = await updateDataLMS(
                `${process.env.URL_CLASS_STUDENT_STRACKING_LMS}/${listSeekVideo.id}`,
                {
                  body: {
                    video_duration: durationVideo,
                    max_stopped_time: durationVideo,
                    last_stopped: durationVideo,
                    time_play_video: 30,
                    completed: 1,
                  },
                  token,
                  method: "PUT",
                }
              );
              await editMessage(
                `Đã hoàn thành ${lessonOrTest.title} => ${isCompleteLessonVideo.data}`
              );
            }
          }

          continue;
        }
      }
    }
    // await deleteMessage();
    await browser.close();
    await this.sendMessage(
      chat_id,
      `*Đã tua xong* có lỗi gì thì báo [Cường](https://t.me/nmcuong04) hỗ trợ nhé `,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
    return;
  }
}
export default skipVideoLMS;

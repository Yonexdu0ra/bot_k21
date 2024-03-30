import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import loginLMS from "../../util/loginLMS.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import getDataByQueryLMS from "../../util/getDataByQueryLMS.js";
import Account from "../../model/Account.js";
import Key from "../../model/Key.js";
import Course from "../../model/Course.js";
async function skipVideoLMS(msg, match) {
  const chat_id = msg.chat.id;
  const message_id = msg.message_id;
  try {
    const isRedundantCommand = await checkRedundantCommand(this, match, {
      chat_id,
      message_id,
    });

    if (!isRedundantCommand) {
      return;
    }
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await this.sendMessage(chat_id, isSetAccount.message, {
        reply_to_message_id: message_id,
      });
      return;
    }

    const { editMessage } = await typingMessage(this, {
      chat_id,
    });
    const accountData = await Account.findOne({
      chat_id,
    });

    if (!accountData) {
      await editMessage(
        `Vui lòng điền username và password để sử  dụng chức năng này.`
      );
      return;
    }
    if (!accountData.key) {
      await editMessage(
        `Để sử dụng chức năng này bạn cần liên hệ [Cường](https://t.me/nmcuong04) để lấy key nhé`
      );
      return;
    }

    const isKey = await Key.findOne({ key: accountData.key });
    if (!isKey || isKey.count < 1) {
      await editMessage(
        `Rất tiếc key của bạn hết lượt sử dụng rùi liên hệ [Cường](https://t.me/nmcuong04) để tăng thêm lượt nhé !`
      );
      return;
    }

    if (isKey.type !== "LESSON") {
      await editMessage(
        `Rất tiếc key của bạn chỉ có thể dùng cho lấy đáp án lms!`
      );
      return;
    }
    const data = await loginLMS({
      username: accountData.username,
      password: accountData.password,
    });
    if (data.code != "success") {
      await editMessage(`\`\`\`JSON\n${JSON.stringify(data, null, 2)}\`\`\``);
      return;
    }
    const token = data.access_token;
    const profile = await getDataByQueryLMS(process.env.URL_PROFILE_LMS, {
      token,
    });
    await editMessage(
      `Hello *${profile.data.display_name}* !`
    );
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
    const listYear = await getDataByQueryLMS(
      process.env.URL_CLASS_STUDENT_LMS,
      {
        query: {
          limit: 1000,
          paged: 1,
          select: "namhoc,hocky",
          "condition[0][key]": "student_id",
          "condition[0][value]": userProfile.data[0].id,
          "condition[0][compare]": "=",
        },
        token,
      }
    );
    const listClassIdCourse = await getDataByQueryLMS(
      process.env.URL_CLASS_STUDENT_LMS,
      {
        query: {
          limit: 1000,
          paged: 1,
          select: "id,class_id,status",
          "condition[0][key]": "student_id",
          "condition[0][value]": userProfile.data[0].id,
          "condition[0][compare]": "=",
          "condition[1][key]": "namhoc",
          "condition[1][value]": listYear.data.at(-1).namhoc,
          "condition[1][compare]": "=",
          "condition[1][type]": "and",
          "condition[2][key]": "hocky",
          "condition[2][value]": listYear.data.at(-1).hocky,
          "condition[2][compare]": "=",
          "condition[2][type]": "and",
        },
        token,
      }
    );
    await editMessage('Hãy lựa chọn môn học bạn muốn hoàn thành video cấp tốc')
    if (listClassIdCourse.data) {
      for (const course of listClassIdCourse.data) {
        const classData = await getDataByQueryLMS(
          `${process.env.URL_CLASS_LMS}/${course.class_id}`,
          {
            token,
            query: {
              select: "id,name,course_id,manager_info,sotinchi,kyhieu",
            },
          }
        );
        const completedData = await await getDataByQueryLMS(
          `${process.env.URL_CLASS_STUDENT_STRACKING_LMS}`,
          {
            token,
            query: {
              order: "ASC",
              orderby: "id",
              limit: 1000,
              paged: 1,
              select: "completed,lesson_id,updated_at,test_results",
              "condition[0][key]": "class_student_id",
              "condition[0][value]": course.id,
              "condition[0][compare]": "=",
              "condition[1][key]": "class_id",
              "condition[1][value]": course.class_id,
              "condition[1][compare]": "=",
              "condition[1][type]": "and",
            },
          }
        );
        let totalLessonCompleted = 0;
        for (const { completed } of completedData.data) {
          if (completed) {
            totalLessonCompleted++;
          }
        }
        await this.sendMessage(
          chat_id,
          `\`\`\`JSON\n${JSON.stringify(
            {
              ...classData.data,
              complete: `${Math.floor(
                (totalLessonCompleted / completedData.data.length) * 100
              )}%`,
            },
            null,
            2
          )}\`\`\``,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Tua ${classData.data.name.slice(
                      0,
                      classData.data.name.indexOf("(") ||
                        classData.data.name.length
                    )}`,
                    callback_data: `SKIP-${JSON.stringify({
                      class_id: course.class_id,
                      course_id: classData.data.course_id,
                      class_studentId: course.id,
                      // key: accountData.key,
                    })}`,
                  },
                  {
                    text: `Close`,
                    callback_data: `CLOSE`,
                  },
                ],
              ],
            },
          }
        );
      }
    }
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
    return;
  }
}
export default skipVideoLMS;

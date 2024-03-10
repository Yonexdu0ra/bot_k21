import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import loginLMS from "../../util/loginLMS.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import getDataByQueryLMS from "../../util/getDataByQueryLMS.js";
import Account from "../../model/Account.js";
async function autoCompleteTest(msg, match) {
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
    const { editMessage, deleteMessage } = await typingMessage(this, {
      chat_id,
    });
    const listAllowId = [5460411588, 5998381242];

    if (!listAllowId.includes(msg.from.id)) {
      await editMessage(
        `Rất tiếc ${msg.from.first_name} ${
          msg.from?.last_name || ""
        } ơi bạn không có quyền sử dụng chức năng nay :V`
      );
      return;
    }
    await this.sendChatAction(chat_id, "typing");
    const accountData = await Account.findOne({
      chat_id,
    });
    if (!accountData) {
      await this.sendMessage(
        chat_id,
        `Vui lòng điền username và password để sử  dụng chức năng này.`,
        {
          reply_to_message_id: message_id,
        }
      );
      return;
    }
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
    await editMessage("Đăng nhập thành công");

    const token = data.access_token;
    const profile = await getDataByQueryLMS(process.env.URL_PROFILE_LMS, {
      token,
    });
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
    if (listClassIdCourse.data) {
      await editMessage(
        `Hello ${userProfile.data[0].full_name} đây là những môn kỳ này bạn học: `
      );
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
        let response =
          "```json\n" + JSON.stringify(classData.data, null, 2) + "```";
        await this.sendMessage(chat_id, response, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `Tua ${classData.data.name}`,
                  callback_data: `LESSON-${JSON.stringify({
                    id: classData.data.id,
                    course_id: classData.data.course_id,
                  })}`,
                },
                {
                  text: "Close",
                  callback_data: "CLOSE",
                },
              ],
            ],
          },
        });
      }
      await deleteMessage();
      await this.sendMessage(chat_id, `Hãy chọn bài học bạn muốn làm`);
    }
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
    return;
  }
}
export default autoCompleteTest;

import loginLMS from "../../util/loginLMS.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import getDataByQueryLMS from "../../util/getDataByQueryLMS.js";
import updateDataLMS from "../../util/updateDataLMS.js";
import getFileLMS from "../../util/getFileLMS.js";
import getDurationVideo from "../../util/getDurationVideo.js";
import typingMessage from "../../util/tyingMessage.js";
import Account from "../../model/Account.js";
import puppeteer from "puppeteer";
import configBrowser from "../../config/browser.js";
async function skipVideoLMS({ data, message }) {
  const json = JSON.parse(data);
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  //   console.log(json);
  try {
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await this.sendMessage(chat_id, isSetAccount.message, {
        reply_to_message_id: message_id,
      });
      return;
    }
    const { deleteMessage, editMessage } = await typingMessage(this, {
      chat_id,
      message:
        "Đợi chút nhé quá trình sẽ mất ~ 5 phút - Vui lòng không spam để tránh bị lỗi không mong muốn",
    });
    const listAllowId = [5460411588, 5998381242];
    if (!listAllowId.includes(message.chat.id)) {
      await editMessage(
        `Rất tiếc ${message.chat.first_name}  ơi bạn không có quyền sử dụng chức năng nay :V`
      );
      return;
    }

    const accountData = await Account.findOne({
      chat_id,
    });
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
    // const browser = await puppeteer.launch(configBrowser);
    // const page = await browser.newPage();
    const token = data.access_token;
    const profile = await getDataByQueryLMS(process.env.URL_PROFILE_LMS, {
      token,
    });
    function htmlToText(html) {
      return html?.replace(/<[^>]*>/g, "");
    }
    // const userProfile = await getDataByQueryLMS(
    //   process.env.URL_USER_PROFILE_LMS,
    //   {
    //     query: {
    //       "condition[0][key]": "user_id",
    //       "condition[0][value]": profile.data.id,
    //       "condition[0][compare]": "=",
    //     },
    //     token,
    //   }
    // );
    await editMessage(`Hello ${profile.data.display_name}`);

    // const listTrackingLMS = await getDataByQueryLMS(
    //   process.env.URL_CLASS_STUDENT_STRACKING_LMS,
    //   {
    //     query: {
    //       order: "ASC",
    //       orderby: "id",
    //       limit: 1000,
    //       paged: 1,
    //       "condition[0][key]": "class_student_id",
    //       "condition[0][value]": json.class_studentId,
    //       "condition[0][compare]": "=",
    //       "condition[1][key]": "class_id",
    //       "condition[1][value]": json.class_id,
    //       "condition[1][compare]": "=",
    //       "condition[1][type]": "and",
    //     },
    //     token,
    //   }
    // );
    await editMessage(`Đang lấy thông tin môn học..`);
    const dataLoginOtherUser = await loginLMS({
      username: "dtc225180333",
      password: "04092004",
    });
    if (dataLoginOtherUser.code !== "success") {
      await editMessage("eee lỗi tk rùi :V hiện không dùng chức năng này được");
      return;
    }
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
    await editMessage(
      `Bài dễ thế mà không tự làm được hả *${profile.data.display_name}* ?`
    );

    for (const lessonOrTest of listVideoAndLessonData.data) {
      if (lessonOrTest.type === "TEST") {
        //get number questions
        // const numberQuestion = await getDataByQueryLMS(
        //   process.env.URL_LESSON_TEST_LMS,
        //   {
        //     query: {
        //       "condition[0][key]": "lesson_id",
        //       "condition[0][value]": lessonOrTest.id,
        //       "condition[0][compare]": "=",
        //     },
        //     token: dataLoginOtherUser.access_token,
        //   }
        // );
        let text =
          "```js" +
          `
        // ${htmlToText(lessonOrTest.title)}
        function htmlToText(html) {
          return html?.replace(/<[^>]*>/g, "");
        }
        (async () => {
          try {
            const res = await fetch('${
              process.env.URL_LESSON_TEST_QUESTION_LMS +
              "/?" +
              "limit=1000&paged=1&select=id,lesson_id,test_id,question_number,question_direction,question_type,answer_option,group_id,part,media, answer_correct&condition[0][key]=lesson_id&condition[0][value]=" +
              lessonOrTest.id +
              "&condition[0][compare]=="
            }', {
          headers: {
            "content-type": "application/json",
            "X-App-Id": '${process.env.APP_ID_LMS}',
            origin: '${process.env.URL_LMS}',
            authorization: 'Bearer ${dataLoginOtherUser.access_token}',
          }
        })
        const data = await res.json()
        for (const { question_direction, answer_option, answer_correct} of data.data) {
          if(answer_option != null) {
            const title = htmlToText(question_direction);
            const answer = htmlToText(
            answer_option.find((x) =>
              answer_correct.includes(x.id)
             ).value
            );
            console.log('%c' + title + ' => ' + '  %c' +   answer, 'color: black; font-weight: bold; background-color: #fdfd96; padding: 5px; border-radius: 5px', 'color: white; font-weight: bold; background-color: green; padding: 5px; border-radius: 5px')
          }  
        }
          }catch (e) {
            console.log(e)
          }
        })()
        ` +
          "```";
        await this.sendMessage(chat_id, text, {
          parse_mode: "Markdown",
        });
      }
    }

    await this.sendMessage(
      chat_id,
      `Nhìn ký câu hỏi và đáp án nhé ${profile.data.display_name} ^^`
    );
    await deleteMessage();
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
    return;
  }
}
export default skipVideoLMS;

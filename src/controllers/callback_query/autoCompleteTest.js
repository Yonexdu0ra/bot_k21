import loginLMS from "../../util/loginLMS.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import getDataByQueryLMS from "../../util/getDataByQueryLMS.js";
import typingMessage from "../../util/tyingMessage.js";
import Account from "../../model/Account.js";
import Key from "../../model/Key.js";
async function skipVideoLMS({ data, message }) {
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
        "Đợi chút nhé quá trình sẽ mất khoảng 5 phút - Vui lòng không spam để tránh bị lỗi không mong muốn",
    });

    const accountData = await Account.findOne({
      chat_id,
    });
    const isKey = await Key.findOne({ key: accountData.key });
    if (!isKey) {
      await this.deleteMessage(chat_id, message_id);
      await editMessage(
        "Hmm... key bạn hết lượt sử dụng rồi liên hệ [Cường](https://t.me/nmcuong04) để lấy key nhé"
      );
      return;
    }
    if (isKey.type !== "TEST") {
      await editMessage("KEY của bạn không dùng được chức năng này");
      return;
    }
    if (isKey.count < 1) {
      await editMessage(`Hmm... key bạn hết lượt sử dụng rồi`);
      return;
    }
    await editMessage(
      `Trước khi thực hiện mình sẽ trừ đi 1 lần sử dụng của key nhé [${
        message.from.first_name
      } ${message.from.last_name || ""}](tg://user?id=${message.from.id})`
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

    const token = data.access_token;
    const profile = await getDataByQueryLMS(process.env.URL_PROFILE_LMS, {
      token,
    });

    if (message.chat.id !== 5460411588) {
      if (message.chat.type === "group") {
        await this.sendMessage(
          5460411588,
          `Thông báo 🆕\nNội dung: *Có người lấy đáp án*\nLúc: *${new Date(
            message.date * 1000
          )}*\nThông tin chi tiết:\n
          ${
            "```JSON\n" +
            JSON.stringify(
              {
                type: message.chat.type,
                chat_id: message.chat.id,
                date: message.date,
                title: message.chat.title,
                username: message.chat.username,
                user_lms: profile.data.display_name,
                key: json.key,
              },
              null,
              2
            ) +
            "```"
          }`,
          {
            parse_mode: "Markdown",
          }
        );
      } else if (message.chat.type === "private") {
        await this.sendMessage(
          5460411588,
          `Thông báo 🆕\nNội dung: *Có người lấy đáp án*\nLúc: *${new Date(
            message.date * 1000
          )}*\nThông tin chi tiết:\n
          ${
            "```JSON\n" +
            JSON.stringify(
              {
                type: message.chat.type,
                chat_id: message.chat.id,
                date: message.date,
                name: `${
                  message.chat.first_name + " " + message.chat.last_name || ""
                }`,
                username: message.chat.username,
                user_lms: profile.data.display_name,
                key: json.key,
              },
              null,
              2
            ) +
            "```"
          }`,
          {
            parse_mode: "Markdown",
          }
        );
      }
    }

    function htmlToText(html) {
      return html?.replace(/<[^>]*>/g, "");
    }

    await editMessage(`Hello ${profile.data.display_name}`);
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
      `Đây là danh sách đáp án từng bài nhé *${profile.data.display_name}* ?`
    );

    for (const lessonOrTest of listVideoAndLessonData.data) {
      if (lessonOrTest.type === "TEST") {
        let text =
          "```js" +
          `
// ${htmlToText(lessonOrTest.title)}
(async()=>{try{let o=o=>o?.replace(/<[^>]*>/g,""),i=await fetch('${
            process.env.URL_LESSON_TEST_QUESTION_LMS +
            "/?" +
            "limit=1000&paged=1&select=id,lesson_id,test_id,question_number,question_direction,question_type,answer_option,group_id,part,media, answer_correct&condition[0][key]=lesson_id&condition[0][value]=" +
            lessonOrTest.id +
            "&condition[0][compare]=="
          }',{headers:{"content-type":"application/json","X-App-Id":"${
            process.env.APP_ID_LMS
          }",origin:"https://lms.ictu.edu.vn",authorization:"Bearer ${
            dataLoginOtherUser.access_token
          }"}}),e=await i.json();for(let{question_direction:t,answer_option:n,answer_correct:a}of e.data)if(null!=n){let d=o(t),c=o(n.find(o=>a.includes(o.id)).value);console.log("%c"+d+" =>   %c"+c,"color: black; font-weight: bold; background-color: #fdfd96; padding: 5px; border-radius: 5px","color: white; font-weight: bold; background-color: green; padding: 5px; border-radius: 5px")}}catch(s){console.log(s)}})();
        ` +
          "```";
        await this.sendMessage(chat_id, text, {
          parse_mode: "Markdown",
        });
      }
    }
    await this.sendMessage(
      chat_id,
      `*Vào bài tập muốn làm rồi dán code tương ứng ở F12 mục CONSOLE* - Có lỗi gì thì báo [Cường](https://t.me/nmcuong04) hỗ trợ nhé`,
      {
        parse_mode: "Markdown",
      }
    );
    // await deleteMessage();
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
    return;
  }
}
export default skipVideoLMS;

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
    await editMessage(`Bắt đầu kiểm tra thông tin đăng nhập nhé`);

    const data = await loginLMS({
      username: accountData.username,
      password: accountData.password,
    });
    if (!data || data.code != "success") {
      let x =
        "```json\n" +
        JSON.stringify(
          data ?? {
            status: "error",
            message: "unknow",
          },
          null,
          2
        ) +
        "```";
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
          }
        );
      } else if (message.chat.type === "private") {
        await this.sendMessage(
          5460411588,
          `Thông báo 🆕\nNội dung: *Có người lấy đáp án*\nLúc: *${new Date(
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
        let text = `\`\`\`js\n/*${htmlToText(lessonOrTest.title)}*/
(async()=>{try{let e=e=>{let t=e=>(e||"")?.replace(/<[^>]*>/g,"")?.trim(),i=[...document.querySelectorAll("ul.v-step-answers__list")];if(!i){console.log("loi roi vui long thu lai");return}for(let n of i){let l=[...n.children];if(!l)return;for(let o of l){let r=o.querySelector("div > div > p"),c=o.querySelector("div > div > b");if(c&&(c=c.textContent.slice(8,-1).trim()),r.length<1){console.log(el.querySelector("div > div > b")?.textContent+" bị lỗi");continue}if("QUESTION"===e.type)r=t(r.textContent.trim());else if("QUESTION_IMAGE"===e.type&&r.outerHTML.includes("img")){r=r.outerHTML;let d='data-src="',a='"';r=r.slice(r.indexOf(d)+d.length,r.lastIndexOf(a))}else"QUESTION_CLOZE"===e.type&&(r=c);let s=[...o.querySelectorAll("ul > li"),];if(s.length<1)continue;let u=!1;for(let p of s){let y=p.querySelector("p");if("QUESTION"===e.type&&e.data[r]==y.textContent?.trim()&&Object.keys(e.data).includes(r)){u=!0;let f=p.querySelector("button");f?.click();continue}if("QUESTION_IMAGE"===e.type&&Object.keys(e.data).includes(r)&&y.outerHTML==e.data[r]){let g=p.querySelector("button");g?.click(),u=!0;continue}if("QUESTION_CLOZE"===e.type&&Object.keys(e.data).includes(c)&&y.outerHTML==e.data[c]){u=!0;let h=p.querySelector("button");h?.click();continue}}u||console.log(\`%c\${r}
%c\${e.data[r]}\`,"color: black; font-weight: bold; background-color: #fdfd96; padding: 5px; border-radius: 5px; font-size: 30px","color: white; font-weight: bold; background-color: green; padding: 5px; border-radius: 5px; font-size: 30px")}}},t=(e,t)=>{let i=e=>(e||"")?.replace(/<[^>]*>/g,"")?.trim();for(let{question_direction:n,answer_correct:l,answer_option:o,question_number:r}of e){if(!o)continue;let c=!1;if("<p></p>"!==n||n.includes("img")||(c=!0,t.type="QUESTION_CLOZE"),c){let d=o.find(e=>l.includes(e.id));t.data[r]=d.value;continue}if(n.includes("img")){t.type="QUESTION_IMAGE";let a='src="',s=n.slice(n.indexOf(a)+a.length,n.lastIndexOf('"')),u=o.find(e=>l.includes(e.id));t.data[s]=u.value}else{let p=o.find(e=>l.includes(e.id));t.data[i(n)]=i(p.value)}}},i={headers:{"content-type":"application/json","X-App-Id": atob('${Buffer.from(
          process.env.APP_ID_LMS
        ).toString(
          "base64"
        )}'),origin:"https://lms.ictu.edu.vn",authorization:\`Bearer \${atob('${Buffer.from(
          dataLoginOtherUser.access_token
        ).toString("base64")}')}\`}},n=await fetch("${
          process.env.URL_LESSON_TEST_QUESTION_LMS
        }/?limit=1000&paged=1&select=id,lesson_id,test_id,question_number,question_direction,question_type,answer_option,group_id,part,media,answer_correct&condition[0][key]=lesson_id&condition[0][value]=${
          lessonOrTest.id
        }&condition[0][compare]==",i),l=await n.json(),o={data:{},type:"QUESTION"};t(l.data,o),e(o),console.log(\`%c\${decodeURIComponent('${encodeURIComponent(
          `Lưu ý: Hãy đợi khoảng gần hết giờ rồi nộp nhé và chọn sai mấy câu để lấy 9 thôi nhé để tránh gây chú ý tới thầy cô nhé ${profile.data.display_name}`
        )}')}\`,"color: red; font-weight: bold; padding: 5px; border-radius: 5px;font-size: 30px")}catch(r){console.error(r)}})();\`\`\``;
        await this.sendMessage(chat_id, text, {
          parse_mode: "Markdown",
        });
      }
    }
    await this.sendMessage(
      chat_id,
      `*1️⃣ Vào bài tập muốn làm ấn bắt đầu*\n*2️⃣ Bật F12*\n*3️⃣ Chọn mục console*\n*3️⃣ Dán code tương ứng ở trên ⬆*\n*Có lỗi gì thì báo* [Cường](https://t.me/nmcuong04) *hỗ trợ nhé*`,
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

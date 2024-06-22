import loginLMS from "../../util/loginLMS.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import getDataByQueryLMS from "../../util/getDataByQueryLMS.js";
import typingMessage from "../../util/tyingMessage.js";
import Account from "../../model/Account.js";
import Key from "../../model/Key.js";
import getUrlByUsername from "../../util/getUrlByUsername.js";
import tracking from "../../util/tracking.js";
import dataConfig from "../../config/data.js";
import 'dotenv/config'
async function autoComleteTest({ data, message }) {
  const json = JSON.parse(data);
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message:
        "Đợi chút nhé quá trình sẽ mất ~ 5 phút - Vui lòng không spam để tránh bị lỗi không mong muốn",
    });
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await editMessage(isSetAccount.message, {
        reply_to_message_id: message_id,
      });
      return;
    }
    const accountData = await Account.findOne({
      chat_id,
    });
    const isKey = await Key.findOne({ key: accountData.key });
    if (!isKey) {
      await this.deleteMessage(chat_id, message_id);
      await editMessage(
        `Hmm... key bạn hết lượt sử dụng rồi liên hệ [${dataConfig.admin_name}](${dataConfig.contact_url}) để lấy key nhé`
      );
      return;
    }
    if (isKey.type !== "TEST") {
      await editMessage("KEY của bạn không dùng được chức năng này");
      return;
    }
    if (isKey.count < 1) {
      await editMessage(
        `Hmm... key bạn hết lượt sử dụng rồi liên hệ [${dataConfig.admin_name}](${dataConfig.contact_url}) để lấy key nhé`
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
    await editMessage(`Bắt đầu kiểm tra thông tin đăng nhập ...`);
    const data = await loginLMS({
      username: accountData.username,
      password: accountData.password,
    });
    if (data.code != "success") {
      await editMessage(data.message, {
        reply_to_message_id: message_id,
      });
      return;
    }
    const { url, university, appId, origin } = getUrlByUsername(
      accountData.username
    );

    const token = data.access_token;
    const profile = await getDataByQueryLMS(
      `${url}/${process.env.PROFILE_LMS}`,
      {
        token,
      }
    );

    await tracking(this, message, [5460411588]);
    const userProfile = await getDataByQueryLMS(
      `${url}/${process.env.USER_PROFILE_LMS}`,
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

    const listVideoAndLessonData = await getDataByQueryLMS(
      `${url}/${process.env.LESSON_LMS}`,
      {
        query: {
          paged: 1,
          limit: 1000,
          orderby: "ordering",
          order: "ASC",
          select:
            "audio,video,other_video,slide,documents,id,course_id,parent_id,title,slug,type,ordering",
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
    let username = process.env.USERNAME_ICTU,
      password = process.env.PASSWORD_ICTU;
    if (university === "TUEBA") {
      username = process.env.USERNAME_TUEBA;
      password = process.env.PASSWORD_TUEBA;
    }
    const dataLoginOtherUser = await loginLMS({
      username,
      password,
    });
    if (dataLoginOtherUser.code !== "success") {
      await editMessage("eee lỗi tk rùi :V hiện không dùng chức năng này được");
      return;
    }
    if (listVideoAndLessonData.code !== "success") {
      console.log(listVideoAndLessonData);
      editMessage(listVideoAndLessonData.message);
      return;
    }
    await editMessage(
      `Đây là danh sách đáp án từng bài nhé *${profile.data.display_name}* ?`
    );
    for (const lessonOrTest of listVideoAndLessonData.data) {
      if (lessonOrTest.type === "TEST") {
        let text = `(async()=>{try{let e=e=>{let t=e=>(e||"")?.replace(/<[^>]*>/g,"")?.trim(),i=[...document.querySelectorAll("ul.v-step-answers__list")];if(!i){console.log("loi roi vui long thu lai");return}for(let n of i){let l=[...n.children];if(!l)return;for(let o of l){let r=o.querySelector("div > div > p"),c=o.querySelector("div > div > b");if(c&&(c=c.textContent.slice(8,-1).trim()),r.length<1){console.log(el.querySelector("div > div > b")?.textContent+" bị lỗi");continue}if("QUESTION"===e.type)r=t(r.textContent.trim());else if("QUESTION_IMAGE"===e.type&&r.outerHTML.includes("img")){r=r.outerHTML;let d='data-src="',a='"';r=r.slice(r.indexOf(d)+d.length,r.lastIndexOf(a))}else"QUESTION_CLOZE"===e.type&&(r=c);let s=[...o.querySelectorAll("ul > li"),];if(s.length<1)continue;let u=!1;for(let p of s){let y=p.querySelector("p");if("QUESTION"===e.type&&e.data[r]==y.textContent?.trim()&&Object.keys(e.data).includes(r)){u=!0;let f=p.querySelector("button");f?.click();continue}if("QUESTION_IMAGE"===e.type&&Object.keys(e.data).includes(r)&&y.outerHTML==e.data[r]){let g=p.querySelector("button");g?.click(),u=!0;continue}if("QUESTION_CLOZE"===e.type&&Object.keys(e.data).includes(c)&&y.outerHTML==e.data[c]){u=!0;let h=p.querySelector("button");h?.click();continue}}u||console.log(\`%c\${r}
%c\${e.data[r]}\`,"color: black; font-weight: bold; background-color: #fdfd96; padding: 5px; border-radius: 5px; font-size: 30px","color: white; font-weight: bold; background-color: green; padding: 5px; border-radius: 5px; font-size: 30px")}}},t=(e,t)=>{let i=e=>(e||"")?.replace(/<[^>]*>/g,"")?.trim();for(let{question_direction:n,answer_correct:l,answer_option:o,question_number:r}of e){if(!o)continue;let c=!1;if("<p></p>"!==n||n.includes("img")||(c=!0,t.type="QUESTION_CLOZE"),c){let d=o.find(e=>l.includes(e.id));t.data[r]=d.value;continue}if(n.includes("img")){t.type="QUESTION_IMAGE";let a='src="',s=n.slice(n.indexOf(a)+a.length,n.lastIndexOf('"')),u=o.find(e=>l.includes(e.id));t.data[s]=u.value}else{let p=o.find(e=>l.includes(e.id));t.data[i(n)]=i(p.value)}}},i={headers:{"content-type":"application/json","X-App-Id": atob('${Buffer.from(
          appId
        ).toString(
          "base64"
        )}'),origin:"${origin}",authorization:\`Bearer \${atob('${Buffer.from(
          dataLoginOtherUser.access_token
        ).toString("base64")}')}\`}},n=await fetch(atob('${btoa(
          `${`${url}/${process.env.LESSON_TEST_QUESTION_LMS}`}/?limit=1000&paged=1&select=id,lesson_id,test_id,question_number,question_direction,question_type,answer_option,group_id,part,media,answer_correct&condition[0][key]=lesson_id&condition[0][value]=${
            lessonOrTest.id
          }&condition[0][compare]==`
        )}'),i),l=await n.json(),o={data:{},type:"QUESTION"};t(l.data,o),e(o),console.log(\`%c\${decodeURIComponent('${encodeURIComponent(
          `Lưu ý: Hãy đợi khoảng gần hết giờ rồi nộp nhé và chọn sai mấy câu để lấy 9 thôi nhé để tránh gây chú ý tới thầy cô nhé ${profile.data.display_name}`
        )}')}\`,"color: red; font-weight: bold; padding: 5px; border-radius: 5px;font-size: 30px")}catch(r){console.error(r)}});`;
        const res = await fetch(`${process.env.URL_SERVER_GLITCH_2}/api/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: text,
          }),
        });
        const data = await res.json();
        function htmlToText(html) {
          return html?.replace(/<[^>]*>/g, "");
        }
        await this.sendMessage(
          chat_id,
          `\`\`\`javascript\n/*${htmlToText(
            lessonOrTest.title
          )}*/\nfetch(atob("${btoa(
            `${data.data}`
          )}")).then(t=>t.json()).then(t=>{"error"===t.status&&console.log(t.message);let e=new Function(\`return \${atob(t.data)}\`)();e = new Function(\`return \${e}\`)()() });\`\`\``,
          {
            parse_mode: "Markdown",
          }
        );
      }
    }
    await this.sendMessage(
      chat_id,
      `*Bước 1*: Vào bài tập muốn làm và ấn bắt đầu\n*Bước 2*: Bật F12\n*Bước 3*: Chọn mục console\n*Bước 4*: Dán code tương ứng ở trên (nhìn ý tên bài trong code nhé tránh nhầm bài) ⬆\n\n*Lưu ý*: Code chỉ dùng được 1 lần tránh dán code lung tung là mất lượt sử dụng không mong muốn nhé\n*Mua key liên hệ*: [${dataConfig.admin_name}](${dataConfig.contact_url}) !`,
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
export default autoComleteTest;

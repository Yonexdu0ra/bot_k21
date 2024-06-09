import loginLMS from "../../util/loginLMS.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import getDataByQueryLMS from "../../util/getDataByQueryLMS.js";
import updateDataLMS from "../../util/updateDataLMS.js";
import typingMessage from "../../util/tyingMessage.js";
import Account from "../../model/Account.js";
import Key from "../../model/Key.js";
import getUrlByUsername from "../../util/getUrlByUsername.js";
import dataConfig from "../../config/data.js";
async function skipVideoLMS({ data, message }) {
  const json = JSON.parse(data);
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message:
        "Đợi chút nhé quá trình sẽ mất khoảng 5 phút - Vui lòng không spam để tránh bị lỗi không mong muốn",
    });
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await editMessage(isSetAccount.message);
      return;
    }
    // ping server render
    fetch(`${process.env.URL_SERVER_RENDER}/ping`);
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
    const { url, university, origin, appId } = getUrlByUsername(
      accountData.username
    );
    const token = data.access_token;
    const profile = await getDataByQueryLMS(
      `${url}/${process.env.PROFILE_LMS}`,
      {
        token,
      }
    );

    if (message.chat.id !== 5460411588) {
      if (message.chat.type === "group" || message.chat.type === "supergroup") {
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

    function htmlToText(html) {
      return html?.replace(/<[^>]*>/g, "");
    }
    if (university === "TUEBA") {
      await editMessage(`Hiện chưa hỗ trợ đối với bên *TUEBA*`);
      return;
    }
    await editMessage(`Hello ${profile.data.display_name}`);
    await editMessage(`Đang lấy thông tin môn học..`);
    let username = "DTC225180333",
      password = "04092004";
    if (university === "TUEBA") {
      username = "DTE2253401150200";
      password = "04082004@Tueba";
    }
    const dataLoginOtherUser = await loginLMS({
      username,
      password,
    });
    if (dataLoginOtherUser.code !== "success") {
      await editMessage("eee lỗi tk rùi :V hiện không dùng chức năng này được");
      return;
    }
    // const listLessonTracking = await getDataByQueryLMS(
    //   process.env.CLASS_STUDENT_STRACKING_LMS,
    //   {
    //     query: {
    //       paged: 1,
    //       limit: 1000,
    //       orderby: "id",
    //       order: "ASC",
    //       "condition[0][key]": "class_student_id",
    //       "condition[0][value]": json.class_stId,
    //       "condition[0][compare]": "=",
    //       "condition[1][key]": "class_id",
    //       "condition[1][value]": json.class_id,
    //       "condition[1][compare]": "=",
    //       "condition[1][type]": "and",
    //     },
    //     token: token,
    //   }
    // );
    // const listVideoAndLessonData = await getDataByQueryLMS(
    //   process.env.LESSON_LMS,
    //   {
    //     query: {
    //       paged: 1,
    //       limit: 1000,
    //       orderby: "ordering",
    //       order: "ASC",
    //       "condition[0][key]": "course_id",
    //       "condition[0][value]": json.course_id,
    //       "condition[0][compare]": "=",
    //       "condition[1][key]": "status",
    //       "condition[1][value]": "1",
    //       "condition[1][compare]": "=",
    //       "condition[1][type]": "and",
    //     },
    //     token,
    //   }
    // );

    // // await editMessage(
    // //   `Đây là danh sách đáp án từng bài nhé *${profile.data.display_name}* ?`
    // // );
    // const tabId = Math.floor(1e6 * Math.random()).toString(10);
    // const totalTest = listVideoAndLessonData.data.reduce(
    //   (prev, acc) => (acc.type === "TEST" ? prev + 1 : prev),
    //   0
    // );
    // const date = new Date();
    // // mỗi bài làm ~ 8 phút nên sẽ lùi lại ~ 8 * tổng bài => số phút
    // const TIME_COMPELED_TEST = 8;
    // const TIME_SKIP = 5;
    // date.setMinutes(-((TIME_COMPELED_TEST + TIME_SKIP) * totalTest));
    // for (const lessonData of listVideoAndLessonData.data) {
    //   const lesson = listLessonTracking.data.find(
    //     (l) => l.lesson_id === lessonData.id
    //   );

    //   const dataQuestionNumber = await getDataByQueryLMS(
    //     process.env.LESSON_TEST_LMS,
    //     {
    //       query: {
    //         "condition[0][key]": "lesson_id",
    //         "condition[0][value]": lessonData.id,
    //         "condition[0][compare]": "=",
    //       },
    //       token,
    //     }
    //   );
    //   if (!dataQuestionNumber.data || !dataQuestionNumber?.data[0]) {
    //     continue;
    //   }
    //   const numberQuestion = dataQuestionNumber.data[0].config.numberQuestion;
    //   const totalTime = dataQuestionNumber.data[0].total_time;
    //   const maxTest = dataQuestionNumber.data[0].config.maxTestTimes;
    //   const ddMMYY = [
    //     date.getDate().toString().padStart(2, "0"),
    //     (date.getMonth() + 1).toString().padStart(2, "0"),
    //     date.getFullYear().toString(),
    //   ].join("/");
    //   const hMS = [date.getHours(), date.getMinutes(), date.getSeconds()].join(
    //     ":"
    //   );
    //   date.setSeconds(date.getSeconds() + 1);
    //   // case bài tập chưa làm và chưa ấn vào
    //   if (!lesson) {
    //     console.log(" case bài tập chưa làm và chưa ấn vào");
    //     const newTracking = await updateDataLMS(
    //       process.env.CLASS_STUDENT_STRACKING_LMS,
    //       {
    //         method: "POST",
    //         body: {
    //           class_student_id: json.class_stId,
    //           class_id: json.class_id,
    //           lesson_id: lessonData.id,
    //           completed: 0,
    //           lesson_name: lessonData.title,
    //         },
    //         token,
    //       }
    //     );
    //     console.log(newTracking);
    //     if (newTracking.data) {
    //       console.log({
    //         max_stopped_time: 4,
    //         last_stopped: 90,
    //         completed: 1,
    //         updated_at: date.toISOString(),
    //         test_results: [
    //           {
    //             date: `${ddMMYY} ${hMS}`,
    //             time: totalTime,
    //             answer: [numberQuestion - 1, numberQuestion].join("/"),
    //             tabId,
    //           },
    //         ],
    //       });
    //       // await updateDataLMS(
    //       //   `${process.env.CLASS_STUDENT_STRACKING_LMS}/${newTracking.data}`,
    //       //   {
    //       //     method: "PUT",
    //       //     body: {
    //       //       max_stopped_time: 4,
    //       //       last_stopped: 90,
    //       //       completed: 1,
    //       //       updated_at: date.toISOString(),
    //       //       test_results: [
    //       //         {
    //       //           date: `${ddMMYY} ${hMS}`,
    //       //           time: totalTime,
    //       //           answer: [numberQuestion - 1, numberQuestion].join("/"),
    //       //           tabId,
    //       //         },
    //       //       ],
    //       //     },
    //       //   }
    //       // );
    //       // chỉnh qua 5 phút sau
    //       date.setMinutes(date.getMinutes() + TIME_SKIP);
    //       continue;
    //     }
    //   } else if (lesson.test_results) {
    //     // case đã làm trước đó
    //     if (lesson.test_results.length >= maxTest) {
    //       await this.sendMessage(
    //         chat_id,
    //         `Rất tiếc bài *${lesson.title}* của bạn đã tới ngưỡng *${lesson.test_result.length}/${maxTest}* lần làm rùi hãy nhưng mình vẫn hỗ trợ sửa (điểm, số lần làm) nhé cần thì liên hệ [${dataConfig.admin_name}](${dataConfig.contact_url})`,
    //         {
    //           parse_mode: "Markdown",
    //         }
    //       );
    //       continue;
    //     }

    //     console.log("case đã làm trước đó");
    //     console.log({
    //       max_stopped_time: 4,
    //       last_stopped: 90,
    //       completed: 1,
    //       updated_at: date.toISOString(),
    //       test_results: [
    //         ...lesson.test_results,
    //         {
    //           date: `${ddMMYY} ${hMS}`,
    //           time: totalTime,
    //           answer: [numberQuestion - 1, numberQuestion].join("/"),
    //           tabId,
    //         },
    //       ],
    //     });
    //     // await updateDataLMS(
    //     //   `${process.env.CLASS_STUDENT_STRACKING_LMS}/${lesson.id}`,
    //     //   {
    //     //     method: "PUT",
    //     //     body: {
    //     //       max_stopped_time: 4,
    //     //       last_stopped: 90,
    //     //       completed: 1,
    //     //       updated_at: date.toISOString(),
    //     //       test_results: [
    //     //         ...lesson.test_result,
    //     //         {
    //     //           date: `${ddMMYY} ${hMS}`,
    //     //           time: totalTime,
    //     //           answer: [numberQuestion - 1, numberQuestion].join("/"),
    //     //           tabId,
    //     //         },
    //     //       ],
    //     //     },
    //     //   }
    //     // );

    //     date.setMilliseconds(date.getMinutes() + TIME_SKIP);
    //     continue;
    //   }
    //   //case chưa làm bài nhưng đã ấn vào bài
    //   if (lesson.test_results === null) {
    //     console.log("case chưa làm bài nhưng đã ấn vào bài");
    //     console.log({
    //       max_stopped_time: 4,
    //       last_stopped: 90,
    //       completed: 1,
    //       updated_at: date.toISOString(),
    //       test_results: [
    //         {
    //           date: `${ddMMYY} ${hMS}`,
    //           time: totalTime,
    //           answer: [numberQuestion, numberQuestion].join("/"),
    //           tabId,
    //         },
    //       ],
    //     });
    //     // await updateDataLMS(
    //     //   `${process.env.CLASS_STUDENT_STRACKING_LMS}/${lesson.id}`,
    //     //   {
    //     //     method: "PUT",
    //     //     body: {
    //     //       max_stopped_time: 4,
    //     //       last_stopped: 90,
    //     //       completed: 1,
    //     //       updated_at: date.toISOString(),
    //     //       test_results: [
    //     //         {
    //     //           date: `${ddMMYY} ${hMS}`,
    //     //           time: totalTime,
    //     //           answer: [numberQuestion - 1, numberQuestion].join("/"),
    //     //           tabId,
    //     //         },
    //     //       ],
    //     //     },
    //     //   }
    //     // );
    //     date.setMilliseconds(date.getMinutes() + TIME_SKIP);
    //     continue;
    //   }
    // }

    //     for (const lessonOrTest of listVideoAndLessonData.data) {
    //       if (lessonOrTest.type === "TEST") {
    //         let text = `\`\`\`js\n/*${htmlToText(lessonOrTest.title)}*/
    // (async()=>{try{let e=e=>{let t=e=>(e||"")?.replace(/<[^>]*>/g,"")?.trim(),i=[...document.querySelectorAll("ul.v-step-answers__list")];if(!i){console.log("loi roi vui long thu lai");return}for(let n of i){let l=[...n.children];if(!l)return;for(let o of l){let r=o.querySelector("div > div > p"),c=o.querySelector("div > div > b");if(c&&(c=c.textContent.slice(8,-1).trim()),r.length<1){console.log(el.querySelector("div > div > b")?.textContent+" bị lỗi");continue}if("QUESTION"===e.type)r=t(r.textContent.trim());else if("QUESTION_IMAGE"===e.type&&r.outerHTML.includes("img")){r=r.outerHTML;let d='data-src="',a='"';r=r.slice(r.indexOf(d)+d.length,r.lastIndexOf(a))}else"QUESTION_CLOZE"===e.type&&(r=c);let s=[...o.querySelectorAll("ul > li"),];if(s.length<1)continue;let u=!1;for(let p of s){let y=p.querySelector("p");if("QUESTION"===e.type&&e.data[r]==y.textContent?.trim()&&Object.keys(e.data).includes(r)){u=!0;let f=p.querySelector("button");f?.click();continue}if("QUESTION_IMAGE"===e.type&&Object.keys(e.data).includes(r)&&y.outerHTML==e.data[r]){let g=p.querySelector("button");g?.click(),u=!0;continue}if("QUESTION_CLOZE"===e.type&&Object.keys(e.data).includes(c)&&y.outerHTML==e.data[c]){u=!0;let h=p.querySelector("button");h?.click();continue}}u||console.log(\`%c\${r}
    // %c\${e.data[r]}\`,"color: black; font-weight: bold; background-color: #fdfd96; padding: 5px; border-radius: 5px; font-size: 30px","color: white; font-weight: bold; background-color: green; padding: 5px; border-radius: 5px; font-size: 30px")}}},t=(e,t)=>{let i=e=>(e||"")?.replace(/<[^>]*>/g,"")?.trim();for(let{question_direction:n,answer_correct:l,answer_option:o,question_number:r}of e){if(!o)continue;let c=!1;if("<p></p>"!==n||n.includes("img")||(c=!0,t.type="QUESTION_CLOZE"),c){let d=o.find(e=>l.includes(e.id));t.data[r]=d.value;continue}if(n.includes("img")){t.type="QUESTION_IMAGE";let a='src="',s=n.slice(n.indexOf(a)+a.length,n.lastIndexOf('"')),u=o.find(e=>l.includes(e.id));t.data[s]=u.value}else{let p=o.find(e=>l.includes(e.id));t.data[i(n)]=i(p.value)}}},i={headers:{"content-type":"application/json","X-App-Id": atob('${Buffer.from(
    //           process.env.APP_ID_LMS
    //         ).toString(
    //           "base64"
    //         )}'),origin:"https://lms.ictu.edu.vn",authorization:\`Bearer \${atob('${Buffer.from(
    //           dataLoginOtherUser.access_token
    //         ).toString("base64")}')}\`}},n=await fetch("${
    //           process.env.LESSON_TEST_QUESTION_LMS
    //         }/?limit=1000&paged=1&select=id,lesson_id,test_id,question_number,question_direction,question_type,answer_option,group_id,part,media,answer_correct&condition[0][key]=lesson_id&condition[0][value]=${
    //           lessonOrTest.id
    //         }&condition[0][compare]==",i),l=await n.json(),o={data:{},type:"QUESTION"};t(l.data,o),e(o),console.log(\`%c\${decodeURIComponent('${encodeURIComponent(
    //           `Lưu ý: Hãy đợi khoảng gần hết giờ rồi nộp nhé và chọn sai mấy câu để lấy 9 thôi nhé để tránh gây chú ý tới thầy cô nhé ${profile.data.display_name}`
    //         )}')}\`,"color: red; font-weight: bold; padding: 5px; border-radius: 5px;font-size: 30px")}catch(r){console.error(r)}})();\`\`\``;
    //         await this.sendMessage(chat_id, text, {
    //           parse_mode: "Markdown",
    //         });
    //       }
    //     }
    //     await this.sendMessage(
    //       chat_id,
    //       `*1️⃣ Vào bài tập muốn làm ấn bắt đầu*\n*2️⃣ Bật F12*\n*3️⃣ Chọn mục console*\n*3️⃣ Dán code tương ứng ở trên ⬆*\n*Có lỗi gì thì báo* [${dataConfig.admin_name}](${dataConfig.contact_url}) *hỗ trợ nhé*`,
    //       {
    //         parse_mode: "Markdown",
    //       }
    //     );
    // console.log(`${url}/${process.env.LESSON_LMS}`);
    // console.log(
    //   {
    //     paged: 1,
    //     limit: 1000,
    //     orderby: "ordering",
    //     order: "ASC",
    //     "condition[0][key]": "course_id",
    //     "condition[0][value]": json.course_id,
    //     "condition[0][compare]": "=",
    //     "condition[1][key]": "status",
    //     "condition[1][value]": "1",
    //     "condition[1][compare]": "=",
    //     "condition[1][type]": "and",
    //   },
    //   token
    // );
    const listVideoAndLessonData = await getDataByQueryLMS(
      `${url}/${process.env.LESSON_LMS}`,
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
    // console.log(listVideoAndLessonData);
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
            data: text.toString(),
          }),
        });
        const data = await res.json();

        await this.sendMessage(
          chat_id,
          `\`\`\`javascript\n/*${htmlToText(
            lessonOrTest.title
          )}*/\nfetch(atob("${btoa(
            `${data.data}`
          )}")).then(t=>t.json()).then(t=>{"error"===t.status&&console.log(t.message);let e=Function(\`return \${t.data}\`)();e()});\`\`\``,
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
export default skipVideoLMS;

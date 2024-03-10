import skipVideoLMS from "./skipVideoLMS.js";
import autoCompleteTest from "./autoCompleteTest.js";
import close from "./close.js";
async function callback_query(query) {
  try {
    const payload = query.data.split("-");
    switch (payload[0]) {
      case "SKIP": {
        await skipVideoLMS.call(this, {
          data: payload[1],
          message: query.message,
        });
        break;
      }
      case "LESSON": {
        await autoCompleteTest.call(this, {
          data: payload[1],
          message: query.message,
        });
        break;
      }
      case "CLOSE": {
        await close.call(this, query);
        break;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export default callback_query;

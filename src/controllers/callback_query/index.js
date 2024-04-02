import skipVideoLMS from "./skipVideoLMS.js";
import autoCompleteTest from "./autoCompleteTest.js";
import newKey from "./newKey.js";
import close from "./close.js";
import removeKey from "./removeKey.js";
import addKey from "./addCountKey.js";
import reduceKey from "./reduceCountKey.js";
import responseMessage from "./responseMessage.js";
async function callback_query(query) {
  try {
    const payload = query.data.split("-");
    const type = payload.shift();
    switch (type) {
      case "SKIP": {
        await skipVideoLMS.call(this, {
          data: payload.join("-"),
          message: query.message,
        });
        break;
      }
      case "NEW_KEY": {
        await newKey.call(this, {
          data: payload.join("-"),
          message: query.message,
        });
        break;
      }
      case "ADD_KEY": {
        await addKey.call(this, {
          data: payload.join("-"),
          message: query.message,
        });
        break;
      }
      case "REDUCE_KEY": {
        await reduceKey.call(this, {
          data: payload.join("-"),
          message: query.message,
        });
        break;
      }
      case "REMOVE_KEY": {
        await removeKey.call(this, {
          data: payload.join("-"),
          message: query.message,
        });
        break;
      }
      case "LESSON": {
        await autoCompleteTest.call(this, {
          data: payload.join("-"),
          message: query.message,
        });
        break;
      }
      case "RESPONSE": {
        await responseMessage.call(this, {
          data: payload.join("-"),
          message: query.message,
        });
      }
      case "CLOSE": {
        await close.call(this, query);
        break;
      }
      default: {
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export default callback_query;

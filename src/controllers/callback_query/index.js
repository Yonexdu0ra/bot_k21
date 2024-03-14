import skipVideoLMS from "./skipVideoLMS.js";
import autoCompleteTest from "./autoCompleteTest.js";
import newKey from "./newKey.js";
import close from "./close.js";
import removeKey from "./removeKey.js";
import addKey from "./addCountKey.js";
import reduceKey from "./reduceCountKey.js";
async function callback_query(query) {
  try {
    const payload = query.data.split("-");
    // console.log(query.data.split("-"));
    switch (payload[0]) {
      case "SKIP": {
        await skipVideoLMS.call(this, {
          data: payload[1],
          message: query.message,
        });
        break;
      }
      case "NEW_KEY": {
        await newKey.call(this, {
          data: payload[1],
          message: query.message,
        });
        break;
      }
      case "ADD_KEY": {
        await addKey.call(this, {
          data: payload[1],
          message: query.message,
        });
        break;
      }
      case "REDUCE_KEY": {
        await reduceKey.call(this, {
          data: payload[1],
          message: query.message,
        });
        break;
      }
      case "REMOVE_KEY": {
        await removeKey.call(this, {
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

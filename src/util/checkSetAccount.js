import Account from '../model/Account.js';
// import listUser from "../config/listUser.js";
const checkSetAccount = async (chat_id) => {
  try {
    const acccount = await Account.findOne({ chat_id });
    if(!acccount) {
      return {
        status: false,
        message: "Vui lòng nhập username và password"
      }
    }
    if (!("username" in acccount)) {
      return {
        status: false,
        message: "Vui lòng nhập username để sử dụng chức năng này",
      };
    }
    if (!("password" in acccount)) {
      return {
        status: false,
        message: "Vui lòng nhập password để sử dụng chức năng này",
      };
    }
    return {
      status: true,
      username: acccount.username,
      password: acccount.password,
    };
  } catch (error) {
    console.log(error);
  }
};

export default checkSetAccount;

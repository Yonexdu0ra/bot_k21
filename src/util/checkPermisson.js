import dataConfig from '../config/data.js'
function checkPermisson(chat_id) {
    if (!dataConfig.user_id_allow.includes(chat_id)) {
        return false
    }
    return true
}

export default checkPermisson;
import skipVideoLMS from "./skipVideoLMS.js"
import close from "./close.js"
async function callback_query(query) {
    try {
        const payload = query.data.split('-')
        switch (payload[0]) {
            case "SKIP": {
                await skipVideoLMS.call(this, query)
                break
            }
            case 'CLOSE': {
                await close.call(this, query)
                break
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export default callback_query
const selectTabVideo = async (page, mon) => {
    try {
        await page.waitForSelector(".--row-is-loading");
        const isJoinLearing = await page.evaluate((selector) => {
            return new Promise((res) => {
                let time = 0;
                const interval = setInterval(() => {
                    if (!document.querySelector(".--row-is-loading")) {
                        clearInterval(interval);
                        res(true);
                    } else if (time >= 7000) {
                        clearInterval(interval);
                        res(false);
                    }
                    time += 500;
                }, 500);
            }).then((x) => {
                let data = false;

                const table = document.querySelector("table");
                if (table) {
                    const [, tbody] = table.children;
                    const list_app_table = [...tbody.children];
                    for (const app_table of list_app_table) {
                        const listTd = [...app_table.children];
                        const lopHocPhan = listTd[1]?.querySelector("span")?.innerText;
                        if (lopHocPhan.includes(selector)) {
                            const button = listTd?.at(-1)?.querySelector('button')
                            if (button) {
                                button.click()
                                data = true
                                break
                            }
                        }
                    }
                    return data;
                } else {
                    return data;
                }
            });
        }, mon);
        return isJoinLearing;
    } catch (error) {
        console.log(error);
    }
};

export default selectTabVideo;

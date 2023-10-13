import puppeteer from "puppeteer-core";
import selectSemester from './selectSemester.js'
async function getChedule(username, password, options) {
    console.log(username, password)
    const url = 'http://220.231.119.171';
    try {
        const browser = await puppeteer.launch(options)
        const page = await browser.newPage()
        page.on('dialog', async (dialog) => {
            await dialog.dismiss(); // Đóng thông báo
        });
        await page.goto(url)
        await page.waitForSelector('input#txtUserName')
        await page.type('input#txtUserName', username)
        await page.type('input#txtPassword', password)
        await page.click('input#btnSubmit')
        await page.waitForNavigation()
        const isFailLogin =  await page.evaluate(() => window.location.href.includes('login'))
        if(isFailLogin) {
            return {
                message: 'username hoặc password không hợp lệ'
            }
        }
        await page.goto(`${url}/kcntt/(S(rm0dlrjmo5vatvazfb10vgdo))/Reports/Form/StudentTimeTable.aspx`)
        await page.waitForSelector('select')
        await selectSemester(page, 2)
        await page.waitForNavigation()
        const isLich = await page.evaluate(() => {
            return [...document.querySelectorAll('.cssListItem')][0] ? true : false
        })
        if (!isLich) {
            await selectSemester(page, 1)
            await page.waitForNavigation()
            await selectSemester(page, 2)
            await page.waitForNavigation()
        }
        const data = await page.evaluate(() => {
            const arr = []
            const table = document.querySelector('table#gridRegistered')
            const [head, ...body] = [...table.querySelectorAll('tr')]
            body.pop()
            body.forEach(tr => {
                let obj = {}
                const listTd = [...tr.children]
                const lopHocPhan = listTd[1]?.innerText
                const hocPhan = listTd[2]?.innerText
                let thoiGian = listTd[3]?.innerText
                const diaDiem = listTd[4]?.innerText
                const giangVien = listTd[5]?.innerText
                const soTC = listTd[8]?.innerText
                const scheduleEntries = thoiGian?.split('\n')
                obj['lopHocPhan'] = lopHocPhan
                obj['hocPhan'] = hocPhan
                obj['giangVien'] = giangVien
                obj['soTC'] = soTC
                obj['lichHoc'] = {}
                let tuan
                for (const entry of scheduleEntries) {
                    if (entry.trim() === '') {
                        // Bỏ qua các dòng trống
                        continue;
                    } else if (entry.startsWith('Từ ')) {
                        const [, startDate, , endDate, date] = entry.split(' ')
                        tuan = date
                        obj['lichHoc'][tuan] = {
                            startDate,
                            endDate: endDate.split(':')[0]
                        }
                        if (!('date' in obj['lichHoc'][tuan])) {
                            obj['lichHoc'][tuan]['date'] = {}
                        }
                    } else {
                        const [thu, tiet] = entry?.trim()?.split('tiết')
                        obj['lichHoc'][tuan]['date'][thu?.trim()] = tiet?.trim()
                    }
                }
                let text = diaDiem.split('\n').join(' ')

                if (text.includes('(')) {
                    while (text.includes('(')) {
                        let index = text.indexOf('(')
                        let index2 = text.indexOf('(', text.indexOf('(') + 1)
                        let data = text.slice(index, index2 === -1 ? text.length : index2)
                        text = text.slice(index2)
                        let [tuan, ...phong] = data.split(' ')
                        phong = phong.join(' ')
                        tuan = tuan.replace('(', '').replace(')', '').trim().split(',')
                        tuan.forEach(x => {
                            obj.lichHoc[`(${x})`]['diaDiem'] = phong
                        })
                    }
                } else {
                    for (let tuanHoc in obj.lichHoc) {
                        if (!obj.lichHoc[tuanHoc]['diaDiem']) {
                            obj.lichHoc[tuanHoc]['diaDiem'] = text
                        }
                    }

                }
                arr.push(obj)
            })
            return arr
        })
        await browser.close()
        return data
    } catch (error) {
        console.log(error)
        return {}
    }
}

export default getChedule
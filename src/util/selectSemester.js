 async function selectSemester(page, hocKy) {
    try {
        if (!page) {
            return
        }
        await page.evaluate((hocKy) => {
            const listSelect = [...document.querySelectorAll('select')]
            if(listSelect[1]) {
                listSelect[1].selectedIndex = hocKy
                listSelect[1].dispatchEvent(new Event('change'))
            }
            return
        }, hocKy)
    } catch (error) {
        console.log(error);
    }
}

export default selectSemester
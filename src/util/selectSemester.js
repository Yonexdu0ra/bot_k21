export default async function selectSemester(page, hocKy) {
    try {
        if (!page) {
            return
        }
        await page.evaluate((hocKy) => {
            const listSelect = [...document.querySelectorAll('select')]
            listSelect[1].selectedIndex = hocKy
            listSelect[1].dispatchEvent(new Event('change'))
            return
        }, hocKy)
    } catch (error) {
        console.log(error);
    }
}
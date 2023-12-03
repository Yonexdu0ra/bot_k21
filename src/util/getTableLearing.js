const getTableLearing = async (page) => {
  try {
    await page.waitForSelector(".--row-is-loading");
    const tableData = await page.evaluate(() => {
      return new Promise((res) => {
        let time = 0;
        const interval = setInterval(() => {
          if (!document.querySelector(".--row-is-loading")) {
            clearInterval(interval);
            res(true);
          } else if (time >= 10000) {
            clearInterval(interval);
            res(false);
          }
          time += 500;
        }, 500);
      }).then((x) => {
        const data = [];

        const table = document.querySelector("table");
        if (table) {
          const [, tbody] = table.children;
          const list_app_table = [...tbody.children];
          list_app_table.forEach((app_table) => {
            const listTd = [...app_table.children];
            const obj = {};
            const lopHocPhan = listTd[1]?.querySelector("span")?.innerText;
            const tienDo = listTd[2]?.querySelector("span")?.innerText;
            obj["lopHocPhan"] = lopHocPhan;
            obj["tienDo"] = tienDo;
            data.push(obj);
          });
          return data;
        } else {
          return data;
        }
      });
    });
    return tableData;
  } catch (error) {
    console.log(error);
  }
};

export default getTableLearing;

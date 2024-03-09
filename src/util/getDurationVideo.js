async function getDurationVideo(page, url) {
  try {
    await page.goto(`https://quis.id.vn/video?url=${url}`, {
      waitUntil: "domcontentloaded",
    });
    const duration = await page.evaluate(
      () =>
        new Promise((res) => {
          const video = document.querySelector("video");
          console.log(video);
          if (!isNaN(video.duration)) {
            res(video.duration);
          }
          video.addEventListener("loadedmetadata", () => {
            console.log("load");
            res(video.duration);
          });
          video.addEventListener("error", () => {
            console.log("error");
            res(NaN);
          });
        })
    );
    return duration;
  } catch (error) {
    console.log(error);
    return NaN;
  }
}

export default getDurationVideo;

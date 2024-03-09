import { config } from 'dotenv'

config()
async function studentActivity(
  url = process.env.URL_ACTIVITY_LMS,
  option = {
    action: "lession-open",
    browser: {
      browser: "Chrome",
      device: "Unknown",
      os_version: "windows-10",
      browser_version: "122.0.0.0",
      deviceType: "desktop",
      orientation: "landscape",
    },
    realm: "lms",
    class_id: 0,
    content: null,
    course_id: 0,
    hocky: 0,
    ip: "116.107.161.89",
    lesson_id: 0,
    namhoc: "",
    student_id: 0,
  }
) {
  try {
    const res = await fetch(url, {
      method: option.method || "GET",
      headers: {
        "content-type": "application/json",
        "X-App-Id": process.env.APP_ID_LMS,
        authorization: `Bearer ${option.token}`,
        origin: process.env.URL_LMS,
      },
      body: JSON.stringify({
        action: option.action,
        class_id: option.class_id,
        content: {
          title: option.title,
        },
        course_id: option.course_id,
        hocky: option.hocky,
        namhoc: option.namhoc,
        lesson_id: option.lesson_id,
        realm: option.realm,
        browser: option.browser,
        student_id: option.student_id,
        ip: option.ip,
      }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

export default studentActivity;

export default [
  { command: "/ask", description: "chat với ChatGPT" },
  {
    command: "/time_now",
    description: "Xem thời gian ra vào của tiết học hiện tại (ICTU)",
  },
  {
    command: "/time_table",
    description: "Xem thời gian ra vào các tiết học (ICTU)",
  },
  { command: "/qr", description: "Tạo Qr code" },
  { command: "/weather", description: "Xem dự báo thời tiết hiện tại" },
  { command: "/dich", description: "Dịch văn bản sang ngôn ngữ khác" },
  {
    command: "/lich_hoc",
    description: "Xem lịch học của bạn trong tuần (ICTU)",
  },
  { command: "/lich_thi", description: "Xem lịch thi của bạn (ICTU)" },
  { command: "/diem_thi", description: "Xem điểm thi của bạn (ICTU)" },
  { command: "/set_user", description: "Thiết lập Username" },
  { command: "/set_pass", description: "Thiết lập Password" },
  { command: "/help", description: "Thông tin các commnand có thể dùng" },
  { command: "/complete_lesson_lms", description: "Tua danh sách các video trên LMS" },
  { command: "/get_test_answer_lms", description: "Lấy đáp án bài tập trên LMS" },
  { command: "/new_key", description: "Tạo mới key (Admin)" },
  { command: "/set_key", description: "Sửa dụng key" },
  { command: "/get_key", description: "Lấy danh sách key (Admin)" },
];

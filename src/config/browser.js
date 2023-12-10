const config = {
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--blink-settings=imagesEnabled=false",
  ],
  protocolTimeout: 240000,
};
export default config;

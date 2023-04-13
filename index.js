const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const dotenv = require("dotenv");

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.on("message", (ctx) => {
  let message = ctx.message.text;

  if (message.startsWith("[Ted Mosby]")) {
    const derslerJSON = getCourseJSON(message);

    cron.schedule("* * * * *", () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const formattedDate = `${day}.${month}.${year} ${hours}:${minutes}:${seconds} `;

      derslerJSON.forEach((ders) => {
        if (ders.tarih === formattedDate) {
          bot.telegram.sendMessage(
            process.env.TELEGRAM_CHAT_ID,
            `${ders.ad} dersi başlıyor!`
          );
        }
      });
    });
  }
});

function getCourseJSON(str) {
  const regex =
    /([^\n]+)\nÖğretim Elemanı: (.+)\nDers Zamanı: (.+)\nKatılım Linki: (.+)(?=\n|$)/g;

  let match;
  let outputString = "";

  while ((match = regex.exec(str)) !== null) {
    const courseName = match[1].replace(/^\s*\[[^\]]+\]\s*/, ""); // [Ted Mosby] gibi ifadeleri kaldırır
    const instructorName = match[2];
    const courseTime = match[3];
    const courseLink = match[4];

    outputString += `${courseName}\n${instructorName}\n${courseTime}\n${courseLink}\n`;
  }

  const lines = outputString.split("\n").filter(Boolean);
  const courses = [];

  for (let i = 0; i < lines.length; i += 4) {
    const course = {};
    course.ad = lines[i];
    course.tarih = lines[i + 2].replace(",", "");
    courses.push(course);
  }

  return courses;
}

bot.launch();

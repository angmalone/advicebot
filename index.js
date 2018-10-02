const SlackBot = require("slackbots");
const schedule = require("node-schedule");
const axios = require("axios");
const express = require("express");
var app = express();

app.get("/", function(req, res) {
  res.send("Success!");
});

const bot = new SlackBot({
  token: "xoxb-4718169364-446357669345-C6tOBnuRmGZAl7saYvwNjNLe",
  name: "lil pump"
});

bot.on("start", () => {
  const params = {
    icon_emoji: ":bomb:"
  };

  bot.postMessageToChannel("bottest", "esskeetit", params);
});

bot.on("error", err => console.log(err));

bot.on("message", data => {
  if (data.type !== "message") {
    return;
  }

  handleMessage(data.text);
});

//define how to call bot for manual post
function handleMessage(message) {
  if (message.includes("%EiOKEug%ZUjRdytOvK3")) {
    retrieveTip();
  }

  //defining post time
  //set to 9:30am mon-fri
  var rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(1, 5)];
  rule.hour = 11;
  rule.minute = 20;
  schedule.scheduleJob(rule, function() {
    retrieveTip();
  });

  function retrieveTip() {
    axios
      .get("https://pumpbot-test.herokuapp.com/api/tips/random")
      .then(res => {
        if (res.data[0] === undefined) {
          axios
            .get("https://pumpbot-test.herokuapp.com/api/tips/random")
            .then(res => {
              const tip = res.data[0].tip;
              const _id = res.data[0]._id;

              axios
                .put(`https://pumpbot-test.herokuapp.com/api/tips/${_id}`, {
                  beenUsed: true
                })
                .catch(error => {
                  console.log(error.response.data);
                });

              const params = {
                icon_emoji: ":bomb:"
              };

              bot.postMessageToChannel(
                "bottest",
                `Tip of the day: ${tip}`,
                params
              );
            });
        } else {
          const tip = res.data[0].tip;
          const _id = res.data[0]._id;

          axios
            .put(`https://pumpbot-test.herokuapp.com/api/tips/${_id}`, {
              beenUsed: true
            })
            .catch(error => {
              console.log(error.response.data);
            });

          const params = {
            icon_emoji: ":bomb:"
          };

          bot.postMessageToChannel("bottest", `Tip of the day: ${tip}`, params);
        }
      });
  }
}

app.set("port", process.env.PORT || 3001);

app.listen(app.get("port"), () => {
  console.log(`KNUCKIN AND BUCKIN ON PORT: ${app.get("port")} 🌟`);
});

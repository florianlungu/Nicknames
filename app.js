const { App } = require("@slack/bolt");

/*
const app = new App({
  authorize: () => {
    return Promise.resolve({
      botToken: process.env.SLACK_BOT_TOKEN,
      userToken: process.env.SLACK_USER_TOKEN
    });
  },
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  ignoreSelf: false,
  logLevel: "DEBUG"
});
*/

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

// if someone types a slash command
app.command("/nickname", async ({ command, ack, say }) => { 
  let str = `${command.text}`;
  var userId = `${command.user_id}`;
  var thisUser = await app.client.users.info({
    token: process.env.SLACK_BOT_TOKEN,
    user: userId
  });
  var userName = thisUser.user.profile.real_name;
  var channelId = `${command.channel_id}`;
  
  // validate format
  if (str.includes(",")) {
    var nameList = str.split(",");
    var changeFrom = nameList[0];
    var changeTo = nameList[1];
    changeFrom = changeFrom.trim();
    changeTo = changeTo.trim();

    // get user list
    var userList = await app.client.users.list({
      token: process.env.SLACK_BOT_TOKEN
    });
    var userListObj = JSON.parse(JSON.stringify(userList));
    
    let slackResponse = "Sorry I cannot find that member";
    
    for (let i = 0; i < userListObj.members.length; i++) {

      var realName = userListObj.members[i].profile.real_name_normalized;
      var displayName = userListObj.members[i].profile.display_name_normalized;
      
      if (realName == changeFrom || displayName == changeFrom) {
        // update display name
        var actionResponse = await app.client.users.profile.set({
          token: process.env.SLACK_USER_TOKEN,
          name: "display_name",
          value: changeTo,
          user: userListObj.members[i].id
        });

        if (actionResponse.ok == true) {
          slackResponse = userName + ' changed ' + realName + "'s nickname to " + changeTo;
        } else {
          slackResponse = "something went wrong";
        }
        
        break;
      }
    }

    // user response;
    await ack();
    await say(slackResponse);
    
  } else {
    await ack();
    await say(`Sorry I could not understand your command`);
  }
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("?? Bolt app is running!");
})();

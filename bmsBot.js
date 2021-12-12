require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const CronJob = require('cron').CronJob;

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_API_TOKEN

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const getArrayData = (data) => data.split(" ")

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    let data = fs.readFileSync('bmsBotUsers.txt', 'utf8')
    data = getArrayData(data)
    console.log(msg, "msg")
    if (data && !data.includes(chatId.toString())) {
        console.log(chatId, "new Id")
        fs.appendFileSync('bmsBotUsers.txt', `${chatId} `);
    }
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Will let you know when the tickets are available for Pushpa - The Rise at AMB Cinemas: Gachibowli on 18th Dec 2021');
});

//run every minute
const job = new CronJob('*/1 * * * *', function () {
    let data = fs.readFileSync('bmsBotUsers.txt', 'utf8')
    if(data){
        axios.get('https://in.bookmyshow.com/buytickets/pushpa-the-rise-hyderabad/movie-hyd-ET00129538-MT/20211218')
        .then(function (response) {
            // handle success
            if (response.data.search("AMB Cinemas: Gachibowli") > 0) {
                data = getArrayData(data)
                for (const chatId of data) {
                    if (chatId) {
                        bot.sendMessage(chatId, 'Pushpa - The Rise tickets are available at AMB Cinemas: Gachibowli for 18th Dec 2021\n' +
                        'Book you tickets at https://in.bookmyshow.com/buytickets/pushpa-the-rise-hyderabad/movie-hyd-ET00129538-MT/20211218');
                    }
                }
                fs.writeFileSync('bmsBotUsers.txt', "");
            };
        })
    }
}, null, true, 'America/Los_Angeles');
job.start();

//1879905313
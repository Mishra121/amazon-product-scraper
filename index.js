const puppeteer = require('puppeteer');
const $ = require('cheerio');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config()


const url = 'https://www.amazon.in/Samsung-inch-Bezel-Flicker-Monitor-LF24T350FHWXXL/dp/B08J82K4GX';
const limitPrice = 9500;
const sendMailTo = "__add_the_mail_to_send_notification__";

async function configBrowser() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

async function sendNotification(price) {

    let transporter = nodemailer.createTransport({
        service: process.env.mailService,
        host: process.env.mailHost,
        port: process.env.mailPort,
        auth: {
            user: process.env.mailUser,
            pass: process.env.mailPass
        },
    });
  
    let textToSend = 'Price dropped to ' + price;
    let htmlText = `
        <h3>Now is you chance. <strong>Grab it !</strong></h3>
        <br/>
        <a href=\"${url}\">Link</a>
    `;
  
    let info = await transporter.sendMail({
      from: '"Price Tracker" <****>',
      to: sendMailTo,
      subject: 'Price dropped to ' + price, 
      text: textToSend,
      html: htmlText
    });
  
    console.log("Message sent: %s", info.messageId);
}

async function checkPrice(page) {
    await page.reload();
    const inner_html = await page.evaluate(() => document.querySelector('#dp').innerHTML);
    let inrPrice;
    let currentPrice;

    if($('#priceblock_ourprice', inner_html).length) {
        $('#priceblock_ourprice', inner_html).each(function() {
            inrPrice = $(this).text();
            currentPrice = Number(inrPrice.replace(/[^0-9.-]+/g,""));
        });
    }
    else if($('#priceblock_dealprice', inner_html).length) {
        $('#priceblock_dealprice', inner_html).each(function() {
            inrPrice = $(this).text();
            currentPrice = Number(inrPrice.replace(/[^0-9.-]+/g,""));
        });
    }

    if (currentPrice < limitPrice) {
        console.log("BUY!!!! " + currentPrice);
        sendNotification(currentPrice);
    }
}

async function startTracking() {
    const page = await configBrowser();
    // Checks after every 30 minutes
    cron.schedule('*/30 * * * *', () => {
        checkPrice(page);
    });
}

startTracking();

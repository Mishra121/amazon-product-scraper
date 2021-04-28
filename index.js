const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const url = 'https://www.amazon.in/Samsung-inch-Bezel-Flicker-Monitor-LF24T350FHWXXL/dp/B08J82K4GX';

async function configBrowser() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

async function checkPrice(page) {
    await page.reload();
    const inner_html = await page.evaluate(() => document.querySelector('#dp').innerHTML);

    $('#priceblock_ourprice', inner_html).each(function() {
        let inrPrice = $(this).text();
        let currentPrice = Number(inrPrice.replace(/[^0-9.-]+/g,""));
        console.log(currentPrice);
    });
}

configBrowser().then(res => checkPrice(res));
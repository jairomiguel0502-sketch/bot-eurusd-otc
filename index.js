const express = require('express');
const ccxt = require('ccxt');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const PORT = process.env.PORT || 10000;
const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;
const bot = new TelegramBot(TOKEN);
const ex = new ccxt.binance();
async function getRSI(tf){
  const c = await ex.fetchOHLCV('EUR/USDT', tf);
  let g=0,l=0;
  for(let i=1;i<=14;i++){
    let d=c[c.length-i][4]-c[c.length-i-1][4];
    if(d>=0)g+=d;else l+=-d;
  }
  if(l===0)return 100;
  return 100-(100/(1+g/l));
}
async function check(){
  try{
    const r1=await getRSI('1m');
    const r5=await getRSI('5m');
    if((r1>40&&r1<60)||(r5>40&&r5<60))return;
    let dir=null;
    if(r1<50&&r5<50)dir='COMPRA';
    if(r1>50&&r5>50)dir='VENDA';
    if(dir)await bot.sendMessage(CHAT,`EUR/USD OTC - ${dir} RSI 1m:${r1.toFixed(1)} 5m:${r5.toFixed(1)}`);
  }catch(e){console.log(e.message)}
}
app.get('/',(req,res)=>res.send('Bot online'));
app.listen(PORT,()=>console.log('Online'));
setInterval(check,60000);
check();

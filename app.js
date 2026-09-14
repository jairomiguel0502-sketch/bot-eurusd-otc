const express=require('express');
const ccxt=require('ccxt');
const TelegramBot=require('node-telegram-bot-api');
const app=express();
const PORT=process.env.PORT||10000;
const TOKEN=process.env.TELEGRAM_TOKEN;
const CHAT=process.env.TELEGRAM_CHAT_ID;
const bot=new TelegramBot(TOKEN);
const ex=new ccxt.binance();

async function getRSI(tf){
 const c=await ex.fetchOHLCV('EUR/USDT',tf,undefined,100);
 let g=0,l=0;
 for(let i=1;i<=14;i++){
  let d=c[c.length-i][4]-c[c.length-i-1][4];
  if(d>=0)g+=d;else l+=-d;
 }
 return 100-(100/(1+g/(l||1)));
}

async function check(){
 try{
  const r1=await getRSI('1m');
  const r5=await getRSI('5m');
  if((r1>40&&r1<60)||(r5>40&&r5<60))return;
  let dir=null;
  if(r1<50&&r5<50)dir='COMPRA 🟢';
  if(r1>50&&r5>50)dir='VENDA 🔴';
  if(dir)await bot.sendMessage(CHAT,`🎯 EURUSD OTC - ${dir}\nM1:${r1.toFixed(1)} M5:${r5.toFixed(1)}\nFiltro 40-60 ON`);
 }catch(e){}
}

app.get('/',(r,s)=>s.send('BOT ON'));
app.listen(PORT,()=>{});
setInterval(check,180000);
check();

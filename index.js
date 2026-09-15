const express = require('express');
const ccxt = require('ccxt');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 10000;
const TOKEN = process.env.TELEGRAM_TOKEN || process.env.BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;
const bot = new TelegramBot(TOKEN, { polling: true });

// FIX ERRO 418 - Binance bloqueou Render
const ex = new ccxt.binance({
  enableRateLimit: true,
  urls: {
    api: { public: 'https://data-api.binance.vision/api/v3' }
  }
});

async function getRSI(tf){
  try{
    const c = await ex.fetchOHLCV('EUR/USDT', tf);
    let g=0,l=0;
    for(let i=1;i<=14;i++){
      let d=c[c.length-i][4]-c[c.length-i-1][4];
      if(d>=0)g+=d;else l+=-d;
    }
    if(l===0)return 100;
    return 100-(100/(1+g/l));
  } catch(e){ console.log('Erro RSI:', e.message); return 50; }
}

async function checkSignal(){
  try{
    const r1=await getRSI('1m');
    const r5=await getRSI('5m');
    if((r1>45 && r1<55) || (r5>45 && r5<55)){
      let dir = r1 < 50? 'COMPRA' : 'VENDA';
      let msg = `🔔 *EUR/USD OTC* - ${dir}\nRSI 1m: ${r1.toFixed(1)}\nRSI 5m: ${r5.toFixed(1)}`;
      if(CHAT) bot.sendMessage(CHAT, msg, {parse_mode:'Markdown'});
    }
  }catch(e){ console.log(e.message); }
}

app.get('/', (req,res) => res.send('Bot OTC Online - Frankfurt'));
app.listen(PORT, () => console.log('Rodando porta ' + PORT));

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '✅ Bot OTC Online! Digite EURUSD-OTC');
});

setInterval(checkSignal, 60000);
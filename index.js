const express = require('express');
const ccxt = require('ccxt');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 10000;
const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;
const bot = new TelegramBot(TOKEN, { polling: true });

const ex = new ccxt.binance({
  enableRateLimit: true,
  urls: { api: { public: 'https://data-api.binance.vision' } }
});

let autoM1 = false;

async function getRSI(tf){
  try{
    const c = await ex.fetchOHLCV('EUR/USDT', tf, undefined, 50);
    let g=0,l=0;
    for(let i=1;i<=14;i++){
      let d=c[c.length-i][4]-c[c.length-i-1][4];
      if(d>=0)g+=d;else l+=-d;
    }
    if(l===0)return 100;
    return 100-(100/(1+g/l));
  }catch(e){return 50;}
}

async function checkSignal(){
  try{
    const r1=await getRSI('1m');
    const r5=await getRSI('5m');
    const c = await ex.fetchOHLCV('EUR/USDT', '1m', undefined, 10);
    const closes = c.map(x=>x[4]);
    const media = closes.reduce((a,b)=>a+b,0)/closes.length;
    if(r1>55 || (r1>50 && closes[closes.length-1]>media)) return "COMPRA";
    if(r1<45 || (r1<50 && closes[closes.length-1]<media)) return "VENDA";
    return "NEUTRO";
  }catch(e){return "NEUTRO";}
}

function proximaVela(){
  const d = new Date(new Date().getTime() + 2*60000);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

async function loopM1(chatId){
  while(autoM1){
    const sinal = await checkSignal();
    const hora = proximaVela();
    if(sinal!=="NEUTRO"){
      const emoji = sinal==="COMPRA"?"🟢":"🔴";
      await bot.sendMessage(chatId, `${emoji} PRÓXIMA VELA M1 ${hora}\n${emoji} ${sinal} - EURUSD-OTC\n⏳ Entra em 2 minutos`);
      await new Promise(r=>setTimeout(r,60000));
      if(autoM1) await bot.sendMessage(chatId, `🔔 ENTRADA AGORA! ${hora}\n${emoji} ${sinal} EURUSD-OTC M1`);
    }
    await new Promise(r=>setTimeout(r,60000));
  }
}

bot.onText(/EURUSD-OTC/i, async (msg)=>{
  const chatId = msg.chat.id;
  if(msg.text.toUpperCase().includes("AUTO")){
    if(autoM1){autoM1=false; bot.sendMessage(chatId,"⏹️ AUTO M1 DESLIGADO");}
    else{autoM1=true; bot.sendMessage(chatId,"▶️ AUTO M1 LIGADO!\nMando sinal 2min antes, a cada 2min.\nManda de novo pra parar."); loopM1(chatId);}
  }else{
    const sinal = await checkSignal();
    const hora = proximaVela();
    const emoji = sinal==="COMPRA"?"🟢":"🔴";
    bot.sendMessage(chatId, `📊 SINAL M1 PARA ${hora}\n${emoji} ${sinal} - EURUSD-OTC\n⏰ Entra em 2 min!`);
  }
});

bot.onText(/\/start/, (m)=>{ bot.sendMessage(m.chat.id, "Bot Online ✅\nEURUSD-OTC = 1 sinal\nEURUSD-OTC AUTO = automatico M1"); });
app.get('/', (req,res)=>res.send('Bot Online ✅ M1 AUTO'));
app.listen(PORT, ()=>console.log('Online'));

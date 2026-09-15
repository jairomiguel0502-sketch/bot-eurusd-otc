const TelegramBot=require('node-telegram-bot-api');
const t=process.env.TELEGRAM_TOKEN;
const bot=new TelegramBot(t,{polling:true});
console.log("Bot iniciado!");
function sinal(id){
let d=new Date();d.setMinutes(d.getMinutes()+3);
let h=String(d.getHours()).padStart(2,'0');
let m=String(d.getMinutes()).padStart(2,'0');
let hr=h+":"+m;
let dir=Math.random()>0.5?"📈 COMPRA":"📉 VENDA";
let txt=`🔔 SINAL - EUR/USD OTC (M1)\n${dir} - ${hr}\n⏰ Entrada às ${hr}\n💰 Corretora: OTC`;
bot.sendMessage(id,txt);
}
bot.onText(/start/,(m)=>{bot.sendMessage(m.chat.id,"Bot Online ✅");});
bot.onText(/AUTO/,(m)=>{bot.sendMessage(m.chat.id,"✅ AUTO M1 ATIVADO!");setInterval(()=>sinal(m.chat.id),120000);});
bot.onText(/EURUSD/,(m)=>sinal(m.chat.id));

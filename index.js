const TelegramBot=require('node-telegram-bot-api');
const bot=new TelegramBot(process.env.TELEGRAM_TOKEN,{polling:true});
console.log("Bot ON Brasilia");
function getBrasilia(){return new Date(new Date().toLocaleString('en-US',{timeZone:'America/Sao_Paulo'}));}
function sinal(id){
let d=getBrasilia();d.setMinutes(d.getMinutes()+2);
let h=String(d.getHours()).padStart(2,'0');
let m=String(d.getMinutes()).padStart(2,'0');
let hr=h+":"+m;
let dir=Math.random()>0.5?"📈 COMPRA":"📉 VENDA";
let txt=`🔔 SINAL - EUR/USD OTC (M1)\n${dir} - ${hr}\n⏰ Entra em 2 min! - ${hr}\n💰 Corretora: OTC`;
bot.sendMessage(id,txt);
}
bot.onText(/\/start/,(m)=>{bot.sendMessage(m.chat.id,"Bot Online ✅ Horario Brasilia");});
bot.onText(/AUTO/,(m)=>{bot.sendMessage(m.chat.id,"✅ AUTO M1 ATIVADO!");setInterval(()=>sinal(m.chat.id),120000);});
bot.onText(/EURUSD-OTC/,(m)=>sinal(m.chat.id));

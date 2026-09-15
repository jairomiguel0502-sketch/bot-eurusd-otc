// Calcula horário da entrada (3 min na frente)
let agora = new Date();
agora.setMinutes(agora.getMinutes() + 3);
let hora = agora.getHours().toString().padStart(2, '0');
let minuto = agora.getMinutes().toString().padStart(2, '0');
let horarioEntrada = `${hora}:${minuto}`;

let direcao = Math.random() > 0.5 ? "📈 COMPRA" : "📉 VENDA";

let mensagem = `🔔 SINAL - EUR/USD OTC (M1)
${direcao} - ${horarioEntrada}
⏰ Entrada às ${horarioEntrada}
💰 Corretora: OTC

Gerado automaticamente M1`;

bot.sendMessage(chatId, mensagem);

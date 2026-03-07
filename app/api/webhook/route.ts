import { NextRequest, NextResponse } from 'next/server';

// 1. O método GET é usado pela Meta para verificar se o Webhook é autêntico
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verificado com sucesso pela Meta!');
    // A Meta exige que o retorno apenas o número do "challenge" em texto puro
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
}

// 2. O método POST recebe as mensagens reais dos pacientes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("CHEGOU ALGO NO WEBHOOK:", JSON.stringify(body, null, 2));

    if (body.object === 'whatsapp_business_account')

    // Verifica se é um evento do WhatsApp
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message) {
        const patientPhone = message.from; // Número de quem enviou
        const textContent = message.text?.body; // O que a pessoa digitou

        console.log(`Mensagem recebida de ${patientPhone}: ${textContent}`);

        //Preparando a resposta
        const phoneId = process.env.WHATSAPP_PHONE_ID;
        const token = process.env.WHATSAPP_TOKEN;
        
        //mensagem simples de eco para testar a comunicação
        const replyText = `Olá! Sou o assistente virtual em desenvolvimento. Você disse: "${textContent}". 🚀`;

        try {
          await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: patientPhone,
              type: 'text',
              text: { body: replyText },
            }),
          });
          console.log('Resposta enviada com sucesso!');
        } catch (error) {
          console.error('Erro ao enviar resposta:', error);
        }

        // AQUI ENTRARÁ A INTEGRAÇÃO COM A OPENAI (Fase 2)
        // Por enquanto, apenas registramos no console para testar.
      }

      // É obrigatório retornar status 200 rapidamente para a Meta não achar que seu bot caiu
      return NextResponse.json({ status: 'success' }, { status: 200 });
    }

    return NextResponse.json({ status: 'ignored' }, { status: 404 });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
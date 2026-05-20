const functions = require('@google-cloud/functions-framework');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

functions.http('bot_lumina', async (req, res) => {
    const twiml = new MessagingResponse();
    const smsDeUsuario = req.body.Body || '';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("[ERR_CONFIG] No se encontró la GEMINI_API_KEY.");
        twiml.message("Estamos optimizando el sistema. Volvé a intentar en unos minutos.");
        return res.status(200).type('text/xml').send(twiml.toString());
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Forzado de modelo base para bypass de restricción regional 404
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const promptSistema = `Sos un asistente virtual para Lumina Analitica. Respondé de forma cordial y ejecutiva. Mensaje del cliente: "${smsDeUsuario}"`;
        
        const result = await model.generateContent(promptSistema);
        const response = await result.response;
        const respuestaIA = response.text();

        twiml.message(respuestaIA);
        return res.status(200).type('text/xml').send(twiml.toString());

    } catch (error) {
        console.error("[ERR_IA] Error en la ejecución de Gemini:", error);
        twiml.message("Estamos optimizando el sistema. Volvé a intentar en unos minutos.");
        return res.status(200).type('text/xml').send(twiml.toString());
    }
});

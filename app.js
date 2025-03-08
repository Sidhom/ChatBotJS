import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import express from "express"

const app = express()
const port = 3000;

// Add Cors headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if(req.method === 'OPTIONS' ){
        res.sendStatus(200)
    }
    next()
})
app.use(express.static('.'));
app.use(express.json());

const pdfLoader = new PDFLoader("sport.pdf");
const secondPdfLoader = new PDFLoader("Amour.pdf")
const pdfDoc = await secondPdfLoader.load();

const llm =  new ChatGroq({
    model: "llama-3.2-3b-preview",
    temperature: 0.5,
    apiKey: process.env.GROQ_API_KEY
})
const prompt = ChatPromptTemplate.fromTemplate(`
        "Réponds à la question de l'utilisateur. Utilise le contexte pour répondre si besoin.
        Context: {context}
        Question: {input}

`)
const chain = await createStuffDocumentsChain({
    prompt,
    llm,
    documents:[...pdfDoc]

})


app.post('/chat', async(req, res) => {
    const userMessage = req.body.message;

    const response = await chain.invoke({
        input: userMessage,
         context: [...pdfDoc]
    })
    res.json({ response: response })
})
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
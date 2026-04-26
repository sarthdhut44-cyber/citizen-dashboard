export default async function handler(req, res) {
  const HF_TOKEN = process.env.VITE_HF_TOKEN;
  const { message, context } = req.body;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/v1/chat/completions",
      {
        headers: { 
          Authorization: `Bearer ${HF_TOKEN}`, 
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [
            { role: "system", content: "You are a helpful smart city assistant. Use the provided live dashboard data to answer the user's question." },
            { role: "user", content: `Context:\n${JSON.stringify(context, null, 2)}\n\nQuestion: ${message}` }
          ],
          max_tokens: 250,
        }),
      }
    );
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

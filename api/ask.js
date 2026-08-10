export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://arthurdavino.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body || {};
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing question' });
  }

  const context = `You are a short, friendly assistant answering questions about Arthur Davino's portfolio, for visitors of his site.
Facts about Arthur:
- Data Science student at FATEC Baixada Santista, Santos, Brazil, since February 2025.
- AI Intern at FlyRank AI.
- Built a Power BI non-conformity dashboard for CSI Filtros, a real client, with filters by origin and year, and cost analysis views. Delivered and approved as final project for Escola DNC's BI Analyst program.
- Built an n8n workflow that receives a message via webhook, classifies its urgency using the Anthropic API, logs it to Google Sheets, and sends an email alert for high urgency messages. Tested end to end with real messages.
- Certificates from Escola DNC (all issued June 2026): AI for Marketing, Intro to Data Analysis, Power BI (DAX), Power BI, Data Analysis with Excel, Intro to Python, Data Analysis with Python, Data Analysis with SQL, and BI Analyst.
- Certificates from Anthropic's AI Fluency track: AI Fluency Framework & Foundations, Claude 101, Introduction to Claude Cowork, AI Capabilities and Limitations, AI Fluency for Students, AI Fluency for Small Businesses, AI Fluency for Educators, Teaching AI Fluency, AI Fluency for Nonprofits, and AI Fluency for Builders.
- English certificate from CNA+, issued December 2025.
- Personal statement: "I research the data before I build, so what I ship actually works."
Answer only using these facts. Keep answers to 2 or 3 sentences. If asked something unrelated to Arthur's work, say you can only answer questions about his portfolio.`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: question },
        ],
        max_tokens: 200,
      }),
    });

    const data = await groqRes.json();
    const answer = data.choices?.[0]?.message?.content || 'Sorry, I could not generate an answer.';
    return res.status(200).json({ answer });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export default async function handler(req, res) {
    // 오직 POST 요청만 허용합니다.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Vercel 환경변수(Environment Variables)에서 API 키를 가져옵니다.
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다 (GEMINI_API_KEY 누락).' });
    }

    try {
        // 프론트엔드(index.html)에서 보낸 데이터를 그대로 받습니다.
        const { contents, systemInstruction } = req.body;

        // 구글 제미나이 서버로 요청을 보냅니다 (이 과정은 사용자에게 보이지 않는 서버 단에서 이루어집니다).
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, systemInstruction })
        });

        // 결과가 정상이 아니면 에러를 반환합니다.
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error:', errorText);
            return res.status(response.status).json({ error: '구글 AI 서버 요청 중 오류가 발생했습니다.' });
        }

        const data = await response.json();
        
        // 구글 서버로부터 받은 성공적인 직업 분석 결과를 프론트엔드로 다시 넘겨줍니다.
        return res.status(200).json(data);
    } catch (error) {
        console.error('Server Internal Error:', error);
        return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.', details: error.message });
    }
}

// api/generate.js — Vercel Serverless Function
// API Key tersimpan di Environment Variable Vercel, TIDAK pernah sampai ke browser.
//
// Setup:
//   1. Di Vercel Dashboard → Settings → Environment Variables
//   2. Tambahkan: GEMINI_API_KEY = (isi API key kamu)
//   3. Redeploy

const GEMINI_MODEL = 'gemini-2.0-flash';

export default async function handler(req, res) {
    // Hanya izinkan method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: 'API Key belum dikonfigurasi di environment variables Vercel.'
        });
    }

    const { topic, type, duration } = req.body;

    if (!topic || !type || !duration) {
        return res.status(400).json({ error: 'Parameter tidak lengkap.' });
    }

    const systemPrompt = `Anda adalah asisten ahli pembuat teks pidato/ceramah santri.
Teks harus mencakup:
1. Muqaddimah Bahasa Arab yang indah (tulis dengan harakat).
2. Isi yang menyentuh hati dan relevan dengan kehidupan santri.
3. Minimal 1 Ayat Al-Qur'an atau Hadis beserta artinya.
4. Gunakan poin-poin hikmah agar mudah dihafal.
5. Tambahkan [Petunjuk Ekspresi] di dalam kurung siku.`;

    const userQuery = `Buatkan naskah ${type} bertema "${topic}" berdurasi ${duration}.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || 'Gagal memanggil Gemini API'
            });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({ error: 'Respons AI kosong.' });
        }

        return res.status(200).json({ result: text });

    } catch (err) {
        console.error('Proxy error:', err);
        return res.status(500).json({ error: 'Server error: ' + err.message });
    }
}

export const config = {
  api: {
    bodyParser: false
  }
};

const OWNER = "ReyZ4YouXGod";
const REPO = "Tourl";
const BRANCH = "main";

export default async function handler(req, res) {
  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST only" });
    }

    const TOKEN = process.env.GITHUB_TOKEN;

    if (!TOKEN) {
      return res.status(500).json({
        error: "Missing GITHUB_TOKEN in Vercel env"
      });
    }

    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    if (!buffer.length) {
      return res.status(400).json({ error: "Empty file" });
    }

    const filename = "file-" + Date.now();
    const base64 = buffer.toString("base64");

    const githubUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/assets/${filename}`;

    const githubRes = await fetch(githubUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "vercel-api"
      },
      body: JSON.stringify({
        message: "upload",
        content: base64,
        branch: BRANCH
      })
    });

    const data = await githubRes.json();

    if (!githubRes.ok) {
      return res.status(500).json({
        error: "GitHub failed",
        detail: data
      });
    }

    const raw = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/assets/${filename}`;

    return res.status(200).json({
      status: true,
      raw
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server crash",
      message: err.message
    });
  }
}

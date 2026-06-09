import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false
  }
};

// CONFIG GITHUB
const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "ReyZ4YouXGod";
const REPO = "Upload";
const BRANCH = "main";

export default async function handler(req, res) {

  // CORS (biar bisa dipakai dari mana saja)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      message: "Use POST method"
    });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    if (!buffer.length) {
      return res.status(400).json({
        status: false,
        message: "No file uploaded"
      });
    }

    const filename = "file-" + Date.now();
    const base64 = buffer.toString("base64");

    const githubAPI = `https://api.github.com/repos/${OWNER}/${REPO}/contents/assets/${filename}`;

    const githubRes = await fetch(githubAPI, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "vercel-upload-api"
      },
      body: JSON.stringify({
        message: "upload via api",
        content: base64,
        branch: BRANCH
      })
    });

    const githubData = await githubRes.json();

    if (!githubRes.ok) {
      return res.status(500).json({
        status: false,
        message: "GitHub upload failed",
        detail: githubData
      });
    }

    const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/assets/${filename}`;

    return res.status(200).json({
      status: true,
      filename,
      raw: rawUrl,
      github: githubData.content?.html_url
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: err.message
    });
  }
}

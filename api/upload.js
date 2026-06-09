import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false
  }
};

// CONFIG GITHUB
const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "ReyZ4YouXGod";
const REPO = "assest";
const BRANCH = "main";

export default async function handler(req, res) {
  // CORS biar bisa dipakai website lain
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ status: false, message: "method not allowed" });
  }

  try {
    const chunks = [];

    req.on("data", chunk => chunks.push(chunk));

    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);

      if (!buffer.length) {
        return res.status(400).json({ status: false, message: "no file" });
      }

      const filename = "file-" + Date.now();
      const base64 = buffer.toString("base64");

      const githubApi = `https://api.github.com/repos/${OWNER}/${REPO}/contents/assets/${filename}`;

      const upload = await fetch(githubApi, {
        method: "PUT",
        headers: {
          Authorization: `token ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "upload file via api",
          content: base64,
          branch: BRANCH
        })
      });

      const result = await upload.json();

      const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/assets/${filename}`;

      res.json({
        status: true,
        filename,
        raw: rawUrl,
        github: result.content?.html_url || null
      });
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      message: "server error",
      error: err.message
    });
  }
}

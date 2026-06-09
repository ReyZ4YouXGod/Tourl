import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false
  }
};

// CONFIG GITHUB
const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "ReyZ4YouXGod";
const REPO = "data";
const BRANCH = "main";

export default async function handler(req, res) {

  // biar bisa dipakai dari web lain
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    if(req.method !== "POST"){
      return res.status(405).json({ error:"only POST" });
    }

    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    if(!buffer.length){
      return res.status(400).json({ error:"no file" });
    }

    const filename = "file-" + Date.now();
    const base64 = buffer.toString("base64");

    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/assets/${filename}`;

    const github = await fetch(url, {
      method:"PUT",
      headers:{
        Authorization:`Bearer ${TOKEN}`,
        "Content-Type":"application/json",
        "User-Agent":"vercel-api"
      },
      body: JSON.stringify({
        message:"upload file",
        content: base64,
        branch: BRANCH
      })
    });

    const data = await github.json();

    if(!github.ok){
      return res.status(500).json({
        error:"github error",
        detail:data
      });
    }

    const raw = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/assets/${filename}`;

    res.json({
      raw,
      github: data.content?.html_url
    });

  } catch(err){
    res.status(500).json({
      error:"server error",
      message:err.message
    });
  }
}

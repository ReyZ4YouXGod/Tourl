import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  try {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        status: false,
        message: "POST only"
      });
    }

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

    const blob = await put(filename, buffer, {
      access: "public"
    });

    return res.status(200).json({
      status: true,
      raw: blob.url
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message
    });
  }
}

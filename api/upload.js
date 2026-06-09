import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  try {
    // CORS
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

    // ambil buffer
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

    // detect content type
    const contentType = req.headers["content-type"] || "";

    let ext = "bin";
    if (contentType.includes("image/jpeg")) ext = "jpg";
    else if (contentType.includes("image/png")) ext = "png";
    else if (contentType.includes("image/webp")) ext = "webp";
    else if (contentType.includes("video/mp4")) ext = "mp4";
    else if (contentType.includes("audio/mpeg")) ext = "mp3";
    else if (contentType.includes("application/pdf")) ext = "pdf";

    // filename pakai extension biar rapi
    const filename = `file-${Date.now()}.${ext}`;

    // upload ke vercel blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType
    });

    return res.status(200).json({
      status: true,
      raw: blob.url
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message || "server error"
    });
  }
}

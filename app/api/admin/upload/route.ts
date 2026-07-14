import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";

// sharp are nevoie de runtime Node.js (nu Edge).
export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB brut la intrare (înainte de optimizare)

// Coperțile/galeria nu au nevoie de rezoluții enorme — le încadrăm într-un
// dreptunghi generos pentru retina și le convertim în WebP. Asta reduce de
// obicei un JPEG de 2-4MB la ~100-250KB, deci sute de produse ocupă spațiu minim.
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1600;
const WEBP_QUALITY = 80;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Niciun fișier trimis." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Format neacceptat. Folosește JPG, PNG sau WEBP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Fișierul e prea mare (maximum 10MB)." },
      { status: 400 }
    );
  }

  let optimized: Buffer;
  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    optimized = await sharp(inputBuffer)
      .rotate() // aplică orientarea EXIF, apoi curăță metadatele
      .resize(MAX_WIDTH, MAX_HEIGHT, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch (error) {
    console.error("[admin upload] optimizarea imaginii a eșuat:", error);
    return NextResponse.json(
      { error: "Imaginea nu a putut fi procesată. Încearcă alt fișier." },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`carti/${crypto.randomUUID()}.webp`, optimized, {
      access: "public",
      contentType: "image/webp",
    });
    const savedPct = Math.round((1 - optimized.length / file.size) * 100);
    console.info(
      `[admin upload] ${(file.size / 1024).toFixed(0)}KB → ${(optimized.length / 1024).toFixed(0)}KB WebP (-${savedPct}%)`
    );
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[admin upload] eroare Vercel Blob:", error);
    return NextResponse.json(
      { error: "Încărcarea a eșuat. Verifică BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }
}

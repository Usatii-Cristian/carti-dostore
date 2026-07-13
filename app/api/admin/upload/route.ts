import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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
      { error: "Fișierul e prea mare (maximum 5MB)." },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`carti/${crypto.randomUUID()}-${file.name}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[admin upload] eroare Vercel Blob:", error);
    return NextResponse.json(
      { error: "Încărcarea a eșuat. Verifică BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }
}

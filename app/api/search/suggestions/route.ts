import { NextRequest, NextResponse } from "next/server";
import { searchBooks } from "@/lib/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const { books } = await searchBooks(q, 5);

  const results = books.map((book) => ({
    slug: book.slug,
    title: book.title,
    author: book.author,
    coverImage: book.coverImage,
    price: book.price,
    discountPrice: book.discountPrice,
  }));

  return NextResponse.json({ results });
}

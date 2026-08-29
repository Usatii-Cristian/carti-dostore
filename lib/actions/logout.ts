"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

export async function logoutAction() {
  // `redirect: false` + redirect propriu, din același motiv ca la login
  // (lib/actions/login.ts): cu `redirectTo`, NextAuth construiește o adresă
  // absolută din URL-ul lui de bază (domeniul Vercel), nu din domeniul pe care
  // se află vizitatorul — deci deconectarea de pe dostore.md te arunca pe
  // dostore-carti.vercel.app. Calea relativă rămâne pe domeniul curent.
  await signOut({ redirect: false });
  redirect("/admin/login");
}

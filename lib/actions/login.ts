"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    // `redirect: false` — NU lăsăm NextAuth să facă redirectul.
    //
    // Cu `redirectTo`, NextAuth construiește o adresă ABSOLUTĂ pornind de la
    // URL-ul lui de bază (AUTH_URL / domeniul Vercel), nu de la domeniul pe
    // care se află vizitatorul. Pe dostore.md asta însemna: parola se verifica
    // bine, cookie-ul de sesiune se punea pe www.dostore.md — și apoi erai
    // trimis pe dostore-carti.vercel.app, unde acel cookie nu există. Rezultat:
    // te întorceai la pagina de login ca și cum ai fi greșit parola.
    //
    // Redirectul îl facem noi, cu o cale RELATIVĂ, deci rămâne pe domeniul
    // curent — merge la fel pe dostore.md, pe www, pe *.vercel.app și local.
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email sau parolă incorectă." };
    }
    throw error;
  }

  // În afara blocului try: `redirect()` semnalează prin excepție, iar prinsă
  // acolo ar fi confundată cu o eroare de autentificare.
  redirect("/admin");
}

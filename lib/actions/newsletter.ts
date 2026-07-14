"use server";

import { prisma } from "@/lib/prisma";
import { sendNewsletterWelcomeEmail } from "@/lib/email/notifications";

export type NewsletterState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    return { status: "error", message: "Introdu o adresă de email validă." };
  }

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    if (!existing) {
      await prisma.newsletterSubscriber.create({ data: { email } });
      // Emailul de bun-venit merge o singură dată, doar la abonarea nouă.
      await sendNewsletterWelcomeEmail(email);
    }

    return {
      status: "success",
      message: "Te-ai abonat cu succes! Verifică-ți emailul pentru confirmare.",
    };
  } catch {
    return {
      status: "error",
      message: "A apărut o eroare. Te rugăm încearcă din nou.",
    };
  }
}

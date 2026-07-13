import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/logout";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
        Deconectare
      </button>
    </form>
  );
}

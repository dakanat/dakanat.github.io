import type { Dictionary } from "@/i18n/dictionaries";

export default function Footer({ t }: { t: Dictionary }) {
  return (
    <footer className="text-center pt-2 pb-2">
      <p className="mt-2 text-slate-500 text-[13px] tracking-wider uppercase font-mono">
        {t.footer.copyright}
      </p>
    </footer>
  );
}

import type { Dictionary } from "@/i18n/dictionaries";

export default function Footer({ t }: { t: Dictionary }) {
  return (
    <footer className="mt-4 text-center pt-4 pb-4">
      <p className="mt-4 text-slate-500 text-[14px] tracking-wider uppercase font-mono">
        {t.footer.copyright}
      </p>
    </footer>
  );
}

import type { Profile } from "@/data/cv";
import { CodeXml, Mail, GraduationCap, ExternalLink } from "lucide-react";
import { GitHubIcon } from "@/components/icons/GitHubIcon";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Dictionary } from "@/i18n/dictionaries";

function getLinkIcon(label: string) {
  switch (label) {
    case "GitHub":
      return GitHubIcon;
    case "Google Scholar":
      return GraduationCap;
    case "AtCoder":
      return CodeXml;
    default:
      return ExternalLink;
  }
}

export default function Header({ t, locale, profile }: { t: Dictionary; locale: string; profile: Profile }) {
  return (
    <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center bg-bg-dark/80 backdrop-blur-sm border border-slate-700 p-4 rounded-sm mb-6 animate-border-pulse">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-widest">
          {profile.name}
        </h1>
        <p className="text-primary font-bold tracking-wider text-sm md:text-base">
          &gt; {t.labels.class}: {profile.title.toUpperCase()}
        </p>
      </div>
      <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-1">
        <div className="flex items-center gap-3">
          <p className="text-slate-400 font-mono text-sm flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-primary" />
            {profile.email}
          </p>
          <LanguageSwitcher locale={locale} />
        </div>
        <div className="flex gap-4">
          {profile.links.map((link) => {
            const Icon = getLinkIcon(link.label);
            return (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-white text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
              >
                <Icon className="w-3.5 h-3.5" />[{link.label}]
              </a>
            );
          })}
        </div>
      </div>
    </header>
  );
}

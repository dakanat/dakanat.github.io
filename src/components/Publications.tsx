import type { Publication } from "@/data/cv";
import Section from "./Section";
import { BookOpen } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

const RichMyName = ({
  authors,
  myname,
}: {
  authors: string;
  myname: string;
}) => {
  const parts = authors.split(myname);
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <u>
              <strong>{myname}</strong>
            </u>
          )}
        </span>
      ))}
    </>
  );
};

export default function Publications({ t, publications, domesticConferences }: { t: Dictionary; publications: Publication[]; domesticConferences: string }) {
  return (
    <Section title={t.sections.publications} icon={BookOpen}>
      <h3 className="font-medium text-white mb-2">{t.publications.international}</h3>
      <ul className="space-y-3 mb-6">
        {publications.map((pub) => (
          <li key={pub.title}>
            <p className="text-slate-300">
              {RichMyName({ authors: pub.authors, myname: pub.myname })}
            </p>
            <p className="font-semibold text-white">{pub.title}</p>
            <p className="text-slate-400 italic">
              {pub.venue}, {pub.year}.
            </p>
            <div className="flex gap-3 mt-1">
              {pub.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-white transition-colors"
                >
                  [{link.label}]
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <h3 className="font-medium text-white mb-2">{t.publications.domestic}</h3>
      <p className="text-slate-300">{domesticConferences}</p>
    </Section>
  );
}

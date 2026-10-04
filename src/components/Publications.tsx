import type { Publication } from "@/data/cv";
import { SEMANTIC_SCHOLAR_AUTHOR_URL, citationsFor } from "@/data/scholar";
import Section, { Row } from "./Section";
import type { Dictionary } from "@/i18n/dictionaries";

const RichMyName = ({ authors, myname }: { authors: string; myname: string }) => {
  const parts = authors.split(myname);
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && <strong className="font-semibold text-strong">{myname}</strong>}
        </span>
      ))}
    </>
  );
};

export default function Publications({ t, publications, domesticConferences }: { t: Dictionary; publications: Publication[]; domesticConferences: string }) {
  return (
    <Section title={t.sections.publications}>
      <h3 className="-mb-3 text-sm text-muted">{t.publications.international}</h3>
      {publications.map((pub) => {
        const citations = citationsFor(pub.title);
        return (
          <Row key={pub.title} when={pub.year}>
            <p className="text-sm">
              <RichMyName authors={pub.authors} myname={pub.myname} />
            </p>
            <h4 className="font-semibold text-strong">{pub.title}</h4>
            <p className="text-muted text-sm italic">
              {pub.venue}, {pub.year}.
            </p>
            <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
              {pub.links.map((link) => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ))}
              {citations !== undefined && (
                <a
                  href={SEMANTIC_SCHOLAR_AUTHOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[13px] text-muted"
                >
                  {t.publications.citations.replace("{n}", String(citations))}
                </a>
              )}
            </p>
          </Row>
        );
      })}
      <h3 className="-mb-3 text-sm text-muted">{t.publications.domestic}</h3>
      <Row when="">
        <p>{domesticConferences}</p>
      </Row>
    </Section>
  );
}

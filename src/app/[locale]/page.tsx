import Header from "@/components/Header";
import Education from "@/components/Education";
import WorkExperience from "@/components/WorkExperience";
import Publications from "@/components/Publications";
import Awards from "@/components/Awards";
import InvitedTalks from "@/components/InvitedTalks";
import Funding from "@/components/Funding";
import Skills from "@/components/Skills";
import Footer from "@/components/Footer";
import Playground from "@/components/Playground";
import { getDictionary, locales } from "@/i18n/dictionaries";
import { getCvData } from "@/data/cv";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, cv] = await Promise.all([getDictionary(locale), getCvData(locale)]);

  return (
    <div id="cv" className="relative min-h-screen">
      <main className="relative z-10 mx-auto flex max-w-[46rem] flex-col gap-12 px-5 pt-14 pb-28">
        <Header t={t} locale={locale} profile={cv.profile} />
        <WorkExperience t={t} workExperience={cv.workExperience} />
        <Publications t={t} publications={cv.publications} domesticConferences={cv.domesticConferences} />
        <Education t={t} education={cv.education} />
        <Awards t={t} awards={cv.awards} />
        <InvitedTalks t={t} invitedTalks={cv.invitedTalks} />
        <Funding t={t} funding={cv.funding} />
        <Skills t={t} skills={cv.skills} />
        <Footer t={t} locale={locale} />
      </main>
      <Playground labels={t.play} />
    </div>
  );
}

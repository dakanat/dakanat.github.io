import Header from "@/components/Header";
import Education from "@/components/Education";
import WorkExperience from "@/components/WorkExperience";
import Publications from "@/components/Publications";
import Awards from "@/components/Awards";
import InvitedTalks from "@/components/InvitedTalks";
import Funding from "@/components/Funding";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import AnimatedSection from "@/components/AnimatedSection";
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
    <>
      {/* Background Grid */}
      <div
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #25aff4 1px, transparent 1px), linear-gradient(to bottom, #25aff4 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        <AnimatedSection>
          <Header t={t} locale={locale} profile={cv.profile} />
        </AnimatedSection>
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 space-y-6">
            <AnimatedSection delay={100}>
              <Education t={t} education={cv.education} />
            </AnimatedSection>
            <AnimatedSection delay={150}>
              <WorkExperience t={t} workExperience={cv.workExperience} />
            </AnimatedSection>
            <AnimatedSection delay={250}>
              <Publications
                t={t}
                publications={cv.publications}
                domesticConferences={cv.domesticConferences}
              />
            </AnimatedSection>
            <AnimatedSection delay={300}>
              <Awards t={t} awards={cv.awards} />
            </AnimatedSection>
            <AnimatedSection delay={350}>
              <InvitedTalks t={t} invitedTalks={cv.invitedTalks} />
            </AnimatedSection>
            <AnimatedSection delay={450}>
              <Funding t={t} funding={cv.funding} />
            </AnimatedSection>
          </main>
          <Sidebar
            t={t}
            locale={locale}
            profile={cv.profile}
            skills={cv.skills}
          />
        </div>
        <AnimatedSection delay={500}>
          <Footer t={t} />
        </AnimatedSection>
      </div>
    </>
  );
}

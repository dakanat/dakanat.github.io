"use client";

import { useEffect, useRef, useState } from "react";
import type { SkillEntry } from "@/data/cv";

function Bar({ skill, animate }: { skill: SkillEntry; animate: boolean }) {
  return (
    <div key={skill.label} className="group">
      <div className="flex items-center justify-between text-[11px] mb-0.5">
        <span className="text-slate-400 truncate mr-2">{skill.label}</span>
        <span className="text-slate-300 font-mono shrink-0">{skill.value}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary/70 rounded-full transition-[width] duration-700 ease-out"
          style={{ width: animate ? `${skill.value}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export default function SkillBars({
  skills,
  labels,
}: {
  skills: SkillEntry[];
  labels: { languages: string; knowledge: string };
}) {
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
        } else if (entry.intersectionRatio === 0) {
          setAnimate(false);
        }
      },
      { threshold: [0, 0.2] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const languages = skills.filter((s) => s.category === "language");
  const knowledge = skills.filter((s) => s.category === "knowledge");

  return (
    <div ref={ref} className="space-y-4">
      {languages.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            {labels.languages}
          </div>
          <div className="space-y-1.5">
            {languages.map((skill) => (
              <Bar key={skill.label} skill={skill} animate={animate} />
            ))}
          </div>
        </div>
      )}
      {knowledge.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            {labels.knowledge}
          </div>
          <div className="space-y-1.5">
            {knowledge.map((skill) => (
              <Bar key={skill.label} skill={skill} animate={animate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import type { CvData } from "./cv";

const data: CvData = {
  profile: {
    name: "Daiki Tanaka",
    title: "Freelance Engineer",
    email: "dakanat4201 (at) gmail.com",
    links: [
      { label: "GitHub", url: "https://github.com/dakanat" },
      { label: "AtCoder", url: "https://atcoder.jp/users/akanat" },
      {
        label: "Google Scholar",
        url: "https://scholar.google.co.jp/citations?user=Bo7YxGAAAAAJ&hl=ja&oi=ao",
      },
    ],
    researchInterests: "Computer Vision, Machine Learning.",
  },

  education: [
    {
      degree: "M.S.",
      period: "Apr. 2018 – Mar. 2021",
      department: "Department of Information and Communication Engineering",
      school:
        "Graduate School of Information Science and Technology, The University of Tokyo",
      advisors: [
        {
          name: "Prof. Kiyoharu Aizawa",
          url: "https://sites.google.com/view/aizawa-kiyoharu",
        },
      ],
    },
    {
      degree: "B.E.",
      period: "Apr. 2017 – Mar. 2018",
      department: "Department of Information and Communication Engineering",
      school: "The University of Tokyo",
      advisors: [
        {
          name: "Prof. Kiyoharu Aizawa",
          url: "https://sites.google.com/view/aizawa-kiyoharu",
        },
        {
          name: "Prof. Toshihiko Yamasaki",
          url: "https://www.cvm.t.u-tokyo.ac.jp/en/people/index.html",
        },
      ],
    },
  ],

  workExperience: [
    {
      role: "AI R&D Engineer",
      period: "Apr. 2024 – Feb. 2025",
      organization: "R&D / CASTALK Co., Ltd.",
      responsibilities: [
        "Architected the backend for a real-time voice chat mobile app featuring live-action video",
        "Implemented RAG applications leveraging Large Language Models (LLMs)",
        "Led the development of Japanese speech synthesis models",
      ],
    },
    {
      role: "Programmer",
      period: "Apr. 2021 – Oct. 2022",
      organization: "ML team / AI section / R&D / GAME FREAK inc.",
      responsibilities: [
        "Developed and debugged physics and communication engines",
        "Spearheaded NLP initiatives using Transformers and engineered a custom reinforcement learning framework",
        "Orchestrated technical study sessions on ML topics, including generative AI, NLP, and reinforcement learning",
      ],
    },
    {
      role: "Research Intern",
      period: "Aug. 2018 – Sep. 2018",
      organization: "CV team / Preferred Networks, Inc.",
      responsibilities: [
        "Conducted research on object detection, with a specific focus on addressing class imbalance issues",
      ],
    },
  ],

  publications: [
    {
      myname: "Daiki Tanaka",
      authors:
        "Daiki Tanaka, Daiki Ikami, Toshihiko Yamasaki, and Kiyoharu Aizawa",
      title: "Joint Optimization Framework for Learning with Noisy Labels",
      venue:
        "The IEEE / CVF Conference on Computer Vision and Pattern Recognition (CVPR)",
      year: 2018,
      links: [
        { label: "arXiv", url: "https://arxiv.org/abs/1803.11364" },
        {
          label: "pdf",
          url: "https://openaccess.thecvf.com/content_cvpr_2018/papers/Tanaka_Joint_Optimization_Framework_CVPR_2018_paper.pdf",
        },
        {
          label: "code",
          url: "https://github.com/DaikiTanaka-UT/JointOptimization",
        },
      ],
    },
  ],

  domesticConferences: "4 papers",

  awards: [
    {
      title: "The Best Master Thesis Award",
      organization:
        "Department of Information and Communication Engineering, Graduate School of Information Science and Technology, The University of Tokyo",
      year: "2021",
    },
    {
      title: "IEICE Academic Encouragement Award",
      organization:
        "The Institute of Electronics, Information and Communication Engineers General Conference",
      year: "2018",
    },
  ],

  invitedTalks: [
    {
      title: "Joint Optimization Framework for Learning with Noisy Labels",
      venue: "Meeting on Image Recognition and Understanding",
      location: "Sapporo, Japan",
      date: "Aug. 2018",
    },
  ],

  funding: [
    {
      title:
        "Toyota/Dwango Scholarship for Advanced Artificial Intelligence Researcher",
      period: "Apr. 2018 – Mar. 2019",
      monthlyAmount: "100,000 JPY/month",
    },
  ],
  skills: [
    { label: "Python", value: 90, category: "language" },
    { label: "PyTorch", value: 85, category: "language" },
    { label: "C++", value: 65, category: "language" },
    { label: "TypeScript", value: 60, category: "language" },
    { label: "Machine Learning", value: 90, category: "knowledge" },
    { label: "Computer Vision", value: 85, category: "knowledge" },
    { label: "NLP", value: 75, category: "knowledge" },
    { label: "Backend", value: 70, category: "knowledge" },
    { label: "Speech / Audio", value: 60, category: "knowledge" },
  ],
};

export default data;

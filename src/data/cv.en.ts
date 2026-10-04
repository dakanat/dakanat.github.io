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
      role: "AI Engineer (Contract)",
      period: "Apr. 2026 – Present",
      organization: "Sapeet Co., Ltd.",
      responsibilities: [
        "Developing a multimodal search system that spans video, audio, images, and text",
        "Developing a tool that helps draft contracts",
        "Developing an automated proofreading application",
      ],
    },
    {
      role: "AI R&D Engineer",
      period: "Apr. 2024 – Feb. 2025",
      organization: "R&D / CASTALK Co., Ltd.",
      responsibilities: [
        "Built the backend of a real-time voice chat mobile app with live-action video",
        "Implemented retrieval-augmented generation (RAG) applications using large language models",
        "Led the design and training of deep-learning models for Japanese speech synthesis",
      ],
    },
    {
      role: "Programmer",
      period: "Apr. 2021 – Oct. 2022",
      organization: "ML team / AI section / R&D / GAME FREAK inc.",
      responsibilities: [
        "Developed and debugged the physics and networking engines",
        "Led a Transformer-based NLP project and designed an in-house reinforcement learning framework",
        "Organized internal study sessions on machine learning, including image generation, NLP, and reinforcement learning",
      ],
    },
    {
      role: "Research Intern",
      period: "Aug. 2018 – Sep. 2018",
      organization: "CV team / Preferred Networks, Inc.",
      responsibilities: [
        "Researched the class imbalance problem in object detection",
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
      title: "Best Master's Thesis Award",
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
      venue: "Meeting on Image Recognition and Understanding (MIRU)",
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
    { label: "Python", category: "language" },
    { label: "PyTorch", category: "language" },
    { label: "C++", category: "language" },
    { label: "TypeScript", category: "language" },
    { label: "Machine Learning", category: "knowledge" },
    { label: "Computer Vision", category: "knowledge" },
    { label: "NLP", category: "knowledge" },
    { label: "AWS", category: "infra" },
    { label: "GCP", category: "infra" },
    { label: "Azure", category: "infra" },
    { label: "Docker", category: "infra" },
    { label: "Terraform", category: "infra" },
  ],
};

export default data;

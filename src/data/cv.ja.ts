import type { CvData } from "./cv";

const data: CvData = {
  profile: {
    name: "田中 大揮",
    title: "フリーランスエンジニア",
    email: "dakanat4201 (at) gmail.com",
    links: [
      { label: "GitHub", url: "https://github.com/dakanat" },
      {
        label: "Google Scholar",
        url: "https://scholar.google.co.jp/citations?user=Bo7YxGAAAAAJ&hl=ja&oi=ao",
      },
      { label: "AtCoder", url: "https://atcoder.jp/users/akanat" },
    ],
    researchInterests: "Computer Vision, Machine Learning.",
  },

  education: [
    {
      degree: "修士",
      period: "2018年4月 – 2021年3月",
      department: "情報理工学系研究科・電子情報学専攻",
      school: "東京大学大学院",
      advisors: [
        {
          name: "相澤 清晴",
          url: "https://sites.google.com/view/aizawa-kiyoharu",
        },
      ],
    },
    {
      degree: "学士",
      period: "2017年4月 – 2018年3月",
      department: "工学部・電子情報工学科",
      school: "東京大学",
      advisors: [
        {
          name: "相澤 清晴",
          url: "https://sites.google.com/view/aizawa-kiyoharu",
        },
        {
          name: "山崎 俊彦",
          url: "https://www.cvm.t.u-tokyo.ac.jp/en/people/index.html",
        },
      ],
    },
  ],

  workExperience: [
    {
      role: "AI R&D Engineer",
      period: "2024年4月 – 2025年2月",
      organization: "R&D / 株式会社CASTALK",
      responsibilities: [
        "実写映像を伴うリアルタイム音声チャットアプリのバックエンド構築",
        "大規模言語モデルを活用したRAGアプリケーションの実装",
        "深層学習を用いた日本語音声合成モデルの設計および学習プロセスの主導",
      ],
    },
    {
      role: "Programmer",
      period: "2021年4月 – 2022年10月",
      organization: "ML team / AI section / R&D / 株式会社ゲームフリーク",
      responsibilities: [
        "物理演算エンジンおよび通信エンジンの開発・デバッグ",
        "Transformerを用いた自然言語処理プロジェクトの主導、および独自の強化学習フレームワークの設計",
        "機械学習（画像生成、自然言語処理、強化学習等）に関する社内勉強会を企画・運営",
      ],
    },
    {
      role: "Research Intern",
      period: "2018年8月 – 2018年9月",
      organization: "CV team / 株式会社Preferred Networks",
      responsibilities: ["物体検出におけるクラス不均衡問題の研究"],
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

  domesticConferences: "4 件",

  awards: [
    {
      title: "専攻長賞",
      organization: "東京大学大学院情報理工学系研究科電子情報学専攻",
      year: "2021年",
    },
    {
      title: "学術奨励賞",
      organization: "電子情報通信学会 総合大会",
      year: "2018年",
    },
  ],

  invitedTalks: [
    {
      title: "Joint Optimization Framework for Learning with Noisy Labels",
      venue: "第21回 画像の認識・理解シンポジウム（MIRU）",
      location: "札幌",
      date: "2018年8月",
    },
  ],

  funding: [
    {
      title: "トヨタ・ドワンゴ高度人工知能人材奨学金",
      period: "2018年4月 – 2019年3月",
      monthlyAmount: "月額 100,000 円",
    },
  ],
  skills: [
    { label: "Python", value: 90, category: "language" },
    { label: "PyTorch", value: 85, category: "language" },
    { label: "C++", value: 65, category: "language" },
    { label: "TypeScript", value: 60, category: "language" },
    { label: "機械学習", value: 90, category: "knowledge" },
    { label: "コンピュータビジョン", value: 85, category: "knowledge" },
    { label: "自然言語処理", value: 75, category: "knowledge" },
    { label: "バックエンド", value: 70, category: "knowledge" },
    { label: "音声 / 音響", value: 60, category: "knowledge" },
  ],
};

export default data;


const currentUrl = window.location.href;
const siteUrl = "https://nishijima-suguru.github.io"; 
let updatedUrl = currentUrl.replace("https://nishijima-suguru.github.io", "");
if (currentUrl.length == updatedUrl.length && currentUrl.startsWith("http://127.0.0.1")) {
  const otherSiteUrl = siteUrl.replace("localhost", "127.0.0.1");
  updatedUrl = currentUrl.replace(otherSiteUrl + "", "");
}
if ("jp".length > 0) {
  updatedUrl = updatedUrl.replace("/jp", "");
}
// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-ホーム",
    title: "ホーム",
    section: "Navigation menu",
    handler: () => {
      window.location.href = "/jp/";
    },
  },{id: "nav-論文一覧",
          title: "論文一覧",
          description: "",
          section: "Navigation menu",
          handler: () => {
            window.location.href = "/jp/publications/";
          },
        },{id: "nav-お知らせ",
          title: "お知らせ",
          description: "",
          section: "Navigation menu",
          handler: () => {
            window.location.href = "/jp/news/";
          },
        },{id: "nav-略歴",
          title: "略歴",
          description: "",
          section: "Navigation menu",
          handler: () => {
            window.location.href = "/jp/cv/";
          },
        },{id: "news-galaxy-microbliverプロジェクトで行った糞便負荷量の予測モデルの研究成果がcellに発表されました-https-www-sciencedirect-com-science-article-pii-s0092867424012042",
          title: 'GALAXY/MicrobLiverプロジェクトで行った糞便負荷量の予測モデルの研究成果がCellに発表されました。    https://www.sciencedirect.com/science/article/pii/S0092867424012042',
          description: "",
          section: "News",},{id: "news-筑波大学の秋山先生-東京医科大学の永田先生とのibdのマルチバイオーム解析研究がnature-communicationsに発表されました-https-www-nature-com-articles-s41467-024-54797-8",
          title: '筑波大学の秋山先生、東京医科大学の永田先生とのIBDのマルチバイオーム解析研究がNature Communicationsに発表されました。    https://www.nature.com/articles/s41467-024-54797-8',
          description: "",
          section: "News",},{id: "news-東京大学大学院-新領域創成科学研究科-生命データサイエンスセンターに特任准教授として着任しました",
          title: '東京大学大学院 新領域創成科学研究科 生命データサイエンスセンターに特任准教授として着任しました。',
          description: "",
          section: "News",},{id: "news-地球規模のウイルスデータベース-vire-に関する論文がnucleic-acids-researchに掲載されました-https-academic-oup-com-nar-advance-article-doi-10-1093-nar-gkaf1225-8356007",
          title: '地球規模のウイルスデータベース「VIRE」に関する論文がNucleic Acids Researchに掲載されました。      https://academic.oup.com/nar/advance-article/doi/10.1093/nar/gkaf1225/8356007',
          description: "",
          section: "News",},{id: "news-我々の日本人の腸内マイクロバイオームの特徴に焦点を当てたレビュー論文が日本学士院紀要から公開されました-https-www-jstage-jst-go-jp-article-pjab-102-2-102-pjab-102-006-article",
          title: '我々の日本人の腸内マイクロバイオームの特徴に焦点を当てたレビュー論文が日本学士院紀要から公開されました。      https://www.jstage.jst.go.jp/article/pjab/102/2/102_pjab.102.006/_article',
          description: "",
          section: "News",},{
        id: 'social-email',
        title: 'Send an email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6E%69%73%68%69%6A%69%6D%61.%73%75%67%75%72%75@%67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0002-8444-9272", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=HYB-2zQAAAAJ", "_blank");
        },
      },{
        id: 'social-x',
        title: 'X',
        section: 'Socials',
        handler: () => {
          window.open("https://twitter.com/NishijimaSuguru", "_blank");
        },
      },{
          id: 'lang-en-us',
          title: 'en-us',
          section: 'Languages',
          handler: () => {
            window.location.href = "" + updatedUrl;
          },
        },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];

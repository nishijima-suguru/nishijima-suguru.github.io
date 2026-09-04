
const currentUrl = window.location.href;
const siteUrl = "https://nishijima-suguru.github.io"; 
let updatedUrl = currentUrl.replace("https://nishijima-suguru.github.io", "");
if (currentUrl.length == updatedUrl.length && currentUrl.startsWith("http://127.0.0.1")) {
  const otherSiteUrl = siteUrl.replace("localhost", "127.0.0.1");
  updatedUrl = currentUrl.replace(otherSiteUrl + "", "");
}
if ("".length > 0) {
  updatedUrl = updatedUrl.replace("/", "");
}
// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-home",
    title: "Home",
    section: "Navigation menu",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "Publications",
          description: "",
          section: "Navigation menu",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-news",
          title: "News",
          description: "",
          section: "Navigation menu",
          handler: () => {
            window.location.href = "/news/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation menu",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "news-our-work-on-microbial-load-prediction-has-been-published-in-cell-https-www-sciencedirect-com-science-article-pii-s0092867424012042",
          title: 'Our work on microbial load prediction has been published in Cell.       https://www.sciencedirect.com/science/article/pii/S0092867424012042',
          description: "",
          section: "News",},{id: "news-our-multi-biome-analysis-of-the-ibd-gut-microbiome-has-been-published-in-nature-communications-https-www-nature-com-articles-s41467-024-54797-8",
          title: 'Our multi-biome analysis of the IBD gut microbiome has been published in Nature...',
          description: "",
          section: "News",},{id: "news-i-started-a-new-position-as-a-project-associate-professor-at-the-life-science-data-research-center-utokyo",
          title: 'I started a new position as a Project Associate Professor at the Life...',
          description: "",
          section: "News",},{id: "news-our-paper-describing-the-planetary-scale-viral-genome-database-vire-has-been-published-in-nucleic-acids-research-https-academic-oup-com-nar-advance-article-doi-10-1093-nar-gkaf1225-8356007",
          title: 'Our paper describing the planetary-scale viral genome database “VIRE” has been published in...',
          description: "",
          section: "News",},{id: "news-our-review-paper-on-the-japanese-gut-microbiome-has-been-published-in-proceedings-of-the-japan-academy-series-b-https-www-jstage-jst-go-jp-article-pjab-102-2-102-pjab-102-006-article",
          title: 'Our review paper on the Japanese gut microbiome has been published in Proceedings...',
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
          id: 'lang-jp',
          title: 'jp',
          section: 'Languages',
          handler: () => {
            window.location.href = "/jp" + updatedUrl;
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

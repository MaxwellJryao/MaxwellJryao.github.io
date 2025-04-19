// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "Publications",
          description: "Publications by categories in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-blog",
          title: "Blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-misc",
          title: "Misc",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/misc/";
          },
        },{id: "post-japan-travel-journal-with-photo-collections",
      
        title: "Japan travel journal with photo collections",
      
      description: "An Unforgettable New Year&#39;s Trip to Japan",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/japan-travel/";
        
      },
    },{id: "news-i-started-my-phd-journey-in-the-cs-school-of-uiuc-sparkles-smile",
          title: 'I started my PhD journey in the CS School of UIUC. :sparkles: :smile:...',
          description: "",
          section: "News",},{id: "news-we-release-fans-formal-answer-selection-for-natural-language-reasoning-uinsg-lean4-enhancing-test-time-math-answer-selection-using-formal-language",
          title: 'We release FANS - Formal Answer Selection for Natural Language Reasoning Uinsg Lean4,...',
          description: "",
          section: "News",},{id: "news-we-wrote-a-report-analyzing-what-makes-grpo-stand-out-for-math-reasoning-with-some-understanding-and-ablation-studies-to-compare-different-algorithms-for-llms-reasoning-training",
          title: 'We wrote a report analyzing what makes GRPO “stand out” for math reasoning,...',
          description: "",
          section: "News",},{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/MaxwellJryao", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/jiarui-yao-a07281286", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=84fexSEAAAAJ", "_blank");
        },
      },{
        id: 'social-x',
        title: 'X',
        section: 'Socials',
        handler: () => {
          window.open("https://twitter.com/ExplainMiracles", "_blank");
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

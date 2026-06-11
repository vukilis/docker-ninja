export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Docker Ninja',
  url: 'https://dockerninja.org',
  logo: 'https://dockerninja.org/favicon-32x32.png',
  sameAs: [
    'https://github.com/vukilis/docker-ninja',
    'https://ko-fi.com/vukilis',
    'https://buymeacoffee.com/vukilis',
  ],
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Docker Ninja',
  url: 'https://dockerninja.org/',
  description:
    'Master your containerization universe with official compose stacks for any application, all in one place.',
  inLanguage: 'en-US',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://dockerninja.org/?s={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const jsonLdScriptProps = (data: Record<string, unknown>) => ({
  type: 'application/ld+json',
  dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
});

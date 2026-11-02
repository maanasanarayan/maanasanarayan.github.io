/**
 * JSON-LD for the art section. Nodes reuse the `@id`s that SiteLayout
 * declares (`#person`, `#website`) so the graphs join up.
 */
const SITE = 'https://maanasa.dev';
export const PERSON_ID = `${SITE}/#person`;
const WEBSITE_ID = `${SITE}/#website`;
export const ART_COLLECTION_ID = `${SITE}/art/#collection`;

export const absolute = (path: string) => new URL(path, SITE).toString();

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbList(pageUrl: string, crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#art-breadcrumbs`,
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

export function collectionPage({
  pageUrl,
  name,
  description,
  items,
  isPartOf,
}: {
  pageUrl: string;
  name: string;
  description: string;
  items: { url: string; name: string }[];
  isPartOf?: string;
}) {
  return {
    '@type': 'CollectionPage',
    '@id':
      pageUrl === absolute('/art/')
        ? ART_COLLECTION_ID
        : `${pageUrl}#collection`,
    url: pageUrl,
    name,
    description,
    inLanguage: 'en',
    isPartOf: { '@id': isPartOf ?? WEBSITE_ID },
    author: { '@id': PERSON_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absolute(item.url),
        name: item.name,
      })),
    },
  };
}

export const jsonLd = (...nodes: object[]) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });

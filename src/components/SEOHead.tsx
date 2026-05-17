import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  type?: string;
  image?: string;
  structuredData?: object | object[];
}

const BASE_URL = 'https://hairytalesbeautyhome.com';
const STRUCTURED_DATA_ID = 'seohead-structured-data';

const SEOHead = ({ title, description, canonicalPath, type = 'website', image, structuredData }: SEOHeadProps) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', type, true);
    setMeta('twitter:title', title, true);
    setMeta('twitter:description', description, true);

    if (image) {
      const absoluteImage = image.startsWith('http') ? image : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
      setMeta('og:image', absoluteImage, true);
      setMeta('twitter:image', absoluteImage, true);
    }

    if (canonicalPath) {
      const fullUrl = `${BASE_URL}${canonicalPath}`;
      setMeta('og:url', fullUrl, true);
      setMeta('twitter:url', fullUrl, true);

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', fullUrl);
    }

    if (structuredData) {
      let script = document.getElementById(STRUCTURED_DATA_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = STRUCTURED_DATA_ID;
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    return () => {
      const script = document.getElementById(STRUCTURED_DATA_ID);
      if (script) script.remove();
    };
  }, [title, description, canonicalPath, type, image, structuredData]);

  return null;
};

export default SEOHead;

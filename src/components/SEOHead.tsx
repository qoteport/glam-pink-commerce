import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  type?: string;
  image?: string;
}

const SEOHead = ({ title, description, canonicalPath, type = 'website', image }: SEOHeadProps) => {
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
    
    if (image) {
      setMeta('og:image', image, true);
    }

    if (canonicalPath) {
      const baseUrl = 'https://hairytalesbeautyhome.com';
      const fullUrl = `${baseUrl}${canonicalPath}`;
      setMeta('og:url', fullUrl, true);
      
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', fullUrl);
    }

    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.remove();
    };
  }, [title, description, canonicalPath, type, image]);

  return null;
};

export default SEOHead;

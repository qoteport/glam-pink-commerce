import React, { useEffect, useState } from 'react';
import { generateSitemap } from '@/lib/sitemap';

const SitemapPage = () => {
  const [xml, setXml] = useState<string>('');

  useEffect(() => {
    generateSitemap().then(setXml);
  }, []);

  if (!xml) {
    return <div className="p-8">Generating sitemap...</div>;
  }

  return (
    <pre className="whitespace-pre-wrap text-xs p-4 bg-muted font-mono max-w-5xl mx-auto mt-8">
      {xml}
    </pre>
  );
};

export default SitemapPage;

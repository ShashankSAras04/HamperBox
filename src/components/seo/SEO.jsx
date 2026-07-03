import React, { useEffect } from 'react';

export const SEO = ({
  title,
  description = 'Exquisite and luxurious custom hampers for all occasions. Order premium gourmet, self-care, and corporate gifts from HampBox.',
  canonicalUrl = window.location.href,
  ogImage = 'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd0?auto=format&fit=crop&q=80&w=800',
  schemaType = 'WebPage',
  schemaData = null
}) => {
  const fullTitle = `${title} | HampBox - Premium Online Gifting Platform`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to find or create meta tag
    const setMetaTag = (attrName, attrValue, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to find or create link tag
    const setLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Standard SEO Tags
    setMetaTag('name', 'description', description);
    setLinkTag('canonical', canonicalUrl);

    // OpenGraph Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', 'HampBox');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // Structured Schema.org Data Injection
    let schemaScript = document.getElementById('seo-schema-jsonld');
    if (schemaScript) {
      schemaScript.remove();
    }

    const baseSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://hampbox.com/#organization',
          'name': 'HampBox',
          'url': 'https://hampbox.com',
          'logo': 'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd0?auto=format&fit=crop&q=80&w=200',
          'description': 'Exquisite and luxurious custom hampers for all occasions.'
        },
        {
          '@type': 'WebSite',
          '@id': 'https://hampbox.com/#website',
          'url': 'https://hampbox.com',
          'name': 'HampBox',
          'publisher': {
            '@id': 'https://hampbox.com/#organization'
          }
        }
      ]
    };

    if (schemaData) {
      baseSchema['@graph'].push({
        '@type': schemaType,
        ...schemaData
      });
    }

    schemaScript = document.createElement('script');
    schemaScript.id = 'seo-schema-jsonld';
    schemaScript.type = 'application/ld+json';
    schemaScript.innerHTML = JSON.stringify(baseSchema);
    document.head.appendChild(schemaScript);

    return () => {
      // Clean up dynamic schema tags on unmount
      const existing = document.getElementById('seo-schema-jsonld');
      if (existing) existing.remove();
    };
  }, [fullTitle, description, canonicalUrl, ogImage, schemaType, schemaData]);

  return null; // Side-effect only component
};

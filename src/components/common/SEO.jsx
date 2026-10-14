import { useEffect } from 'react';

/**
 * Reusable SEO component for managing document title, meta tags, Open Graph, 
 * canonical link, and JSON-LD structured data in single page applications.
 */
const SEO = ({
    title = 'Stories by LSD | Wedding Photography & Cinematic Films | Chennai',
    description = 'Premier wedding photography and cinematic films based in Chennai. Capturing authentic emotions, candid celebrations, and timeless wedding stories across South India.',
    canonical = 'https://www.storiesbylsd.com/',
    ogImage = 'https://www.storiesbylsd.com/assets/PRIMARY%20LOGO-DkWJIAri.png',
    ogType = 'website',
    schema = null,
}) => {
    useEffect(() => {
        // 1. Update Title
        if (title) {
            document.title = title;
        }

        // Helper to update or create a meta tag
        const setMetaTag = (attrName, attrValue, content) => {
            if (!content) return;
            let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attrName, attrValue);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        // 2. Standard Meta Tags
        setMetaTag('name', 'description', description);
        setMetaTag('name', 'keywords', 'wedding photography chennai, candid wedding photographer chennai, wedding films chennai, luxury wedding photography, stories by lsd');

        // 3. Open Graph Meta Tags
        setMetaTag('property', 'og:title', title);
        setMetaTag('property', 'og:description', description);
        setMetaTag('property', 'og:url', canonical);
        setMetaTag('property', 'og:type', ogType);
        setMetaTag('property', 'og:image', ogImage);
        setMetaTag('property', 'og:site_name', 'Stories by LSD');

        // 4. Twitter Card Meta Tags
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:title', title);
        setMetaTag('name', 'twitter:description', description);
        setMetaTag('name', 'twitter:image', ogImage);

        // 5. Canonical Link
        if (canonical) {
            let link = document.querySelector('link[rel="canonical"]');
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', 'canonical');
                document.head.appendChild(link);
            }
            link.setAttribute('href', canonical);
        }

        // 6. JSON-LD Schema
        let scriptTag = document.getElementById('json-ld-schema');
        if (schema) {
            if (!scriptTag) {
                scriptTag = document.createElement('script');
                scriptTag.id = 'json-ld-schema';
                scriptTag.type = 'application/ld+json';
                document.head.appendChild(scriptTag);
            }
            scriptTag.textContent = JSON.stringify(schema);
        } else if (scriptTag) {
            scriptTag.remove();
        }
    }, [title, description, canonical, ogImage, ogType, schema]);

    return null;
};

export default SEO;

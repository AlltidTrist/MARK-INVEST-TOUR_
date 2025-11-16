(function () {
    'use strict';

    const BRAND_NAME = 'MARK INVEST TOUR';
    const BRAND_TAGLINE = 'Инвестиционные путешествия и private lifestyle экспедиции';
    const META_DESCRIPTION = 'MARK INVEST TOUR — клуб инвесторов и путешественников: создаём экспедиции, сочетаем бизнес-встречи и эмоции, сопровождаем клиентов 360°.';
    const TEXT_REPLACEMENTS = [
        { search: /NEVEREND\s*Travel/gi, replace: BRAND_NAME },
        { search: /NEVEREND/gi, replace: BRAND_NAME }
    ];
    const EXCLUDED_PARENTS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OPTION']);

    function updateMeta() {
        document.title = `${BRAND_NAME} | ${BRAND_TAGLINE}`;

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', META_DESCRIPTION);
        }

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', `${BRAND_NAME} | ${BRAND_TAGLINE}`);
        }

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.setAttribute('content', META_DESCRIPTION);
        }
    }

    function replaceBrandText() {
        if (!document.body) {
            return;
        }

        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    if (!node || !node.nodeValue || !node.parentNode) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (EXCLUDED_PARENTS.has(node.parentNode.nodeName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (!/NEVEREND/i.test(node.nodeValue)) {
                        return NodeFilter.FILTER_SKIP;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const targets = [];
        while (walker.nextNode()) {
            targets.push(walker.currentNode);
        }

        targets.forEach(node => {
            let updated = node.nodeValue;
            TEXT_REPLACEMENTS.forEach(({ search, replace }) => {
                updated = updated.replace(search, replace);
            });
            if (updated !== node.nodeValue) {
                node.nodeValue = updated;
            }
        });
    }

    function initBrandTheme() {
        document.body.classList.add('brand-theme');
        document.body.dataset.brand = 'mark-invest-tour';
        updateMeta();
        replaceBrandText();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBrandTheme, { once: true });
    } else {
        initBrandTheme();
    }
})();


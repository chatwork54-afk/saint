
document.addEventListener('DOMContentLoaded', () => {
    // Initial content fade in
    document.documentElement.classList.remove('is-animating');

    // Cache the initial content (Home) to avoid fetching it later (which fails on file://)
    const initialContent = document.getElementById('app-content');
    if (initialContent) {
        // Determine current filename
        let currentFile = window.location.pathname.split('/').pop() || 'index.html';
        if (currentFile === '') currentFile = 'index.html'; // Handle root

        if (!document.getElementById('tmpl-' + currentFile)) {
            const tmpl = document.createElement('template');
            tmpl.id = 'tmpl-' + currentFile;
            tmpl.innerHTML = initialContent.innerHTML;
            document.body.appendChild(tmpl);
        }
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        // Ignore external links, anchors, or non-html
        if (!href || href.startsWith('http') || href.startsWith('#') || !href.endsWith('.html')) return;

        e.preventDefault();
        navigateTo(href);
    });

    window.addEventListener('popstate', () => {
        navigateTo(window.location.pathname.split('/').pop() || 'index.html', false);
    });
});

async function navigateTo(url, push = true) {
    document.documentElement.classList.add('is-animating');

    try {
        let newContent;
        let title = document.title; // Default to current if not found in template (templates check is partial)

        // 1. Check for Template (Offline support)
        // Normalize: remove ./ or / prefix to match ID
        const templateId = 'tmpl-' + url.replace(/^(\.\/|\/)/, '');
        const template = document.getElementById(templateId);
        if (template) {
            // Wait for fade out
            await new Promise(r => setTimeout(r, 400));

            // Create a temporary container to hold the template content so we can query it easily
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(template.content.cloneNode(true));
            newContent = tempDiv.querySelector('#app-content') || tempDiv;

            // Try to find title if stored in data attribute or just leave it
            // We can add data-title to templates if needed
        } else {
            // 2. Fallback to Fetch (Server)
            const response = await fetch(url);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            newContent = doc.getElementById('app-content');
            title = doc.title;
        }

        const oldContent = document.getElementById('app-content');

        if (newContent && oldContent) {
            if (!template) {
                // Only wait if we fetched (template path already waited)
                await new Promise(r => setTimeout(r, 400));
            }

            oldContent.innerHTML = newContent.innerHTML;
            if (title) document.title = title;

            if (push) {
                try {
                    history.pushState({}, '', url);
                } catch (idx) {
                    console.warn('History API not supported (file:// protocol?), skipping URL update.');
                }
            }

            // Re-run inline scripts
            const scripts = newContent.querySelectorAll('script');
            scripts.forEach(oldScript => {
                if (oldScript.textContent.includes('bg-music') || (oldScript.src && oldScript.src.includes('music'))) return;

                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                document.body.appendChild(newScript);
            });

            window.scrollTo(0, 0);
        } else {
            window.location.href = url;
            return;
        }

    } catch (err) {
        console.error('Navigation failed', err);
        window.location.href = url;
    } finally {
        document.documentElement.classList.remove('is-animating');
    }
}

// hooks/useCustomNavigation.ts
export function Navigation() {
    const navigateTo = (path: 'landing' | 'dashboard' | 'About' | 'Sponsoring' | 'Community') => {
        let newUrl = '/'; // Default to root
        
        if (path === 'landing') {
            localStorage.setItem('ninja_isStarted', 'false');
        } else if (path === 'dashboard') {
            localStorage.setItem('ninja_isStarted', 'true');
        } else {
            // About, Sponsoring, Community -> /about, /sponsoring, /community
            localStorage.setItem('ninja_isStarted', 'true');
            newUrl = `/${path.toLowerCase()}`;
        }

        window.history.pushState({ path: newUrl }, '', newUrl);
        window.dispatchEvent(new Event('popstate'));
    };

    return { navigateTo };
}
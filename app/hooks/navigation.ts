// hooks/useCustomNavigation.ts
export function Navigation() {
    const navigateTo = (path: 'landing' | 'dashboard' | 'About' | 'Sponsoring' | 'Community') => {
        let newUrl = window.location.pathname;
        
        if (path === 'landing') {
        localStorage.setItem('ninja_isStarted', 'false');
        } else if (path !== 'dashboard') {
        localStorage.setItem('ninja_isStarted', 'true');
        newUrl = `${window.location.pathname}?view=${path}`;
        } else {
        localStorage.setItem('ninja_isStarted', 'true');
        }

        window.history.pushState({ path: newUrl }, '', newUrl);
        window.dispatchEvent(new Event('popstate'));
    };

    return { navigateTo };
}
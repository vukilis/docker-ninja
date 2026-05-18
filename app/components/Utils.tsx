/**
 * Generates or retrieves a totally anonymous, random browser identifier.
 * This contains zero personal identity metrics (No IPs, no names, no accounts).
 */
export function getOrCreateDeviceUUID(): string {
    if (typeof window === 'undefined') return '';

    const storageKey = 'sys_dev_token';
    let deviceId = '';

    try {
        deviceId = localStorage.getItem(storageKey) || '';
    } catch (e) {}

    if (!deviceId && typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^| )' + storageKey + '=([^;]+)'));
        if (match) deviceId = match[2];
    }

    if (!deviceId || deviceId.trim() === '') {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    try {
        localStorage.setItem(storageKey, deviceId);
    } catch (e) {}

    if (typeof document !== 'undefined') {
        document.cookie = `${storageKey}=${deviceId}; max-age=${5 * 365 * 24 * 60 * 60}; path=/; SameSite=Strict`;
    }
    
    return deviceId;
}
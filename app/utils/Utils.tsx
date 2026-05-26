/**
 * Generates or retrieves a totally anonymous, random browser identifier.
 * This contains zero personal identity metrics (No IPs, no names, no accounts).
 */
export function getOrCreateDeviceUUID(): string {
    if (typeof window === 'undefined') return '';

    const storageKey = 'sys_dev_token';
    let deviceId = '';

    // 1Try to read the ID from localStorage
    try {
        deviceId = localStorage.getItem(storageKey) || '';
    } catch (e) {}

    // If it doesn't exist, create a new random one
    if (!deviceId || deviceId.trim() === '') {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        try {
            localStorage.setItem(storageKey, deviceId);
        } catch (e) {}
    }
    
    return deviceId;
}
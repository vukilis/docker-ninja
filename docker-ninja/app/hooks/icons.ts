import * as si from 'simple-icons';

export const getIcon = (id: string, iconUrl?: string) => {
    // 1. If custom URL exists, return it immediately
    if (iconUrl) {
        return { type: 'url', src: iconUrl };
    }

    // 2. Otherwise, perform the simple-icons lookup
    const capitalized = id.charAt(0).toUpperCase() + id.slice(1);
    const iconKey = `si${capitalized}` as keyof typeof si;
    const icon = si[iconKey];

    return icon ? { type: 'svg', svg: icon.svg } : null;
};
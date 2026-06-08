import { siDocker } from 'simple-icons';
import { siGithub } from 'simple-icons';
import { siPostgresql } from 'simple-icons';
import { siSupabase } from 'simple-icons';

const iconRegistry: Record<string, typeof siDocker> = {
    docker: siDocker,
    github: siGithub,
    postgresql: siPostgresql,
    supabase: siSupabase,
};

export const getIcon = (id: string, iconUrl?: string) => {
    if (iconUrl) {
        return { type: 'url', src: iconUrl };
    }
    const icon = iconRegistry[id.toLowerCase()];
    return icon ? { type: 'svg', svg: icon.svg } : null;
};
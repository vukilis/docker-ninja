"use server";
import fs from 'fs/promises';
import path from 'path';

export async function getComposeFile(id: string) {
    try {
        const filePath = path.join(process.cwd(), 'content', 'apps', `${id}.yml`);
        return await fs.readFile(filePath, 'utf8');
    } catch (e) {
        return "Error: Compose file not found.";
    }
}
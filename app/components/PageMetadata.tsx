'use client';

import React, { useEffect } from 'react';

export type PageMetaKey = 'landing' | 'dashboard' | 'categories' | 'about' | 'community' | 'sponsoring' | 'docs';

export interface MetadataProperties {
  title: string;
  description: string;
}

const metadataMap: Record<PageMetaKey, MetadataProperties> = {
  landing: {
    title: 'Docker Ninja | Explore the Infinite Stack',
    description: 'Master your containerization universe with official compose stacks for any application, all in one place. Dive into a hub perfectly crafted for both absolute beginners and seasoned experts in the vast containerization ecosystem.',
  },
  dashboard: {
    title: 'Explore Containers | Docker Ninja',
    description: 'Access the official collection of battle-tested docker-compose.yml files. No more scouring the web, just deploy, scale, and launch.',
  },
  categories: {
    title: 'Browse Categories | Docker Ninja',
    description: 'Browse the official collection of battle-tested docker-compose.yml files categorized by technical architecture layers. Find the perfect stack for your project, whether it’s a simple web server or a complex microservices setup.',
  },
  about: {
    title: 'About | Docker Ninja',
    description: 'Containerization redefined my reality, yet I constantly hit a ceiling. I grew tired of the fragmented search for reliable infrastructure code and the endless scouring for inspiration. I built this universe to collapse the hurdles. Whether you are a student exploring the basics, a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.',
  },
  community: {
    title: 'Community | Docker Ninja',
    description: 'Found a bug? Have a stack suggestion? Want to just say hi? Our core is built on open communication and shared curiosity.',
  },
  sponsoring: {
    title: 'Sponsoring | Docker Ninja',
    description: 'If these compose files saved you hours of debugging or helped you learn something new, consider sending a one-time donation to keep the lights on and the registry growing. Your support keeps the servers running and the code open source.',
  },
  docs: {
    title: 'Documentation | Docker Ninja',
    description: 'Professional reference for installing Docker, Docker Compose, structuring compose files, and configuring .env variables. Official links and annotated examples included.',
  }
};

interface DynamicMetadataProps {
  isStarted: boolean;
  currentView: 'dashboard'| 'categories' | 'About' | 'Sponsoring' | 'Community' | 'Docs';
  selectedApp: { name: string } | null;
}

export function ClientMetadataController({ isStarted, currentView, selectedApp }: DynamicMetadataProps) {
  useEffect(() => {
    let activeKey: PageMetaKey = 'landing';

    // Resolve primary active keys based on current sidebar and engine state
    if (isStarted) {
      if (currentView === 'About') {
        activeKey = 'about';
      } else if (currentView === 'Sponsoring') {
        activeKey = 'sponsoring';
      } else if (currentView === 'Community') {
        activeKey = 'community';
      } else if (currentView === 'categories') {
        activeKey = 'categories';
      } else if (currentView === 'Docs') {
        activeKey = 'docs';
      } else {
        activeKey = 'dashboard';
      }
    }

    const data = metadataMap[activeKey];
    if (data) {
      let finalTitle = data.title;
      let finalDesc = data.description;

      // Intercept context if a container detail card modal is pulled up
      if (isStarted && selectedApp && (currentView === 'dashboard' || currentView === 'categories')) {
        finalTitle = `Previewing ${selectedApp.name} | Docker Ninja`;
        finalDesc = `Read configuration steps, settings, and deployment details for ${selectedApp.name}.`;
      }

      // Update Native Document Window Title
      document.title = finalTitle;

      const updateMetaTag = (selector: string, attributeName: string, attributeValue: string, contentValue: string) => {
        let element = document.querySelector(selector);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attributeName, attributeValue);
          document.head.appendChild(element);
        }
        element.setAttribute('content', contentValue);
      };

      // Synchronize All Key Social Architecture Core Head Meta Targets
      // Standard Target
      updateMetaTag('meta[name="description"]', 'name', 'description', finalDesc);
      
      // OpenGraph Targets
      updateMetaTag('meta[property="og:title"]', 'property', 'og:title', finalTitle);
      updateMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDesc);
      
      // Twitter Card Targets 
      updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
      updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', finalDesc);
    }
  }, [isStarted, currentView, selectedApp]);

  return null;
}
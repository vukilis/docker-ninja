import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

export const NetworkBackground = ({ apps = [] }) => {
  const mountRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const scrollY = useRef(0);
  const frameId = useRef(0);
  const lastLineUpdate = useRef(0);
  const textureCache = useRef(new Map());

  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && (window.innerWidth < 768 || navigator.maxTouchPoints > 0);
  }, []);

  // Ensure nodeData is correctly mapped from apps prop
  const nodeData = useMemo(() => {
    const maxNodes = isMobile ? 22 : 45;
    const baseData = (!apps || apps.length === 0) 
      ? Array.from({ length: maxNodes }).map((_, i) => ({ id: `f-${i}`, name: `Node ${i}`, icon_type: 'default' }))
      : apps;
    return baseData.slice(0, maxNodes);
  }, [apps, isMobile]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = isMobile ? 220 : 180;

    const nodeGroup = new THREE.Group();
    const nodes = [];

    // Utility to create textures from SVGs or Fallbacks
    const getTexture = (app) => {
      const color = app.color || '#60a5fa';
      const cacheKey = (app.icon || app.icon_url || 'default') + color;
      
      if (textureCache.current.has(cacheKey)) return textureCache.current.get(cacheKey);

      const size = isMobile ? 128 : 256;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const texture = new THREE.CanvasTexture(canvas);

      const renderIcon = (imgSource) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.clearRect(0, 0, size, size);
          ctx.shadowBlur = size / 20;
          ctx.shadowColor = color;
          ctx.drawImage(img, size * 0.15, size * 0.15, size * 0.7, size * 0.7);
          texture.needsUpdate = true;
        };
        img.src = imgSource;
      };

      if (app.icon_url) {
        renderIcon(app.icon_url);
      } else if (app.icon && app.icon.includes('<svg')) {
        const svgString = app.icon.includes('fill=') ? app.icon : app.icon.replace('<path', `<path fill="${color}"`);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        renderIcon(URL.createObjectURL(svgBlob));
      } else {
        // Fallback: Simple Circle/Dot if no icon
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
        ctx.fill();
        texture.needsUpdate = true;
      }

      textureCache.current.set(cacheKey, texture);
      return texture;
    };

    nodeData.forEach((app) => {
      const texture = getTexture(app);
      const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true, 
        opacity: 0, 
        blending: THREE.AdditiveBlending 
      });
      
      const sprite = new THREE.Sprite(material);
      const rangeX = isMobile ? 280 : 400;
      const rangeY = isMobile ? 400 : 250;

      sprite.position.set(
        (Math.random() - 0.5) * rangeX,
        (Math.random() - 0.5) * rangeY,
        (Math.random() - 0.5) * 100
      );

      sprite.userData = {
        origin: sprite.position.clone(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.0005 + Math.random() * 0.0001, 
        drift: new THREE.Vector3(
          Math.random() * 15,
          Math.random() * 15,
          Math.random() * 15
        ),
        targetOpacity: 0.5 + Math.random() * 0.4
      };
      
      sprite.scale.set(0, 0, 1);
      nodes.push(sprite);
      nodeGroup.add(sprite);
    });

    scene.add(nodeGroup);

    // Lines setup
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending });
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(nodes.length * 10 * 3);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    const animate = (time) => {
      frameId.current = requestAnimationFrame(animate);
      
      nodeGroup.rotation.y += 0.0003;
      nodeGroup.position.y = scrollY.current * 0.08;

      let lineIdx = 0;
      const shouldUpdateLines = !isMobile || (time - lastLineUpdate.current > 30);
      if (shouldUpdateLines) lastLineUpdate.current = time;

      nodes.forEach((node, i) => {
        const data = node.userData;
        const t = time * data.speed;
        
        // Faster movement logic
        const targetX = data.origin.x + Math.sin(t + data.phase) * data.drift.x;
        const targetY = data.origin.y + Math.cos(t * 0.7 + data.phase) * data.drift.y;
        
        // Lerp for smoothness
        node.position.x += (targetX + (mouse.current.x * 15) - node.position.x) * 0.15;
        node.position.y += (targetY + (mouse.current.y * 15) - node.position.y) * 0.15;

        // Fade in and grow
        if (node.material.opacity < data.targetOpacity) {
          node.material.opacity += 0.02;
          const s = node.scale.x + ( (isMobile ? 15 : 12) - node.scale.x) * 0.1;
          node.scale.set(s, s, 1);
        }

        if (shouldUpdateLines) {
          for (let j = i + 1; j < nodes.length; j++) {
            const d2 = node.position.distanceToSquared(nodes[j].position);
            if (d2 < 8000 && lineIdx < linePositions.length - 6) {
              linePositions[lineIdx++] = node.position.x;
              linePositions[lineIdx++] = node.position.y;
              linePositions[lineIdx++] = node.position.z;
              linePositions[lineIdx++] = nodes[j].position.x;
              linePositions[lineIdx++] = nodes[j].position.y;
              linePositions[lineIdx++] = nodes[j].position.z;
            }
          }
        }
      });

      if (shouldUpdateLines) {
        lineGeometry.attributes.position.needsUpdate = true;
        lineGeometry.setDrawRange(0, lineIdx / 3);
      }
      
      renderer.render(scene, camera);
    };

    const handleInput = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      mouse.current.x = (x / window.innerWidth) * 2 - 1;
      mouse.current.y = -(y / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };

    window.addEventListener('mousemove', handleInput);
    window.addEventListener('touchmove', handleInput, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    animate(0);

    return () => {
      window.removeEventListener('mousemove', handleInput);
      window.removeEventListener('touchmove', handleInput);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frameId.current);
      renderer.dispose();
      scene.clear();
    };
  }, [nodeData, isMobile]);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ 
        maskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 80%)'
      }}
    />
  );
};

export default NetworkBackground;
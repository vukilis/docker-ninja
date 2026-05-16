import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

export const NetworkBackground = ({ apps = [] }) => {
  const mountRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const targetMouse = useRef({ x: 0, y: 0 });
  const raycaster = useRef(new THREE.Raycaster());
  const ndcMouse = useRef(new THREE.Vector2());
  
  const scrollY = useRef(0);
  const targetScrollY = useRef(0);
  const windowDims = useRef({ width: 0, height: 0 });
  
  const frameId = useRef(0);
  const textureCache = useRef(new Map());
  const hoveredSprite = useRef(null);

  // Core tracking references for the 6-second laser mechanics
  const lastLaserTime = useRef(0);
  const activeLaser = useRef(null);

  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && (window.innerWidth < 768 || navigator.maxTouchPoints > 0);
  }, []);

  const orbitData = useMemo(() => {
    const maxObjects = isMobile ? 20 : 50; 
    const baseData = (!apps || apps.length === 0) 
      ? Array.from({ length: maxObjects }).map((_, i) => ({ id: `w-${i}`, icon_type: 'default' }))
      : apps;
    return baseData.slice(0, maxObjects);
  }, [apps, isMobile]);

  useEffect(() => {
    if (!mountRef.current) return;

    windowDims.current = { width: window.innerWidth, height: window.innerHeight };

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.002);

    const camera = new THREE.PerspectiveCamera(60, windowDims.current.width / windowDims.current.height, 0.1, 2000);
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile, 
      alpha: true, 
      precision: isMobile ? "mediump" : "highp" 
    });
    
    renderer.setSize(windowDims.current.width, windowDims.current.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = isMobile ? 400 : 320;

    const solarSystemGroup = new THREE.Group();
    const orbitingNodes = [];
    
    // Independent coordinate tracking group for free-roaming asteroids
    const wanderingAsteroidGroup = new THREE.Group();
    scene.add(wanderingAsteroidGroup);

    const brilliantPalette = ['#ff007f', '#00f0ff', '#ffaa00', '#a020f0', '#00ff66', '#ff3333'];
    const planetPalette = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

    // --- Base Twinkle Star Texture (Idling Form for Nodes) ---
    const getStarTexture = () => {
      if (textureCache.current.has('base_star')) return textureCache.current.get('base_star');
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const center = size / 2;

      const grad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.7);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(0, 240, 255, 0.7)'); 
      grad.addColorStop(0.6, 'rgba(0, 240, 255, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      const texture = new THREE.CanvasTexture(canvas);
      textureCache.current.set('base_star', texture);
      return texture;
    };

    // --- High-Brilliance Solar Ring Texture (Revealed via Desktop Hover / Laser Reveal) ---
    const getBrilliantRingTexture = (app, index) => {
      const color = app.color || brilliantPalette[index % brilliantPalette.length];
      const cacheKey = 'bright_ring_' + (app.icon || app.icon_url || 'ring') + color;
      
      if (textureCache.current.has(cacheKey)) return textureCache.current.get(cacheKey);

      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const center = size / 2;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center, center, size * 0.28, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.shadowBlur = 25; 
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(center, center, size * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const ringGlow = ctx.createRadialGradient(center, center, size * 0.15, center, center, size * 0.45);
      ringGlow.addColorStop(0, `${color}66`);
      ringGlow.addColorStop(0.4, `${color}33`);
      ringGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = ringGlow;
      ctx.beginPath(); ctx.arc(center, center, size * 0.5, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#0d1117';
      ctx.beginPath(); ctx.arc(center, center, size * 0.24, 0, Math.PI * 2); ctx.fill();

      if (app.icon_url || app.icon) {
        const renderIcon = (imgSource) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.save();
            ctx.beginPath(); ctx.arc(center, center, size * 0.22, 0, Math.PI * 2); ctx.clip();
            ctx.globalAlpha = 1.0; 
            ctx.globalCompositeOperation = 'source-over'; 
            ctx.drawImage(img, center - size * 0.15, center - size * 0.15, size * 0.3, size * 0.3);
            ctx.restore();
            texture.needsUpdate = true;
          };
          img.src = imgSource;
        };

        if (app.icon_url) {
          renderIcon(app.icon_url);
        } else if (app.icon && app.icon.includes('<svg')) {
          const svgBlob = new Blob([app.icon], { type: 'image/svg+xml;charset=utf-8' });
          renderIcon(URL.createObjectURL(svgBlob));
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      textureCache.current.set(cacheKey, texture);
      return texture;
    };

    // --- Procedural Background Planet Texture Generator ---
    const getPlanetTexture = (index) => {
      const color = planetPalette[index % planetPalette.length];
      const cacheKey = `planet_${index % planetPalette.length}`;
      if (textureCache.current.has(cacheKey)) return textureCache.current.get(cacheKey);

      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const center = size / 2;

      const atmosphere = ctx.createRadialGradient(center, center, size * 0.25, center, center, size * 0.45);
      atmosphere.addColorStop(0, `${color}44`);
      atmosphere.addColorStop(1, 'transparent');
      ctx.fillStyle = atmosphere;
      ctx.beginPath(); ctx.arc(center, center, size * 0.5, 0, Math.PI * 2); ctx.fill();

      const sphere = ctx.createRadialGradient(center - size * 0.08, center - size * 0.08, size * 0.02, center, center, size * 0.3);
      sphere.addColorStop(0, '#ffffff');
      sphere.addColorStop(0.3, color);
      sphere.addColorStop(0.9, '#050510');
      sphere.addColorStop(1, 'transparent');
      ctx.fillStyle = sphere;
      ctx.beginPath(); ctx.arc(center, center, size * 0.3, 0, Math.PI * 2); ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      textureCache.current.set(cacheKey, texture);
      return texture;
    };

    // --- Custom Asteroid Texture ---
    const getAsteroidTexture = () => {
      if (textureCache.current.has('wandering_asteroid')) return textureCache.current.get('wandering_asteroid');
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const center = size / 2;

      const grad = ctx.createRadialGradient(center, center, size * 0.05, center, center, size * 0.4);
      grad.addColorStop(0, '#a19288');
      grad.addColorStop(0.4, '#5c4e43');
      grad.addColorStop(0.8, '#211a15');
      grad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(center, center, size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      textureCache.current.set('wandering_asteroid', texture);
      return texture;
    };

    // --- Satellite Texture ---
    const getSatelliteTexture = () => {
      if (textureCache.current.has('orbital_satellite')) return textureCache.current.get('orbital_satellite');
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const center = size / 2;

      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f0ff';
      ctx.fillRect(center - 6, center - 6, 12, 12);
      
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(center - 24, center - 2, 14, 4);
      ctx.fillRect(center + 10, center - 2, 14, 4);

      const texture = new THREE.CanvasTexture(canvas);
      textureCache.current.set('orbital_satellite', texture);
      return texture;
    };

    // --- Dense Background Starfield Generator ---
    const starCount = isMobile ? 1000 : 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1400;
      starPositions[i + 1] = (Math.random() - 0.5) * 1400;
      starPositions[i + 2] = (Math.random() - 0.6) * 600;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: isMobile ? 2.0 : 2.5,
      map: getStarTexture(),
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // --- Build Core System Infrastructure ---
    const totalApps = orbitData.length;
    const totalLanes = isMobile ? 5 : 9; 
    const defaultStarMap = getStarTexture();

    // Build Interactive Star Clusters (Application Targets)
    orbitData.forEach((app, i) => {
      const activeRingMap = getBrilliantRingTexture(app, i);
      const initialMap = isMobile ? activeRingMap : defaultStarMap;

      const material = new THREE.SpriteMaterial({ 
        map: initialMap, 
        transparent: true, 
        opacity: 0,
        blending: THREE.AdditiveBlending
      });
      
      const sprite = new THREE.Sprite(material);
      const currentLane = i % totalLanes;
      const baseRadiusX = isMobile ? 110 : 170;
      const baseRadiusY = isMobile ? 160 : 110;
      const laneSpacing = isMobile ? 26 : 34;
      const startingAngle = (i / totalApps) * (Math.PI * 2);

      sprite.userData = {
        isPlanet: false,
        radiusX: baseRadiusX + (currentLane * laneSpacing),
        radiusY: baseRadiusY + (currentLane * (laneSpacing * 0.7)),
        angle: startingAngle,
        speed: 0.00003 + (0.00005 / (currentLane + 1)),
        scaleNormal: isMobile ? 20 : 12, 
        scaleHover: isMobile ? 20 : 36, 
        targetOpacity: 0.9,
        zDepth: (Math.random() - 0.5) * 20,
        starTexture: defaultStarMap,
        ringTexture: activeRingMap,
        isRevealed: isMobile,
        isAddedToMorphedStars: false
      };
      
      sprite.scale.set(0, 0, 1);
      orbitingNodes.push(sprite);
      solarSystemGroup.add(sprite);
    });

    // Inject Background Cosmic Planets
    const standalonePlanetCount = isMobile ? 4 : 10;
    for (let p = 0; p < standalonePlanetCount; p++) {
      const planetMap = getPlanetTexture(p);
      const material = new THREE.SpriteMaterial({
        map: planetMap,
        transparent: true,
        opacity: 0,
        blending: THREE.NormalBlending 
      });

      const sprite = new THREE.Sprite(material);
      const lane = p % totalLanes;
      const baseRadiusX = (isMobile ? 140 : 220) + (lane * (isMobile ? 35 : 45));
      const baseRadiusY = (isMobile ? 190 : 150) + (lane * (isMobile ? 25 : 35));
      const radiusVarianceX = (Math.random() - 0.5) * 10;
      const radiusVarianceY = (Math.random() - 0.5) * 8;
      const isRightSide = p % 2 === 0;
      const hemisphereBaseAngle = isRightSide ? 0 : Math.PI;
      const stepInHemisphere = (Math.floor(p / 2) / (standalonePlanetCount / 2)) * Math.PI;
      const jitter = (Math.random() - 0.5) * (Math.PI / 6);
      
      const balancedStartingAngle = hemisphereBaseAngle + stepInHemisphere + jitter;

      sprite.userData = {
        isPlanet: true,
        radiusX: baseRadiusX + radiusVarianceX,
        radiusY: baseRadiusY + radiusVarianceY,
        angle: balancedStartingAngle,
        speed: 0.00001 + (0.00002 / (lane + 1)), 
        scaleNormal: isMobile ? 25 + Math.random() * 15 : 35 + Math.random() * 25,
        targetOpacity: 0.5 + Math.random() * 0.3,
        zDepth: -40 - (Math.random() * 40) 
      };

      sprite.scale.set(0, 0, 1);
      orbitingNodes.push(sprite);
      solarSystemGroup.add(sprite);
    }

    solarSystemGroup.rotation.x = 0.4; 
    scene.add(solarSystemGroup);

    // --- Populate Free Wandering Asteroid Elements ---
    const asteroidCount = isMobile ? 2 : 4;
    for (let a = 0; a < asteroidCount; a++) {
      const mat = new THREE.SpriteMaterial({
        map: getAsteroidTexture(),
        transparent: true,
        opacity: 0.85,
        blending: THREE.NormalBlending
      });
      const asteroid = new THREE.Sprite(mat);
      
      asteroid.userData = {
        radiusX: isMobile ? 80 + Math.random() * 50 : 100 + Math.random() * 120,
        radiusY: isMobile ? 60 + Math.random() * 40 : 70 + Math.random() * 90,
        angle: Math.random() * Math.PI * 2,
        speed: 0.00006 + Math.random() * 0.0001, 
        zDepth: (Math.random() - 0.5) * 30,
        scale: isMobile ? 10 + Math.random() * 5 : 14 + Math.random() * 10
      };
      
      asteroid.scale.set(asteroid.userData.scale, asteroid.userData.scale, 1);
      wanderingAsteroidGroup.add(asteroid);
    }

    // --- Satellite Initialization (Always Bounded in Viewport) ---
    const satelliteMat = new THREE.SpriteMaterial({
      map: getSatelliteTexture(),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const satelliteMesh = new THREE.Sprite(satelliteMat);
    satelliteMesh.scale.set(isMobile ? 20 : 28, isMobile ? 20 : 28, 1);
    scene.add(satelliteMesh);

    // --- Animation & Execution Loop ---
    const animate = (time) => {
      frameId.current = requestAnimationFrame(animate);
      
      scrollY.current += (targetScrollY.current - scrollY.current) * 0.05;
      mouse.current.x += (targetMouse.current.x - mouse.current.x) * 0.04;
      mouse.current.y += (targetMouse.current.y - mouse.current.y) * 0.04;

      solarSystemGroup.rotation.y = mouse.current.x * 0.04;
      solarSystemGroup.rotation.x = 0.4 - (mouse.current.y * 0.03);
      
      wanderingAsteroidGroup.position.copy(solarSystemGroup.position);
      wanderingAsteroidGroup.rotation.copy(solarSystemGroup.rotation);

      solarSystemGroup.position.y = scrollY.current * (isMobile ? 0.04 : 0.06);
      starField.position.y = scrollY.current * (isMobile ? 0.015 : 0.025);
      starField.rotation.y = time * 0.000005;

      // Satellite Trajectory Bounds
      const satAngle = time * 0.0002;
      const xBound = isMobile ? 70 : 140;
      const yBound = isMobile ? 50 : 100;
      satelliteMesh.position.x = Math.sin(satAngle) * xBound; 
      satelliteMesh.position.y = Math.cos(satAngle * 0.5) * yBound + 10; 
      satelliteMesh.position.z = Math.cos(satAngle) * 20 + 60; 

      // --- Every 6 Seconds: Satellite Tactical Targeting Systems ---
      if (time - lastLaserTime.current > 6000) {
        lastLaserTime.current = time;

        const targets = wanderingAsteroidGroup.children;
        const visibleAsteroids = targets.filter(ast => ast.position.z >= -15);

        if (visibleAsteroids.length > 0) {
          const chosenAsteroid = visibleAsteroids[Math.floor(Math.random() * visibleAsteroids.length)];
          const unrevealedNodes = orbitingNodes.filter(n => !n.userData.isPlanet && !n.userData.isAddedToMorphedStars);
          const assignedNode = unrevealedNodes.length > 0 
            ? unrevealedNodes[Math.floor(Math.random() * unrevealedNodes.length)] 
            : null;

          const points = [
            new THREE.Vector3().copy(satelliteMesh.position),
            new THREE.Vector3()
          ];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({ 
            color: 0x00f0ff, 
            linewidth: 4,
            blending: THREE.AdditiveBlending 
          });
          const laserLine = new THREE.Line(lineGeo, lineMat);
          scene.add(laserLine);

          activeLaser.current = {
            mesh: laserLine,
            target: chosenAsteroid,
            nodeToReveal: assignedNode,
            spawnTime: time,
            duration: 350
          };
        }
      }

      // Live Laser Ray Matrix
      if (activeLaser.current) {
        const { mesh, target, nodeToReveal, spawnTime, duration } = activeLaser.current;
        const elapsed = time - spawnTime;

        if (elapsed < duration) {
          const positions = mesh.geometry.attributes.position.array;
          
          positions[0] = satelliteMesh.position.x;
          positions[1] = satelliteMesh.position.y;
          positions[2] = satelliteMesh.position.z;

          const asteroidWorldPos = new THREE.Vector3();
          target.getWorldPosition(asteroidWorldPos);
          positions[3] = asteroidWorldPos.x;
          positions[4] = asteroidWorldPos.y;
          positions[5] = asteroidWorldPos.z;
          
          mesh.geometry.attributes.position.needsUpdate = true;
          mesh.material.color.setHex(Math.random() > 0.4 ? 0xffffff : 0x00ffaa);
        } else {
          scene.remove(mesh);
          mesh.geometry.dispose();
          mesh.material.dispose();

          // Trigger Explode -> Reveal Icon -> Morph to Star Sequence
          if (nodeToReveal) {
            nodeToReveal.userData.isAddedToMorphedStars = true;

            const hitWorldPos = new THREE.Vector3();
            target.getWorldPosition(hitWorldPos);
            solarSystemGroup.worldToLocal(hitWorldPos);
            
            nodeToReveal.position.copy(hitWorldPos);
            nodeToReveal.material.map = nodeToReveal.userData.ringTexture;
            nodeToReveal.userData.isRevealed = true;
            nodeToReveal.material.needsUpdate = true;
            
            setTimeout(() => {
              const currentX = nodeToReveal.position.x;
              const currentY = nodeToReveal.position.y;
              
              const dynamicAngle = Math.atan2(currentX, currentY);
              const dynamicRadiusX = currentX / Math.sin(dynamicAngle);
              const dynamicRadiusY = currentY / Math.cos(dynamicAngle);

              nodeToReveal.userData.angle = dynamicAngle - (performance.now() * nodeToReveal.userData.speed);
              nodeToReveal.userData.radiusX = Math.abs(dynamicRadiusX) || nodeToReveal.userData.radiusX;
              nodeToReveal.userData.radiusY = Math.abs(dynamicRadiusY) || nodeToReveal.userData.radiusY;

              nodeToReveal.material.map = nodeToReveal.userData.starTexture;
              nodeToReveal.userData.isRevealed = false; 
              nodeToReveal.userData.isAddedToMorphedStars = false; 
              nodeToReveal.material.needsUpdate = true;
            }, 2500);
          }

          // Give it completely fresh orbital dimensions immediately
          target.userData.radiusX = isMobile ? 90 + Math.random() * 60 : 120 + Math.random() * 140;
          target.userData.radiusY = isMobile ? 70 + Math.random() * 50 : 80 + Math.random() * 100;
          
          // Assign a completely random speed so it doesn't match the old one
          target.userData.speed = 0.00008 + Math.random() * 0.00012;
          target.userData.scale = isMobile ? 10 + Math.random() * 5 : 14 + Math.random() * 10;
          target.scale.set(target.userData.scale, target.userData.scale, 1);

          // Force the starting angle to the exact opposite side of the screen 
          // or slightly off-screen so it instantly spawns as a new incoming threat
          target.userData.angle = Math.random() * Math.PI * 2;
          
          // Update its position variables instantly for the current frame
          target.position.x = Math.cos(target.userData.angle) * target.userData.radiusX;
          target.position.y = Math.sin(target.userData.angle) * target.userData.radiusY;

          activeLaser.current = null;
        }
      }

      // --- Raycaster Hit Detection (Desktop Hover) ---
      if (!isMobile) {
        raycaster.current.setFromCamera(ndcMouse.current, camera);
        const intersects = raycaster.current.intersectObjects(solarSystemGroup.children);
        const iconIntersects = intersects.filter(hit => !hit.object.userData.isPlanet);

        if (iconIntersects.length > 0) {
          const hitSprite = iconIntersects[0].object;
          
          if (hoveredSprite.current !== hitSprite) {
            if (hoveredSprite.current && !hoveredSprite.current.userData.isAddedToMorphedStars) {
              hoveredSprite.current.material.map = hoveredSprite.current.userData.starTexture;
              hoveredSprite.current.userData.isRevealed = false;
            }
            hoveredSprite.current = hitSprite;
            hitSprite.material.map = hitSprite.userData.ringTexture;
            hitSprite.userData.isRevealed = true;
            document.body.style.cursor = 'pointer';
          }
        } else if (hoveredSprite.current) {
          if (!hoveredSprite.current.userData.isAddedToMorphedStars) {
            hoveredSprite.current.material.map = hoveredSprite.current.userData.starTexture;
            hoveredSprite.current.userData.isRevealed = false;
          }
          hoveredSprite.current = null;
          document.body.style.cursor = 'default';
        }
      }

      // --- Update Orbiting System Elements (Stars & Planets) ---
      orbitingNodes.forEach((node) => {
        const data = node.userData;
        
        if (!data.isAddedToMorphedStars) {
          const activeAngle = data.angle + (time * data.speed);
          node.position.x = Math.sin(activeAngle) * data.radiusX;
          node.position.y = Math.cos(activeAngle) * data.radiusY;
          node.position.z = Math.sin(activeAngle * 0.5) * 10 + data.zDepth;
        }

        if (node.material.opacity < data.targetOpacity) {
          node.material.opacity += 0.02;
        }

        const currentTargetScale = data.isRevealed ? data.scaleHover : data.scaleNormal;
        const scaleStep = (currentTargetScale - node.scale.x) * 0.1;
        node.scale.set(node.scale.x + scaleStep, node.scale.y + scaleStep, 1);
      });

      wanderingAsteroidGroup.children.forEach((asteroid) => {
        const data = asteroid.userData;
        data.angle += data.speed; 
        
        asteroid.position.x = Math.cos(data.angle) * data.radiusX;
        asteroid.position.y = Math.sin(data.angle) * data.radiusY;
        asteroid.position.z = data.zDepth;
      });

      renderer.render(scene, camera);
    };

    // --- Input Processing Listeners ---
    const handleInput = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      
      targetMouse.current.x = (x / windowDims.current.width) * 2 - 1;
      targetMouse.current.y = -(y / windowDims.current.height) * 2 + 1;

      ndcMouse.current.x = targetMouse.current.x;
      ndcMouse.current.y = targetMouse.current.y;
    };

    const handleScroll = () => {
      targetScrollY.current = window.pageYOffset || window.scrollY;
    };

    const handleResize = () => {
      const widthDiff = Math.abs(window.innerWidth - windowDims.current.width);
      const heightDiff = Math.abs(window.innerHeight - windowDims.current.height);
      
      if (widthDiff > 25 || (heightDiff > 130 && !isMobile)) {
        windowDims.current.width = window.innerWidth;
        windowDims.current.height = window.innerHeight;
        
        camera.aspect = windowDims.current.width / windowDims.current.height;
        camera.updateProjectionMatrix();
        renderer.setSize(windowDims.current.width, windowDims.current.height);
      }
    };

    window.addEventListener('mousemove', handleInput);
    window.addEventListener('touchmove', handleInput, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    animate(0);

    return () => {
      window.removeEventListener('mousemove', handleInput);
      window.removeEventListener('touchmove', handleInput);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId.current);
      renderer.dispose();
      scene.clear();
      document.body.style.cursor = 'default';
    };
  }, [orbitData, isMobile]);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none bg-[#252429]"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #0c0817 0%, #020105 100%)',
        height: '100vh',
        width: '100vw'
      }}
    />
  );
};

export default NetworkBackground;
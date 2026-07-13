import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

        // ========================================================
        // 1. THREE.JS: THE EXFOLIATION ENGINE
        // ========================================================
        const container = document.getElementById('webgl-container');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const waferMaterial = new THREE.MeshStandardMaterial({
            color: 0x050810,
            metalness: 0.9,
            roughness: 0.1,
            side: THREE.DoubleSide
        });

        const glowingEdgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00FFFF, 
            transparent: true, 
            opacity: 0.5 
        });

        const waferGeometry = new THREE.CylinderGeometry(5, 5, 0.2, 64);
        const edgeGeometry = new THREE.EdgesGeometry(waferGeometry);
        
        const waferGroup = new THREE.Group();
        const wafers = [];
        const numWafers = 10; 

        for (let i = 0; i < numWafers; i++) {
            const mesh = new THREE.Mesh(waferGeometry, waferMaterial);
            const edges = new THREE.LineSegments(edgeGeometry, glowingEdgeMaterial);
            mesh.add(edges);
            mesh.position.y = (i - numWafers/2) * 0.21; 
            wafers.push(mesh);
            waferGroup.add(mesh);
        }

        scene.add(waferGroup);
        waferGroup.rotation.x = Math.PI / 4; 

        const beamGeometry = new THREE.CylinderGeometry(0.2, 0.2, 40, 16);
        const beamMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF, 
            transparent: true, 
            opacity: 0, 
            blending: THREE.AdditiveBlending 
        });
        const particleBeam = new THREE.Mesh(beamGeometry, beamMaterial);
        particleBeam.position.y = 20; 
        scene.add(particleBeam);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const spotLight = new THREE.SpotLight(0x00FFFF, 5);
        spotLight.position.set(10, 20, 10);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        scene.add(spotLight);

        // Responsive Camera Distance
        function updateCameraZ() {
            if(window.innerWidth < 768) {
                camera.position.set(0, 0, 35); // Pull camera back further on mobile
            } else {
                camera.position.set(0, 0, 25);
            }
        }
        updateCameraZ();

        function animate() {
            requestAnimationFrame(animate);
            waferGroup.rotation.y += 0.002;
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            updateCameraZ();
        });

        // ========================================================
        // 2. GSAP: THE SCROLL NARRATIVE TIMELINE
        // ========================================================
        
        const sysPhase = document.getElementById('sys-phase');
        const beamEnergy = document.getElementById('beam-energy');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
                onUpdate: (self) => {
                    beamEnergy.innerText = (self.progress * 14.5).toFixed(1) + " TeV";
                    const navHome = document.getElementById('nav-home');
                    if (navHome) {
                        navHome.style.display = self.progress > 0.02 ? 'inline-block' : 'none';
                    }
                }
            }
        });

        function swapUI(outId, inId, phaseText, navId, prevPhaseText, prevNavId) {
            tl.to(outId, { opacity: 0, y: -50, duration: 1, ease: "power2.in" })
              .set(outId, { className: "data-section" })
              .set(inId, { className: "data-section active" })
              .to(inId, { opacity: 1, y: 0, duration: 1, ease: "power2.out", 
                  onStart: () => {
                      sysPhase.innerText = phaseText;
                      document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('nav-active'));
                      if (navId) {
                          const activeLink = document.getElementById(navId);
                          if (activeLink) activeLink.classList.add('nav-active');
                      }
                  },
                  onReverseComplete: () => {
                      sysPhase.innerText = prevPhaseText;
                      document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('nav-active'));
                      if (prevNavId) {
                          const activeLink = document.getElementById(prevNavId);
                          if (activeLink) activeLink.classList.add('nav-active');
                      }
                  }
              }, "-=0.5");
        }

        // Use variables for 3D positioning so we can adjust for mobile screens dynamically
        const isMobile = window.innerWidth < 768;
        const crystalShiftX = isMobile ? 0 : 5; // Don't shift crystal left/right on mobile, keep it center behind the glass panel

        // PHASE 1: Hero -> Crisis
        tl.to(waferGroup.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 3, ease: "power1.inOut" }, 0)
          .to(waferGroup.position, { x: crystalShiftX, duration: 3, ease: "power1.inOut" }, 0); 
        swapUI("#sec-hero", "#sec-crisis", "ANALYZING BULK CRYSTAL", "nav-products", "AWAITING SEQUENCE", "nav-home");

        // PHASE 2: Crisis -> Tech
        tl.to(waferGroup.position, { x: -crystalShiftX, duration: 3, ease: "power1.inOut" }, "+=1") 
          .to(particleBeam.material, { opacity: 0.8, duration: 0.5 }, "-=2") 
          .to(particleBeam.position, { y: 0, duration: 1.5, ease: "power4.in" }, "-=1.5") 
          .to(spotLight, { intensity: 50, duration: 0.5, yoyo: true, repeat: 1 }, "-=0.5") 
          .to(particleBeam.material, { opacity: 0, duration: 0.5 }); 
        swapUI("#sec-crisis", "#sec-tech", "ION-IMPLANTATION ACTIVE", "nav-tech", "ANALYZING BULK CRYSTAL", "nav-products");

        // PHASE 3: Tech -> Yield
        tl.to(waferGroup.position, { x: isMobile ? 0 : 4, duration: 3, ease: "power2.inOut" }, "+=1")
          .to(waferGroup.rotation, { x: 0, duration: 3, ease: "power2.inOut" }, "-=3"); 
        
        wafers.forEach((wafer, i) => {
            const spreadDistance = (i - numWafers/2) * 2.5; 
            tl.to(wafer.position, { y: spreadDistance, duration: 3, ease: "back.out(1.5)" }, "-=3");
        });
        swapUI("#sec-tech", "#sec-yield", "EXFOLIATION COMPLETE : 10X MULTIPLIER", "nav-tech", "ION-IMPLANTATION ACTIVE", "nav-tech");

        // PHASE 4: Yield -> Apps
        tl.to(waferGroup.position, { x: isMobile ? 0 : -8, z: 15, duration: 4, ease: "power1.inOut" }, "+=1") 
          .to(waferGroup.rotation, { x: Math.PI / 2, y: Math.PI / 8, duration: 4, ease: "power1.inOut" }, "-=4"); 
        swapUI("#sec-yield", "#sec-apps", "DEPLOYING TO FOUNDRY", "nav-apps", "EXFOLIATION COMPLETE : 10X MULTIPLIER", "nav-tech");

        // PHASE 5: Apps -> Team
        tl.to(waferGroup.position, { x: 0, y: 0, z: -15, duration: 4, ease: "power2.inOut" }, "+=1")
          .to(waferGroup.rotation, { x: Math.PI / 2, y: 0, z: Math.PI / 2, duration: 4, ease: "power2.inOut" }, "-=4");
        
        wafers.forEach((wafer, i) => {
            const rackDistance = (i - numWafers/2) * 1.5; 
            tl.to(wafer.position, { y: rackDistance, duration: 3, ease: "power2.inOut" }, "-=4");
        });
        
        swapUI("#sec-apps", "#sec-team", "ACCESSING LEADERSHIP NODE", "nav-partners", "DEPLOYING TO FOUNDRY", "nav-apps");

        tl.to({}, { duration: 2 });

        // ========================================================
        // 3. NAVIGATION HANDLERS
        // ========================================================
        
        function goHome(e) {
            if(e) e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        document.getElementById('nav-brand').addEventListener('click', goHome);
        document.getElementById('nav-home').addEventListener('click', goHome);

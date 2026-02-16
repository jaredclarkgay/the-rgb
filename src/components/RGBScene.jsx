import { useEffect, useRef } from "react";
import * as THREE from "three";
import { NPCS, NPC_IDS } from "../systems/npcs";

const ROOM = { w: 18, h: 3.6, d: 24 };
const BLDG_H = 15;
const MOVE_SPD = 0.08;
const LOOK_SPD = 0.004;

export default function RGBScene({ containerRef, onNPCClick, onNPCHover }) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const npcGroupsRef = useRef({});
  const keysRef = useRef({});
  const yawRef = useRef(Math.PI);
  const pitchRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, moved: false });
  const raycaster = useRef(new THREE.Raycaster());
  const mouseVec = useRef(new THREE.Vector2());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera
    const camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 200);
    camera.position.set(0, 1.6, ROOM.d / 2 - 2.5);
    cameraRef.current = camera;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0xc8dbe6, 40, 120);
    sceneRef.current = scene;

    // ── Lighting ──
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.4);
    sun.position.set(15, 20, -10); scene.add(sun);
    const fill = new THREE.DirectionalLight(0x8ec8f0, 0.4);
    fill.position.set(-10, 10, 5); scene.add(fill);
    scene.add(new THREE.AmbientLight(0xd4e4f0, 0.5));
    scene.add(new THREE.HemisphereLight(0xfff8f0, 0x445566, 0.3));

    // ── Helper ──
    const mt = (c, r = 0.8, me = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: me });
    const addMesh = (geo, mat, pos, rot) => {
      const m = new THREE.Mesh(geo, mat);
      if (pos) m.position.set(...pos);
      if (rot) m.rotation.set(...rot);
      scene.add(m);
      return m;
    };

    const conc = mt(0xd4cdc4, 0.85);
    const steel = mt(0x6a6a72, 0.3, 0.85);
    const dkSteel = mt(0x3a3a42, 0.35, 0.8);
    const wood = mt(0x8B6914, 0.7);
    const woodDk = mt(0x5C4010, 0.75);
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xc8e8f8, transparent: true, opacity: 0.15, roughness: 0.05, clearcoat: 1 });
    const ww = mt(0xf5f0e8, 0.9);
    const fab = mt(0x6b7b6a, 0.95);

    // ── Floor + Ceiling ──
    addMesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), conc, [0, 0, 0], [-Math.PI / 2, 0, 0]);
    addMesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), mt(0xe8e2da, 0.9), [0, ROOM.h, 0], [Math.PI / 2, 0, 0]);

    // Beams
    for (let z = -ROOM.d / 2 + 2; z <= ROOM.d / 2 - 2; z += 4)
      addMesh(new THREE.BoxGeometry(ROOM.w, 0.15, 0.3), steel, [0, ROOM.h - 0.08, z]);

    // Columns
    for (let x = -ROOM.w / 2 + 3; x <= ROOM.w / 2 - 3; x += 6)
      for (let z = -ROOM.d / 2 + 2; z <= ROOM.d / 2 - 2; z += 8)
        addMesh(new THREE.BoxGeometry(0.35, ROOM.h, 0.35), steel, [x, ROOM.h / 2, z]);

    // ── Glass walls ──
    [-1, 1].forEach(s => {
      const g = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.d, ROOM.h - 0.6), glass);
      g.rotation.y = (s * -Math.PI) / 2;
      g.position.set((s * ROOM.w) / 2, ROOM.h / 2 + 0.1, 0);
      scene.add(g);
      for (let z = -ROOM.d / 2; z <= ROOM.d / 2; z += 3)
        addMesh(new THREE.BoxGeometry(0.06, ROOM.h, 0.06), dkSteel, [(s * ROOM.w) / 2, ROOM.h / 2, z]);
      addMesh(new THREE.BoxGeometry(0.06, 0.06, ROOM.d), dkSteel, [(s * ROOM.w) / 2, ROOM.h * 0.55, 0]);
      addMesh(new THREE.BoxGeometry(0.25, 0.3, ROOM.d), conc, [s * (ROOM.w / 2 - 0.05), 0.15, 0]);
    });

    // ── Solid walls ──
    addMesh(new THREE.PlaneGeometry(ROOM.w, ROOM.h), ww, [0, ROOM.h / 2, -ROOM.d / 2]);
    addMesh(new THREE.PlaneGeometry(8, 2.4), glass, [0, 1.8, -ROOM.d / 2 + 0.02]);

    [-(ROOM.w / 4 + 0.75), ROOM.w / 4 + 0.75].forEach(x => {
      const fw = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w / 2 - 1.5, ROOM.h), ww);
      fw.rotation.y = Math.PI; fw.position.set(x, ROOM.h / 2, ROOM.d / 2); scene.add(fw);
    });
    const fwt = new THREE.Mesh(new THREE.PlaneGeometry(3, ROOM.h - 2.8), ww);
    fwt.rotation.y = Math.PI; fwt.position.set(0, ROOM.h - 0.4, ROOM.d / 2); scene.add(fwt);

    // ── Elevator ──
    const eM = mt(0x888890, 0.15, 0.9); const dM = mt(0x9a9aa2, 0.12, 0.92);
    [-1, 1].forEach(s => {
      addMesh(new THREE.BoxGeometry(0.12, 2.8, 0.12), eM, [s * 1.5, 1.4, ROOM.d / 2 - 0.06]);
      addMesh(new THREE.BoxGeometry(1.3, 2.7, 0.05), dM, [s * 0.72, 1.35, ROOM.d / 2 - 0.08]);
    });
    addMesh(new THREE.BoxGeometry(3.12, 0.12, 0.12), eM, [0, 2.8, ROOM.d / 2 - 0.06]);

    // ── Tables ──
    [[-4,-5],[-4,-9],[-1.5,-6],[1.5,-5],[4,-6],[4,-10],[-1.5,-10],[1.5,-9.5],[0,-3.5]].forEach(([x, z], i) => {
      const isR = i % 3 === 0;
      if (isR) addMesh(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 16), wood, [x, 0.74, z]);
      else addMesh(new THREE.BoxGeometry(0.9, 0.05, 0.7), wood, [x, 0.74, z]);
      addMesh(new THREE.CylinderGeometry(0.04, 0.06, 0.72, 8), dkSteel, [x, 0.36, z]);
      const cc = isR ? 2 : (i % 2 === 0 ? 4 : 2);
      for (let c = 0; c < cc; c++) {
        const a = (c / cc) * Math.PI * 2 + i * 0.5;
        addMesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), fab, [x + Math.cos(a) * 0.85, 0.46, z + Math.sin(a) * 0.85]);
      }
    });

    // ── Bar ──
    addMesh(new THREE.BoxGeometry(1.2, 1.05, 6), woodDk, [ROOM.w / 2 - 2, 0.525, -7]);
    addMesh(new THREE.BoxGeometry(1.4, 0.06, 6.2), wood, [ROOM.w / 2 - 2, 1.08, -7]);

    // ── Plants ──
    [[-ROOM.w / 2 + 1, -3], [ROOM.w / 2 - 1, -1], [-2, -ROOM.d / 2 + 1], [2, -ROOM.d / 2 + 1]].forEach(([x, z]) => {
      addMesh(new THREE.CylinderGeometry(0.2, 0.15, 0.4, 10), mt(0xb86b4a, 0.85), [x, 0.2, z]);
      for (let i = 0; i < 3; i++) {
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 8, 6), mt(0x3a6b3a, 0.9));
        l.position.set(x + (Math.random() - 0.5) * 0.2, 0.55 + Math.random() * 0.25, z + (Math.random() - 0.5) * 0.2);
        scene.add(l);
      }
    });

    // ── Exterior ──
    addMesh(new THREE.PlaneGeometry(300, 300), mt(0x6a8a5a, 1), [0, -BLDG_H, 0], [-Math.PI / 2, 0, 0]);
    [-20, 0, 25].forEach(o => addMesh(new THREE.PlaneGeometry(8, 300), mt(0x555560, 0.9), [o, -BLDG_H + 0.01, 0], [-Math.PI / 2, 0, 0]));
    const bMats = [0xb8b0a8, 0xa0a8b0, 0xc0b8a0].map(c => mt(c));
    [[-25,-30,10,8,12],[-30,-10,8,14,9],[20,-25,9,10,14],[25,5,14,6,8],[18,20,10,8,11],[-15,-45,6,20,8]].forEach(([x, z, bw, bh, bd], i) => {
      addMesh(new THREE.BoxGeometry(bw, bh, bd), bMats[i % 3], [x, -BLDG_H + bh / 2, z]);
    });
    addMesh(new THREE.BoxGeometry(ROOM.w + 2, BLDG_H, ROOM.d + 2), mt(0xc8c0b8, 0.6, 0.2), [0, -BLDG_H / 2, 0]);

    // ── Lights ──
    [[-1.5, -6], [1.5, -5], [0, -3.5]].forEach(([x, z]) => {
      const pl = new THREE.PointLight(0xffe0a0, 0.3, 4); pl.position.set(x, ROOM.h - 1.4, z); scene.add(pl);
    });
    for (let z = -9; z <= -5; z += 2) {
      const pl = new THREE.PointLight(0xffd080, 0.3, 4); pl.position.set(ROOM.w / 2 - 2, ROOM.h - 1.7, z); scene.add(pl);
    }

    // ── NPCs ──
    NPC_IDS.forEach(id => {
      const npc = NPCS[id];
      const [px, , pz] = npc.pos;
      const g = new THREE.Group();
      g.position.set(px, 0, pz);

      // Invisible hitbox for clicking
      const hitbox = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 2.2, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitbox.position.y = 1.1;
      hitbox.userData = { npcId: id };
      g.add(hitbox);

      // Body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.2, 8), mt(npc.body, 0.8));
      body.position.y = 0.9;
      body.userData = { npcId: id };
      g.add(body);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mt(npc.skin, 0.7));
      head.position.y = 1.62;
      head.userData = { npcId: id };
      g.add(head);

      // Label
      const lc = document.createElement("canvas");
      lc.width = 256; lc.height = 56;
      const ctx = lc.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.beginPath(); ctx.roundRect(8, 4, 240, 48, 10); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(8, 4, 240, 48, 10); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "bold 24px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(npc.name, 128, 36);
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 0.28),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc), transparent: true, depthTest: false })
      );
      label.position.y = 2.05;
      g.add(label);

      scene.add(g);
      npcGroupsRef.current[id] = g;
    });

    // ── Animation loop ──
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);

      // Billboard labels toward camera
      NPC_IDS.forEach(id => {
        const g = npcGroupsRef.current[id];
        const lbl = g?.children[3];
        if (lbl) lbl.lookAt(camera.position);
      });

      // Movement
      const euler = new THREE.Euler(0, yawRef.current, 0, "YXZ");
      const fwd = new THREE.Vector3(0, 0, -1).applyEuler(euler);
      const right = new THREE.Vector3(1, 0, 0).applyEuler(euler);
      const mv = new THREE.Vector3();
      const K = keysRef.current;
      if (K["KeyW"] || K["ArrowUp"]) mv.add(fwd);
      if (K["KeyS"] || K["ArrowDown"]) mv.sub(fwd);
      if (K["KeyD"] || K["ArrowRight"]) mv.add(right);
      if (K["KeyA"] || K["ArrowLeft"]) mv.sub(right);
      if (mv.length() > 0) { mv.normalize().multiplyScalar(MOVE_SPD); camera.position.add(mv); }
      camera.position.x = Math.max(-ROOM.w / 2 + 0.5, Math.min(ROOM.w / 2 - 0.5, camera.position.x));
      camera.position.z = Math.max(-ROOM.d / 2 + 0.5, Math.min(ROOM.d / 2 - 0.5, camera.position.z));
      camera.position.y = 1.6;
      camera.quaternion.setFromEuler(new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ"));

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──
    const onResize = () => {
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    // ── Mouse: drag to look, click NPCs ──
    const el = renderer.domElement;

    const onPointerDown = (e) => {
      dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, moved: false };
    };
    const onPointerMoveGlobal = (e) => {
      const dr = dragRef.current;
      if (!dr.active) return;
      const dx = e.clientX - dr.startX, dy = e.clientY - dr.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dr.moved = true;
      if (dr.moved) {
        yawRef.current += (e.clientX - dr.startX) * LOOK_SPD;
        pitchRef.current += (e.clientY - dr.startY) * LOOK_SPD;
        pitchRef.current = Math.max(-1.2, Math.min(1.2, pitchRef.current));
        dr.startX = e.clientX; dr.startY = e.clientY;
      }
    };
    const onPointerUpGlobal = (e) => {
      const dr = dragRef.current;
      if (!dr.moved && dr.active) {
        // It was a click, not a drag — raycast for NPCs
        const rect = el.getBoundingClientRect();
        mouseVec.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.current.setFromCamera(mouseVec.current, camera);
        const allMeshes = [];
        NPC_IDS.forEach(id => {
          npcGroupsRef.current[id]?.traverse(child => { if (child.isMesh) allMeshes.push(child); });
        });
        const hits = raycaster.current.intersectObjects(allMeshes, false);
        if (hits.length > 0 && hits[0].object.userData.npcId) {
          onNPCClick(hits[0].object.userData.npcId);
        }
      }
      dragRef.current = { active: false, startX: 0, startY: 0, moved: false };
    };

    const onMouseMoveHover = (e) => {
      if (dragRef.current.active) { onNPCHover(null); return; }
      const rect = el.getBoundingClientRect();
      mouseVec.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouseVec.current, camera);
      const allMeshes = [];
      NPC_IDS.forEach(id => {
        npcGroupsRef.current[id]?.traverse(child => { if (child.isMesh) allMeshes.push(child); });
      });
      const hits = raycaster.current.intersectObjects(allMeshes, false);
      const hId = hits.length > 0 ? hits[0].object.userData.npcId : null;
      onNPCHover(hId);
      el.style.cursor = hId ? "pointer" : (dragRef.current.active ? "grabbing" : "grab");
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMoveGlobal);
    window.addEventListener("pointerup", onPointerUpGlobal);
    el.addEventListener("mousemove", onMouseMoveHover);

    // Keyboard
    const onKD = (e) => { keysRef.current[e.code] = true; };
    const onKU = (e) => { keysRef.current[e.code] = false; };
    window.addEventListener("keydown", onKD);
    window.addEventListener("keyup", onKU);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMoveGlobal);
      window.removeEventListener("pointerup", onPointerUpGlobal);
      el.removeEventListener("mousemove", onMouseMoveHover);
      window.removeEventListener("keydown", onKD);
      window.removeEventListener("keyup", onKU);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [containerRef, onNPCClick, onNPCHover]);

  return null;
}

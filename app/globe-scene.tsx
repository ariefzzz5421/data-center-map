"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import type { DataCenter } from "./data-centers";

type Props = { data: DataCenter[]; selected: DataCenter; onSelect: (dc: DataCenter) => void };
export type GlobeSceneHandle = { zoomIn: () => void; zoomOut: () => void; reset: () => void };
type SceneApi = {
  focus: (dc: DataCenter) => void;
  update: (d: DataCenter[]) => void;
  zoom: (amount: number) => void;
  reset: () => void;
};

const GLOBE_RADIUS = 2;

function positionFromLatLng(lat: number, lng: number, radius = GLOBE_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

const GlobeScene = forwardRef<GlobeSceneHandle, Props>(function GlobeScene({ data, selected, onSelect }, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SceneApi | null>(null);
  const initialDataRef = useRef(data);
  const callbackRef = useRef(onSelect);
  callbackRef.current = onSelect;

  useImperativeHandle(ref, () => ({
    zoomIn: () => apiRef.current?.zoom(-0.85),
    zoomOut: () => apiRef.current?.zoom(0.85),
    reset: () => apiRef.current?.reset(),
  }), []);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.25, 8.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = -0.08;
    scene.add(globeGroup);

    const texture = new THREE.TextureLoader().load("/earth-blue-marble.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96),
      new THREE.MeshPhongMaterial({ map: texture, color: 0x7b8a80, shininess: 8, specular: 0x293f44, emissive: 0x06100e, emissiveIntensity: 0.75 })
    );
    globeGroup.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 96, 96),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { glowColor: { value: new THREE.Color(0x8dffd2) } },
        vertexShader: `varying vec3 vNormal; varying vec3 vPositionNormal; void main(){ vNormal=normalize(normalMatrix*normal); vPositionNormal=normalize((modelViewMatrix*vec4(position,1.0)).xyz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 glowColor; varying vec3 vNormal; varying vec3 vPositionNormal; void main(){ float intensity=pow(0.72-dot(vNormal,vPositionNormal),3.0); gl_FragColor=vec4(glowColor,intensity*0.48); }`,
      })
    );
    globeGroup.add(atmosphere);

    scene.add(new THREE.AmbientLight(0x7aa69b, 0.42));
    const keyLight = new THREE.DirectionalLight(0xeafff4, 2.8);
    keyLight.position.set(-3, 3, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x5c9dff, 1.2);
    rimLight.position.set(4, -1, -4);
    scene.add(rimLight);

    const starsGeometry = new THREE.BufferGeometry();
    const starPositions: number[] = [];
    for (let i = 0; i < 850; i++) {
      const r = 14 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    }
    starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xb6d1c9, size: 0.018, transparent: true, opacity: 0.62, sizeAttenuation: true }));
    scene.add(stars);

    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);
    let markerMeshes: THREE.Mesh[] = [];
    const rebuildMarkers = (items: DataCenter[]) => {
      markerGroup.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      markerGroup.clear();
      markerMeshes = [];
      items.forEach((dc, index) => {
        const p = positionFromLatLng(dc.lat, dc.lng, GLOBE_RADIUS + 0.018 + (index % 3) * 0.004);
        const marker = new THREE.Group();
        marker.position.copy(p);
        marker.lookAt(p.clone().multiplyScalar(2));
        marker.userData.baseScale = THREE.MathUtils.clamp(Math.sqrt(dc.capacityMw / 1000), 0.62, 1.08);
        marker.scale.setScalar(marker.userData.baseScale);
        const color = dc.status === "Operational" ? 0xb6ffd4 : dc.status === "Building" ? 0xffc66d : 0xa8c8ff;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.105, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 }));
        stem.rotation.x = Math.PI / 2;
        stem.position.z = 0.049;
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 14), new THREE.MeshBasicMaterial({ color }));
        core.position.z = 0.106;
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.047, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.42, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
        ring.position.z = 0.108;
        const hitArea = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
        hitArea.position.z = 0.106;
        hitArea.userData.dc = dc;
        marker.add(stem, core, ring, hitArea);
        markerGroup.add(marker);
        markerMeshes.push(hitArea);
      });
    };
    rebuildMarkers(initialDataRef.current);

    let targetRotX = 0.16;
    let targetRotY = -1.15;
    let targetDistance = 7.6;
    let dragging = false;
    let moved = false;
    let previous = { x: 0, y: 0 };
    let autoRotate = true;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (event: PointerEvent) => {
      dragging = true; moved = false; autoRotate = false;
      previous = { x: event.clientX, y: event.clientY };
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      targetRotY += dx * 0.005;
      targetRotX += dy * 0.004;
      targetRotX = THREE.MathUtils.clamp(targetRotX, -1.1, 1.1);
      previous = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!moved) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(markerMeshes, false)[0];
        if (hit?.object.userData.dc) callbackRef.current(hit.object.userData.dc);
      }
      dragging = false;
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault(); autoRotate = false;
      targetDistance = THREE.MathUtils.clamp(targetDistance + event.deltaY * 0.0035, 2.55, 15.5);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    const focus = (dc: DataCenter) => {
      const theta = (dc.lng + 180) * Math.PI / 180;
      targetRotX = dc.lat * Math.PI / 180;
      targetRotY = Math.PI / 2 - theta;
      targetDistance = 4.35;
      autoRotate = false;
    };
    const zoom = (amount: number) => {
      targetDistance = THREE.MathUtils.clamp(targetDistance + amount, 2.55, 15.5);
      autoRotate = false;
    };
    const reset = () => {
      targetRotX = 0.16;
      targetRotY = -1.15;
      targetDistance = 7.6;
      autoRotate = true;
    };
    apiRef.current = { focus, update: rebuildMarkers, zoom, reset };

    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.03);
      if (autoRotate) targetRotY += delta * 0.035;
      globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.045;
      globeGroup.rotation.y += (targetRotY - globeGroup.rotation.y) * 0.045;
      camera.position.z += (targetDistance - camera.position.z) * 0.055;
      markerGroup.children.forEach((marker, i) => {
        const ring = (marker as THREE.Group).children[2] as THREE.Mesh;
        const pulse = 1 + Math.sin(clock.elapsedTime * 2.1 + i * 0.7) * 0.16;
        ring.scale.setScalar(pulse);
        const baseScale = (marker as THREE.Group).userData.baseScale as number;
        const distanceScale = THREE.MathUtils.clamp(camera.position.z / 7.6, 0.46, 1);
        (marker as THREE.Group).scale.setScalar(baseScale * distanceScale);
      });
      stars.rotation.y += delta * 0.0018;
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      const width = mount.clientWidth, height = mount.clientHeight;
      camera.aspect = width / height; camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize); observer.observe(mount);

    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      texture.dispose(); renderer.dispose(); mount.removeChild(renderer.domElement); apiRef.current = null;
    };
  }, []);

  useEffect(() => { apiRef.current?.update(data); }, [data]);
  useEffect(() => { apiRef.current?.focus(selected); }, [selected]);
  return <div className="globe-scene" ref={mountRef} aria-label="Interactive 3D globe showing major AI data center locations" />;
});

export default GlobeScene;

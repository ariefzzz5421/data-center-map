"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

export type SystemId = "grid" | "switchgear" | "rack" | "network" | "cooling" | "control";
export type ViewMode = "campus" | "hall" | "rack";
export type SceneLayers = { power: boolean; network: boolean; cooling: boolean };

export type DataCenterSceneHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  focus: (id: SystemId) => void;
  view: (mode: ViewMode) => void;
};

type DataCenterSceneProps = {
  selectedId: SystemId;
  active: boolean;
  exploded: boolean;
  layers: SceneLayers;
  onSelect: (id: SystemId) => void;
};

type FlowParticle = {
  mesh: THREE.Mesh;
  curve: THREE.Curve<THREE.Vector3>;
  offset: number;
  speed: number;
  kind: keyof SceneLayers;
};

type CameraController = {
  theta: number;
  phi: number;
  radius: number;
  target: THREE.Vector3;
  desiredTarget: THREE.Vector3;
  desiredRadius: number;
};

const FOCUS_POINTS: Record<SystemId, [number, number, number]> = {
  grid: [-9.1, 1.2, -1.8],
  switchgear: [-6.2, 1.3, 1.1],
  rack: [0, 1.45, -2.2],
  network: [2.3, 3.7, 0],
  cooling: [8.1, 1.3, 1.8],
  control: [6.8, 1.1, -5.2],
};

const VIEW_PRESETS: Record<ViewMode, { target: [number, number, number]; radius: number; theta: number; phi: number }> = {
  campus: { target: [0, .9, 0], radius: 25, theta: .72, phi: 1.02 },
  hall: { target: [0, 1.5, 0], radius: 16.5, theta: .72, phi: 1.14 },
  rack: { target: [0, 1.55, -2.2], radius: 8.2, theta: .12, phi: 1.28 },
};

const DataCenterScene = forwardRef<DataCenterSceneHandle, DataCenterSceneProps>(function DataCenterScene(
  { selectedId, active, exploded, layers, onSelect },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  const activeRef = useRef(active);
  const explodedRef = useRef(exploded);
  const layersRef = useRef(layers);
  const controllerRef = useRef<CameraController | null>(null);
  const sceneGroupsRef = useRef<Partial<Record<keyof SceneLayers, THREE.Group>>>({});

  onSelectRef.current = onSelect;
  selectedRef.current = selectedId;
  activeRef.current = active;
  explodedRef.current = exploded;
  layersRef.current = layers;

  useImperativeHandle(ref, () => ({
    zoomIn() {
      const controller = controllerRef.current;
      if (controller) controller.desiredRadius = Math.max(6.5, controller.desiredRadius * .8);
    },
    zoomOut() {
      const controller = controllerRef.current;
      if (controller) controller.desiredRadius = Math.min(30, controller.desiredRadius * 1.22);
    },
    reset() {
      const controller = controllerRef.current;
      if (!controller) return;
      const preset = VIEW_PRESETS.campus;
      controller.desiredTarget.set(...preset.target);
      controller.desiredRadius = preset.radius;
      controller.theta = preset.theta;
      controller.phi = preset.phi;
    },
    focus(id) {
      const controller = controllerRef.current;
      if (!controller) return;
      controller.desiredTarget.set(...FOCUS_POINTS[id]);
      controller.desiredRadius = id === "rack" ? 8.2 : 11.5;
    },
    view(mode) {
      const controller = controllerRef.current;
      if (!controller) return;
      const preset = VIEW_PRESETS[mode];
      controller.desiredTarget.set(...preset.target);
      controller.desiredRadius = preset.radius;
      controller.theta = preset.theta;
      controller.phi = preset.phi;
    },
  }), []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      mount.dataset.webgl = "failed";
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#030806");
    scene.fog = new THREE.FogExp2("#030806", .027);

    const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
    const initial = VIEW_PRESETS.campus;
    const controller: CameraController = {
      theta: initial.theta,
      phi: initial.phi,
      radius: initial.radius,
      target: new THREE.Vector3(...initial.target),
      desiredTarget: new THREE.Vector3(...initial.target),
      desiredRadius: initial.radius,
    };
    controllerRef.current = controller;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.45 : 1.8));
    renderer.domElement.setAttribute("aria-label", "Interactive three-dimensional AI data center cutaway");
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);

    const world = new THREE.Group();
    scene.add(world);

    const powerGroup = new THREE.Group();
    const networkGroup = new THREE.Group();
    const coolingGroup = new THREE.Group();
    sceneGroupsRef.current = { power: powerGroup, network: networkGroup, cooling: coolingGroup };
    world.add(powerGroup, networkGroup, coolingGroup);

    const mat = {
      floor: new THREE.MeshStandardMaterial({ color: "#07100d", roughness: .9, metalness: .08 }),
      slab: new THREE.MeshStandardMaterial({ color: "#0d1814", roughness: .72, metalness: .2 }),
      steel: new THREE.MeshStandardMaterial({ color: "#25362f", roughness: .42, metalness: .72 }),
      darkSteel: new THREE.MeshStandardMaterial({ color: "#101a17", roughness: .52, metalness: .64 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#83b9a2", transparent: true, opacity: .12, roughness: .15, metalness: .05, depthWrite: false }),
      amber: new THREE.MeshStandardMaterial({ color: "#ffb655", emissive: "#ff7a19", emissiveIntensity: 1.15, roughness: .35, metalness: .45 }),
      cyan: new THREE.MeshStandardMaterial({ color: "#65dfff", emissive: "#18a9d6", emissiveIntensity: 1.1, roughness: .28, metalness: .3 }),
      blue: new THREE.MeshStandardMaterial({ color: "#64a7ff", emissive: "#216ad1", emissiveIntensity: .8, roughness: .32, metalness: .28 }),
      warm: new THREE.MeshStandardMaterial({ color: "#ff7b55", emissive: "#a52a16", emissiveIntensity: .72, roughness: .35, metalness: .28 }),
      green: new THREE.MeshStandardMaterial({ color: "#b8ffd3", emissive: "#48d98b", emissiveIntensity: 1.25, roughness: .2, metalness: .18 }),
      red: new THREE.MeshStandardMaterial({ color: "#ff6f62", emissive: "#d73b30", emissiveIntensity: 1, roughness: .3 }),
      gpu: new THREE.MeshStandardMaterial({ color: "#496d5d", roughness: .34, metalness: .66 }),
      copper: new THREE.MeshStandardMaterial({ color: "#c8824b", roughness: .34, metalness: .68 }),
    };

    const box = (
      parent: THREE.Object3D,
      size: [number, number, number],
      position: [number, number, number],
      material: THREE.Material,
      system?: SystemId,
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...position);
      if (system) mesh.userData.system = system;
      parent.add(mesh);
      return mesh;
    };

    const cylinder = (
      parent: THREE.Object3D,
      radius: number,
      height: number,
      position: [number, number, number],
      material: THREE.Material,
      system?: SystemId,
    ) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 18), material);
      mesh.position.set(...position);
      if (system) mesh.userData.system = system;
      parent.add(mesh);
      return mesh;
    };

    // Facility map, access road, cutaway walls, and hot/cold aisle markings.
    box(world, [25, .28, 16], [0, -.18, 0], mat.floor);
    box(world, [19, .14, 12], [1, .02, 0], mat.slab);
    box(world, [25, .05, 1.05], [0, -.01, -7.25], mat.darkSteel);
    for (let x = -11; x <= 11; x += 2) box(world, [.9, .06, .16], [x, .04, -7.24], mat.green);
    box(world, [.16, 2.4, 12], [-8.6, 1.2, 0], mat.glass);
    box(world, [19.2, 2.4, .16], [1, 1.2, 5.95], mat.glass);
    [-3.65, -.15, 3.35].forEach((z, index) => {
      box(world, [12.4, .025, 1.2], [0, .05, z], index === 1 ? mat.blue : mat.warm);
    });

    const grid = new THREE.GridHelper(25, 25, "#2b5745", "#13251f");
    grid.position.y = .055;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = .34;
    world.add(grid);

    // Utility grid and transformer yard.
    const utility = new THREE.Group();
    utility.userData.system = "grid";
    world.add(utility);
    [-10.4, -8.9].forEach((x) => {
      box(utility, [.16, 4.5, .16], [x, 2.25, -3.2], mat.steel, "grid");
      box(utility, [2.1, .13, .13], [x + .3, 4.1, -3.2], mat.copper, "grid");
    });
    [-10.15, -9.1].forEach((x, i) => {
      const transformer = cylinder(utility, .72, 1.45, [x, .78, -.8 + i * 2], mat.darkSteel, "grid");
      transformer.rotation.z = Math.PI / 2;
      for (let y = .38; y < 1.25; y += .26) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.42, .045, 8, 22), mat.copper);
        ring.position.set(x, y, -.8 + i * 2);
        ring.rotation.y = Math.PI / 2;
        ring.userData.system = "grid";
        utility.add(ring);
      }
    });

    // Switchgear, batteries, and UPS chain.
    const switchgear = new THREE.Group();
    switchgear.userData.system = "switchgear";
    world.add(switchgear);
    for (let z = -3.2; z <= 3.2; z += 1.1) {
      const cabinet = box(switchgear, [.9, 2.35, .82], [-6.55, 1.18, z], mat.steel, "switchgear");
      box(cabinet, [.55, .11, .04], [0, .64, .43], mat.green, "switchgear");
      box(cabinet, [.55, .035, .045], [0, .38, .43], mat.amber, "switchgear");
    }
    for (let z = -2.7; z <= 2.7; z += 1.8) {
      box(switchgear, [1.25, 1.85, 1.35], [-5.05, .94, z], mat.darkSteel, "switchgear");
      for (let y = .3; y <= 1.5; y += .3) box(switchgear, [.9, .09, .04], [-5.05, y, z + .7], mat.green, "switchgear");
    }

    // Compute racks. The central showcase rack exposes real rack layers.
    const trayParts: Array<{ object: THREE.Object3D; baseZ: number; index: number }> = [];
    const ledMaterials: THREE.MeshStandardMaterial[] = [];
    const fanMeshes: THREE.Mesh[] = [];
    const rackXs = [-3.9, -2.6, -1.3, 0, 1.3, 2.6, 3.9, 5.2];
    const rackZs = [-2.45, 2.45];
    rackZs.forEach((z) => {
      rackXs.forEach((x) => {
        const showcase = x === 0 && z < 0;
        const rack = new THREE.Group();
        rack.position.set(x, 0, z);
        rack.userData.system = "rack";
        world.add(rack);
        box(rack, [.96, .12, 1.22], [0, .09, 0], mat.steel, "rack");
        box(rack, [.12, 3.05, .12], [-.43, 1.55, -.53], mat.steel, "rack");
        box(rack, [.12, 3.05, .12], [.43, 1.55, -.53], mat.steel, "rack");
        box(rack, [.12, 3.05, .12], [-.43, 1.55, .53], mat.steel, "rack");
        box(rack, [.12, 3.05, .12], [.43, 1.55, .53], mat.steel, "rack");
        box(rack, [.94, .12, 1.16], [0, 3.02, 0], mat.steel, "rack");

        const trayCount = showcase ? 10 : 8;
        for (let trayIndex = 0; trayIndex < trayCount; trayIndex += 1) {
          const tray = new THREE.Group();
          const trayY = .35 + trayIndex * (showcase ? .255 : .31);
          tray.position.set(0, trayY, 0);
          rack.add(tray);
          const isNetwork = trayIndex === trayCount - 1;
          const isCpu = trayIndex === 0;
          const trayMaterial = isNetwork ? mat.cyan : isCpu ? mat.copper : mat.gpu;
          box(tray, [.76, .16, .94], [0, 0, 0], trayMaterial, isNetwork ? "network" : "rack");
          if (showcase) {
            for (let chip = -1; chip <= 1; chip += 2) {
              box(tray, [.18, .055, .26], [chip * .2, .11, 0], isCpu ? mat.copper : mat.green, "rack");
            }
            trayParts.push({ object: tray, baseZ: 0, index: trayIndex });
          }
          const led = mat.green.clone();
          ledMaterials.push(led);
          box(tray, [.34, .035, .035], [0, .015, .49], led, isNetwork ? "network" : "rack");
        }

        // Dual rack PDUs and coolant manifold.
        box(rack, [.075, 2.55, .08], [-.38, 1.55, .57], mat.amber, "switchgear");
        box(rack, [.075, 2.55, .08], [.38, 1.55, .57], mat.amber, "switchgear");
        box(rack, [.08, 2.25, .08], [-.5, 1.5, -.58], mat.blue, "cooling");
        box(rack, [.08, 2.25, .08], [.5, 1.5, -.58], mat.warm, "cooling");
        if (!showcase) box(rack, [.84, 2.78, .025], [0, 1.55, .61], mat.glass, "rack");
      });
    });

    // Overhead power busway and fiber ladder.
    rackZs.forEach((z) => {
      box(powerGroup, [11.4, .22, .32], [.65, 4.08, z], mat.amber, "switchgear");
      for (const x of rackXs) box(powerGroup, [.1, 1.02, .1], [x, 3.55, z], mat.amber, "switchgear");
      box(networkGroup, [11.4, .16, .44], [.65, 4.48, z - Math.sign(z) * .58], mat.cyan, "network");
      for (const x of rackXs) box(networkGroup, [.07, 1.42, .07], [x, 3.74, z - Math.sign(z) * .35], mat.cyan, "network");
    });
    for (let x = -4; x <= 5; x += 1.15) {
      box(networkGroup, [.035, .035, 4.5], [x, 4.42, 0], x % 2 ? mat.blue : mat.cyan, "network");
    }

    // Spine network cabinets.
    for (let x = -1.8; x <= 3.6; x += 1.35) {
      const spine = box(networkGroup, [1.05, 2.6, 1], [x, 1.31, 4.8], mat.darkSteel, "network");
      for (let y = -.95; y < 1; y += .22) box(spine, [.74, .08, .04], [0, y, -.52], mat.cyan, "network");
    }

    // Cooling plant, CDU, heat exchangers, and animated fans.
    const coolingPlant = new THREE.Group();
    coolingPlant.userData.system = "cooling";
    coolingGroup.add(coolingPlant);
    for (let z = -3.4; z <= 3.4; z += 2.3) {
      box(coolingPlant, [2.1, 1.4, 1.8], [8.4, .72, z], mat.steel, "cooling");
      const fan = cylinder(coolingPlant, .57, .08, [8.4, 1.44, z], mat.blue, "cooling");
      fan.rotation.x = Math.PI / 2;
      fanMeshes.push(fan);
      for (let blade = 0; blade < 6; blade += 1) {
        const bladeMesh = box(fan, [.46, .035, .1], [0, 0, 0], mat.darkSteel, "cooling");
        bladeMesh.rotation.y = (Math.PI / 3) * blade;
      }
    }
    for (let z = -2.5; z <= 2.5; z += 2.5) {
      box(coolingPlant, [1.2, 2.45, 1.05], [6.6, 1.23, z], mat.darkSteel, "cooling");
      box(coolingPlant, [.14, 1.9, .12], [6.1, 1.25, z + .57], mat.blue, "cooling");
      box(coolingPlant, [.14, 1.9, .12], [7.1, 1.25, z + .57], mat.warm, "cooling");
    }

    // Operations console and control sensors.
    const control = new THREE.Group();
    control.userData.system = "control";
    world.add(control);
    box(control, [3.2, .18, 1.25], [6.55, .84, -5.1], mat.steel, "control");
    box(control, [2.8, .95, .2], [6.55, 1.48, -5.55], mat.darkSteel, "control");
    for (let x = 5.65; x <= 7.45; x += .9) {
      box(control, [.72, .48, .04], [x, 1.55, -5.67], x < 6.3 ? mat.amber : mat.cyan, "control");
    }
    for (let x = -3; x <= 4.5; x += 2.5) {
      const sensor = cylinder(control, .1, .26, [x, 4.78, 0], mat.green, "control");
      sensor.rotation.z = Math.PI / 2;
    }

    const flows: FlowParticle[] = [];
    const addFlow = (
      parent: THREE.Group,
      points: Array<[number, number, number]>,
      material: THREE.MeshStandardMaterial,
      kind: keyof SceneLayers,
      count: number,
      speed: number,
      radius = .075,
    ) => {
      const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 42, radius * .48, 7, false), material);
      tube.userData.system = kind === "network" ? "network" : kind === "cooling" ? "cooling" : "switchgear";
      parent.add(tube);
      for (let index = 0; index < count; index += 1) {
        const glow = material.clone();
        const pulse = new THREE.Mesh(new THREE.SphereGeometry(radius, 9, 9), glow);
        parent.add(pulse);
        flows.push({ mesh: pulse, curve, offset: index / count, speed, kind });
      }
    };

    addFlow(powerGroup, [[-10, 3.9, -3.2], [-9, 3.9, -3.2], [-9, 1.6, -.8], [-6.5, 1.6, -.8], [-5, 3.8, -.8], [0, 4.08, -2.45], [5, 4.08, -2.45]], mat.amber, "power", 9, .075, .09);
    addFlow(powerGroup, [[-9, 1.4, 1.2], [-6.5, 1.4, 1.2], [-5, 3.8, 1.2], [0, 4.08, 2.45], [5, 4.08, 2.45]], mat.amber, "power", 7, .068, .085);
    addFlow(networkGroup, [[2.1, 2.4, 4.8], [2.1, 4.48, 4.1], [2.1, 4.48, 1.9], [-2.6, 4.48, 1.9], [-2.6, 2.8, 2.45]], mat.cyan, "network", 10, .11, .07);
    addFlow(networkGroup, [[1.1, 2.4, 4.8], [1.1, 4.48, 4.1], [1.1, 4.48, -1.9], [3.9, 4.48, -1.9], [3.9, 2.8, -2.45]], mat.cyan, "network", 9, .105, .07);
    addFlow(coolingGroup, [[8.4, .5, 3.4], [6.6, .5, 2.5], [5.5, .5, 1.5], [0, .5, 1.5], [0, 1.3, -2.45]], mat.blue, "cooling", 8, .062, .09);
    addFlow(coolingGroup, [[0, 1.7, -2.45], [0, .8, -.9], [5.5, .8, -.9], [6.8, .8, -2.5], [8.4, .8, -3.4]], mat.warm, "cooling", 8, .055, .09);

    const ambient = new THREE.HemisphereLight("#b9ffdc", "#07100d", 1.35);
    scene.add(ambient);
    const key = new THREE.DirectionalLight("#dbfff0", 2.5);
    key.position.set(-6, 12, 7);
    scene.add(key);
    const rim = new THREE.PointLight("#3fdca1", 22, 28, 2);
    rim.position.set(5, 5.5, -3);
    scene.add(rim);
    const utilityLight = new THREE.PointLight("#ffad55", 16, 18, 2);
    utilityLight.position.set(-8, 4, -1);
    scene.add(utilityLight);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointers = new Map<number, { x: number; y: number }>();
    let pointerDown = { x: 0, y: 0, moved: false };
    let lastPinchDistance = 0;

    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (event: PointerEvent) => {
      renderer.domElement.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      pointerDown = { x: event.clientX, y: event.clientY, moved: false };
      if (pointers.size === 2) {
        const pair = [...pointers.values()];
        lastPinchDistance = Math.hypot(pair[0].x - pair[1].x, pair[0].y - pair[1].y);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 5) pointerDown.moved = true;

      if (pointers.size === 2) {
        const pair = [...pointers.values()];
        const distance = Math.hypot(pair[0].x - pair[1].x, pair[0].y - pair[1].y);
        if (lastPinchDistance > 0) controller.desiredRadius = THREE.MathUtils.clamp(controller.desiredRadius * (lastPinchDistance / distance), 6.5, 30);
        lastPinchDistance = distance;
        return;
      }

      controller.theta -= (event.clientX - previous.x) * .006;
      controller.phi = THREE.MathUtils.clamp(controller.phi + (event.clientY - previous.y) * .005, .48, 1.48);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!pointerDown.moved && pointers.size === 1) {
        setPointer(event);
        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObjects(world.children, true);
        const hit = intersections.find((intersection) => {
          let object: THREE.Object3D | null = intersection.object;
          while (object) {
            if (object.userData.system) return true;
            object = object.parent;
          }
          return false;
        });
        if (hit) {
          let object: THREE.Object3D | null = hit.object;
          while (object && !object.userData.system) object = object.parent;
          if (object?.userData.system) onSelectRef.current(object.userData.system as SystemId);
        }
      }
      pointers.delete(event.pointerId);
      lastPinchDistance = 0;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      controller.desiredRadius = THREE.MathUtils.clamp(controller.desiredRadius + event.deltaY * .012, 6.5, 30);
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const clock = new THREE.Clock();
    let animationFrame = 0;
    let elapsed = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderFrame = () => {
      const delta = Math.min(clock.getDelta(), .05);
      elapsed += delta;
      const running = activeRef.current && !reducedMotion;

      powerGroup.visible = layersRef.current.power;
      networkGroup.visible = layersRef.current.network;
      coolingGroup.visible = layersRef.current.cooling;

      controller.radius = THREE.MathUtils.lerp(controller.radius, controller.desiredRadius, .08);
      controller.target.lerp(controller.desiredTarget, .075);
      const sinPhi = Math.sin(controller.phi);
      camera.position.set(
        controller.target.x + controller.radius * sinPhi * Math.cos(controller.theta),
        controller.target.y + controller.radius * Math.cos(controller.phi),
        controller.target.z + controller.radius * sinPhi * Math.sin(controller.theta),
      );
      camera.lookAt(controller.target);

      flows.forEach((flow) => {
        flow.mesh.visible = layersRef.current[flow.kind];
        if (running) flow.offset = (flow.offset + delta * flow.speed) % 1;
        flow.mesh.position.copy(flow.curve.getPointAt(flow.offset));
      });

      ledMaterials.forEach((material, index) => {
        const pulse = running ? .72 + Math.sin(elapsed * 4.2 + index * .83) * .48 : .12;
        material.emissiveIntensity = pulse;
      });
      fanMeshes.forEach((fan, index) => {
        if (running) fan.rotation.y += delta * (2.8 + index * .18);
      });
      trayParts.forEach(({ object, baseZ, index }) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const targetZ = explodedRef.current ? baseZ + direction * (.55 + index * .045) : baseZ;
        object.position.z = THREE.MathUtils.lerp(object.position.z, targetZ, .095);
      });

      const selectedPoint = FOCUS_POINTS[selectedRef.current];
      rim.position.x = THREE.MathUtils.lerp(rim.position.x, selectedPoint[0], .02);
      rim.position.z = THREE.MathUtils.lerp(rim.position.z, selectedPoint[2], .02);
      rim.color.set(selectedRef.current === "grid" || selectedRef.current === "switchgear" ? "#ffb655" : selectedRef.current === "network" ? "#65dfff" : "#6fe7aa");

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(renderFrame);
    };
    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
      controllerRef.current = null;
      sceneGroupsRef.current = {};
    };
  }, []);

  return (
    <div className="facility-canvas" ref={mountRef}>
      <div className="webgl-fallback">
        WebGL is unavailable on this device. Use the component index below to explore the facility.
      </div>
    </div>
  );
});

export default DataCenterScene;

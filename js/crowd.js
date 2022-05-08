import * as THREE from '../js/three.module.js';
import { GLTFLoader } from '../js/GLTFLoader.js';


// THREEJS RELATED VARIABLES

let scene, camera,
textureLoader, gltf, itemsToLoad = 0,
renderer, clock, people, 
step = 0, zoomCount = 0, spinSpeed = 0.03, 
horizon = -56, health, raycaster, targetBox, earth, group, cameraGroup, 
greeting = false, songMixer, heart, beatingHeart = false, lastBeat = false,
camStart, camStop, camLookat, camDuration = 0, camElapsed = 0, panningCamera = false,
camQStart, camQStop, canPlaySong = false, playingSong = false, runTime = 0, balloons = [],
fireworks = [], launcherTexture, particleTexture, launchTimer = -1,

//SCREEN & MOUSE VARIABLES

HEIGHT, WIDTH, mousePos, 
mouseDown = false, mouseMove = false,
slowmo = false,
stage = -1;

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();

  // LIGHTS
  let hemisphereLight = new THREE.HemisphereLight();
  let directionalLight = new THREE.DirectionalLight(0xffffff, 1);

  scene.add(hemisphereLight);
  scene.add(directionalLight);

  // CAMERA
  let aspectRatio = WIDTH / HEIGHT;
  let fieldOfView = 70;
  let nearPlane = 0.1;
  let farPlane = 1000;
  camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
  camera.layers.enable( 1 );
  scene.add(camera);

  raycaster = new THREE.Raycaster();
  raycaster.layers.set( 1 );

  // HUD
  textureLoader = new THREE.TextureLoader();
  health = new Array(5);
  
  const gltfLoader = new GLTFLoader();
  gltfLoader.load( 'models/model.glb', 
    function ( results ) {
      // console.log(results);
      gltf = results;
      loadStage_0();
    },
    // called while loading is progressing
    function ( xhr ) {
      //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      // console.log( 'An error happened' );
    } 
  );
  
  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(WIDTH, HEIGHT);
  renderer.outputEncoding = THREE.sRGBEncoding;
  let container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  mousePos = new THREE.Vector2();
  container.addEventListener('mousedown', handleMouseDown, false);
  container.addEventListener('mouseup', handleMouseUp, false);
  container.addEventListener('mousemove', handleMouseMove, false);
  window.addEventListener('resize', handleWindowResize, false);

  container.addEventListener("touchstart", handleTouchStart, false);
  container.addEventListener("touchmove", handleTouchMove, false);
  container.addEventListener("touchend", handleTouchEnd, false);
}

// HANDLE SCREEN EVENTS
function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize(WIDTH, HEIGHT);
}

function loadStage_0(){
  group = new THREE.Group();
  scene.add(group);
  cameraGroup = new THREE.Group();
  camera.add(cameraGroup);

  itemsToLoad++;
  textureLoader.load('texture/bar_20.png', (texture) => {addHealthBar(0, texture, true); itemsToLoad--;});

  let atmosphere;
  gltf.scene.traverse((node)=>{
    const name = node.name;
    switch(name){
      case 'earth': earth = node; break;
      case 'atmosphere': atmosphere = node; break;
    }
  });
  earth.rotateZ(-0.41);

  group.add(atmosphere);
  group.add(earth);

  camera.position.set(0, 0, 100);
  showCaptainLog();

  stage = 0;
  animate();
}

function loadStage_1() {
  scene.remove(group);
  group = new THREE.Group();
  scene.add(group);

  itemsToLoad += 4;
  // textureLoader.load('bar_20.png', (texture) => {addHealthBar(0, texture, true);});
  textureLoader.load('texture/bar_40.png', (texture) => {addHealthBar(1, texture, false); itemsToLoad--;});
  textureLoader.load('texture/bar_60.png', (texture) => {addHealthBar(2, texture, false); itemsToLoad--;});
  textureLoader.load('texture/bar_80.png', (texture) => {addHealthBar(3, texture, false); itemsToLoad--;});
  textureLoader.load('texture/bar_100.png', (texture) => {addHealthBar(4, texture, false); itemsToLoad--;});

  const color = 'lightblue';
  scene.background = new THREE.Color(color);
  scene.fog = new THREE.FogExp2(color, 0.04);
  // scene.fog = new THREE.Fog(color, 50,55);

  camera.position.set(0, 6, 0);
  camera.lookAt(0, 0, -20);

  let model, name01, name02, face01, faces = [], hat, ground; 
  gltf.scene.traverse((node)=>{
    const name = node.name;
    switch(name){
      case 'person': model = node; break;
      case 'name01': name01 = node; break;
      case 'name02': name02 = node; break;
      case 'face01': face01 = node; faces.push(node); break;
      case 'face02':case 'face03':case 'face04':case 'face05':
      case 'face06':case 'face07':case 'face08':case 'face09':
      case 'face10':case 'face11':case 'face12':case 'face13':
      case 'face14':case 'face15':case 'face16':case 'face17':
      case 'face18': faces.push(node); break;
      case 'hat': hat = node; break;
      case 'ground': ground = node; break;
    }
  });

  ground.position.set(0,-1,-10);
  group.add(ground);
  
  const materials = [
    new THREE.MeshPhongMaterial({color: 0xf9f9f9}), //white 0
    new THREE.MeshPhongMaterial({color: 0x060606}), //black 1
    new THREE.MeshPhongMaterial({color: 0xFFEEDB, side: THREE.DoubleSide}), //beige 2
    new THREE.MeshPhongMaterial({color: 0x30292F, side: THREE.DoubleSide}), //gray 3
    new THREE.MeshPhongMaterial({color: 0xF49F0A, side: THREE.DoubleSide}), //orange 4
    new THREE.MeshPhongMaterial({color: 0x00A6A6, side: THREE.DoubleSide}), //green 5
    new THREE.MeshPhongMaterial({color: 0xEB4B73, side: THREE.DoubleSide}), //pink 6
    new THREE.MeshPhongMaterial({color: 0x3777FF, side: THREE.DoubleSide}) //blue 7
  ];

  const colorCombo = [[2,1,1], [3,0,1], [3,1,0], [4,1,0], [4,1,1],
  [5,1,1], [5,1,0], [6,1,0], [6,1,1], [7,1,1], [7,1,0]];

  const clips = gltf.animations;
  const clipWalk = THREE.AnimationClip.findByName(clips, 'walk');
  const clipRun = THREE.AnimationClip.findByName(clips, 'run');

  const nAnimations = 3;
  const nColorCombos = colorCombo.length;
  const nFaces = faces.length;
  const nPeople = 150;
  const x0 = -70, x1 = 70, z0 = horizon, z1 = -2; // map boundaries

  // POSITION
  const xDist = x1 - x0, xLen = xDist + 1, locEnd = (z1 - z0 + 1) * xLen;
  let locs = [], loc = 0;
  do{
    if(Math.random() < 0.5){
      // long row
      for(let xEnd = loc + xDist; loc <= xEnd; loc += 2){
        locs.push(loc);
      }
      loc += xDist;
    }
    else{
      // offset short row
      loc++;
      for(let xEnd = loc + xDist; loc < xEnd; loc += 2){
        locs.push(loc);
      }
      loc += xLen;
    }
  } while(loc < locEnd);

  // shuffle
  let currentIndex = locs.length, randomIndex;
  for(let i = 0; i < nPeople; i++){
    if(currentIndex == 0) break;
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [locs[currentIndex], locs[randomIndex]] = [locs[randomIndex], locs[currentIndex]];
  }

  currentIndex = locs.length - 1;
  people = new Array(nPeople);
  itemsToLoad += nPeople;

  for (let i = nPeople - 1; i >= 0; i--) {
    let person, name, face;
    if(i != 0){
      person = model.clone();
      face = faces[getRandomInteger(0,nFaces)].clone();
      name = name02.clone();
      group.add(person);
    }
    else{
      person = model;
      face = face01;
      name = name01;
      scene.add(person);
    }
    
    // COLOR
    let combo = colorCombo[getRandomInteger(0, nColorCombos)];
    let matBody = materials[combo[0]];
    let whatHead = getRandomInteger(1,4);
    let torso, head;
    person.traverse((node) => {
      if(node.isMesh){
        const name = node.name;
        switch(name){
          case 'torso': torso = node; break;
          case 'head01':
            if(whatHead==1){head = node;}else{node.visible = false;} break;
          case 'head02':
            if(whatHead==2){head = node;}else{node.visible = false;} break;
          case 'head03':
            if(whatHead==3){head = node;}else{node.visible = false;} break;
        }
        node.material = matBody;
      }
    });
    face.material = materials[combo[1]];
    name.material = materials[combo[2]];
    head.add(face);
    torso.add(name);

    // hat
    if(i == 0){
      head.geometry.computeBoundingBox();
      hat.position.y = head.geometry.boundingBox.max.y;
      head.add( hat );
    }
    
    // ANIMATION
    let mixer = new THREE.AnimationMixer(person);
    let whatAction = getRandomInteger(0, nAnimations), action, animationSpeed, movementSpeed;
    switch(whatAction){
      case 0:
        action = mixer.clipAction(clipWalk); animationSpeed = 1.2; movementSpeed = 0.02; break;
      case 1:
        action = mixer.clipAction(clipWalk); animationSpeed = 2.2; movementSpeed = 0.02; break;
      case 2:
        action = mixer.clipAction(clipRun); animationSpeed = 1.7; movementSpeed = 0.06; break;
    }
    action.timeScale = animationSpeed;
    action.play();
    mixer.setTime(3 * Math.random());
    
    loc = locs[currentIndex];
    person.position.x = loc % xLen + x0;
    person.position.z = Math.floor(loc/xLen) + z0;
    currentIndex--;

    person.userData = {mixer:mixer, action:action, animationSpeed:animationSpeed, movementSpeed:movementSpeed};
    people[i] = person;
  }

  itemsToLoad -= nPeople;

  targetBox = new THREE.Mesh(
    new THREE.BoxGeometry(3, 5, 2.5), 
    new THREE.MeshBasicMaterial({transparent:true, opacity:0}));
  targetBox.layers.set( 1 );
  people[0].add( targetBox );
  targetBox.position.set(0,1,0);

  stage = 1;
}

function loadStage_2(){
  const person = people[0];
  itemsToLoad++;
  textureLoader.load('texture/heart.png', (texture) => {
    const material = new THREE.SpriteMaterial({
      map:texture, transparent:true, opacity:0.5, fog:false 
    });
    heart = new THREE.Sprite(material);
    heart.center.set(0.5, 0.5);
    
    const pos = person.position.clone();
    pos.y += 0.2; pos.z += 0.5;
    heart.position.copy(pos);
    
    const big = 0.01, small = 0.0001;
    const size = new THREE.Vector3(material.map.image.width,material.map.image.height,1);
    heart.scale.set(small * size.x, small * size.y, 1);

    heart.userData = {
      origin:pos, size:size, big:big, small:small, 
      pause: 0.8, elapsed: 0, beats: 0, near: new THREE.Vector3()
    };
    scene.add( heart );
    beatingHeart = true;
    itemsToLoad--;
  });

  camStart = camera.position.clone();
  camLookat = person.position.clone();
  camLookat.y += 1.5;
  camStop = camLookat.clone();
  camStop.z += 4;
  let camSpeed = 12;
  camDuration = camStart.distanceTo(camStop) / camSpeed;
  camElapsed = 0;
  camQStart = camera.quaternion.clone();
  camera.lookAt(camLookat);
  camQStop = camera.quaternion.clone();
  camera.quaternion.copy(camQStart);
  
  const clips = gltf.animations;
  const clipIdle = THREE.AnimationClip.findByName(clips, 'idle');
  const mixer = person.userData.mixer;
  const action = mixer.clipAction(clipIdle);
  const duration = 0.6;
  person.userData.action.fadeOut(duration);
  action
    .reset()
    .setEffectiveTimeScale( 1 )
    .setEffectiveWeight( 1 )
    .fadeIn( duration )
    .play();

  stage = 2;
}

function loadStage_3() {
  scene.remove(group);
  cameraGroup.remove(health[0]);
  group = new THREE.Group();
  scene.add(group);

  const nPeople = 3;
  const happyFaces = new Array(nPeople);
  const sadFaces = new Array(nPeople);
  const number520 = new Array(nPeople);
  let model, ground, theHeart, thePuff;
  gltf.scene.traverse((node)=>{
    switch(node.name){
      case 'ground': ground = node; break;
      case 'person': model = node; break;
      case 'face01': happyFaces[0] = node; break;
      case 'face11': happyFaces[1] = node; break;
      case 'face02': happyFaces[2] = node; break;
      case 'face08': sadFaces[0] = node; break;
      case 'face10': sadFaces[1] = node; break;
      case 'face15': sadFaces[2] = node; break;
      case 'number_5': number520[0] = node; break;
      case 'number_2': number520[1] = node; break;
      case 'number_0': number520[2] = node; break;
      case 'heart': theHeart = node; break;
      case 'puff': thePuff = node; break;
    }
  });
  
  const clips = gltf.animations;
  const sadClip = THREE.AnimationClip.findByName(clips, 'depressed');
  const happyClip = THREE.AnimationClip.findByName(clips, 'happy');
  const jumpRClip = THREE.AnimationClip.findByName(clips, 'jump_R');
  const jumpLClip = THREE.AnimationClip.findByName(clips, 'jump_L');
  const jumpFClip = THREE.AnimationClip.findByName(clips, 'jump_F');
  
  const center = 0, seperation = 9, danceHeight = 5, danceOriginZ = -28;
  const sitPos = [center - 13.5 - seperation, center, center + 13.5 + seperation];
  const dancePos = [center - 7.25 - seperation, center - 6.25, center + 19.75 + seperation];

  const faceMat = new THREE.MeshPhongMaterial({color: 0x060606, side: THREE.DoubleSide});
  const bodyColors = [new THREE.Color(0xF49F0A),new THREE.Color(0x00A6A6),new THREE.Color(0xEB4B73)]; // yellow, green, pink
  
  people = new Array(nPeople);

  for (let i = nPeople - 1; i >= 0; i--) {
    let person, heart, puff;
    if(i==0){
      person = model;
      heart = theHeart;
      puff = thePuff;
    }
    else{
      person = model.clone();
      heart = theHeart.clone();
      puff = thePuff.clone();
    }
    
    let head;
    let bodyMat = new THREE.MeshPhongMaterial({color: bodyColors[i], side: THREE.DoubleSide
      , depthTest:false, transparent:true, opacity:0.5});

    person.traverse((node) => {
      if(node.isMesh){
        switch(node.name){
          case 'head01':
            if(i==2){head = node;}else{node.visible = false;} break;
          case 'head02':
            if(i==0){head = node;}else{node.visible = false;} break;
          case 'head03':
            if(i==1){head = node;}else{node.visible = false;} break;
        }
        node.material = bodyMat;
      }
    });
    const happyFace = happyFaces[i]; happyFace.material = faceMat; happyFace.visible = false;
    const sadFace = sadFaces[i]; sadFace.material = faceMat;
    head.add(happyFace);
    head.add(sadFace);
    
    person.position.set(sitPos[i], 0, 0);

    const dancePosition = new THREE.Vector3( dancePos[i], danceHeight, danceOriginZ );

    const number = number520[i];
    number.material = bodyMat;
    number.position.copy(dancePosition);
    number.position.y = -100;

    puff.material = new THREE.MeshBasicMaterial({color: 0xaaaaaa, transparent: true, opacity: 0});
    puff.position.set(person.position.x, 1, person.position.z - 2);
    
    heart.material = new THREE.MeshPhongMaterial({color: bodyColors[i], side: THREE.DoubleSide
      , depthTest: false, emissive: bodyColors[i]});
    heart.renderOrder = 100;
    let heartPosition = new THREE.Vector3(sitPos[(i+1)%nPeople] + 4, 0.7, 0);
    heart.position.copy(heartPosition);
    let hs = 2;
    heart.scale.set(hs,hs,hs);
    scene.add(heart);

    let personIntersect = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 3.5, 1.5), 
      new THREE.MeshBasicMaterial({transparent:true, opacity:0}));
    personIntersect.layers.set( 1 );
    personIntersect.position.copy(person.position);
    personIntersect.userData = {type:'person', person:person};
    group.add(personIntersect);

    let heartIntersect = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3.5, 0.5), 
      new THREE.MeshBasicMaterial({transparent:true, opacity:0}));
    heartIntersect.layers.set( 1 );
    heartIntersect.position.copy(heartPosition);
    heartIntersect.userData = {type:'heart', person:person};
    group.add(heartIntersect);

    // ANIMATION
    const mixer = new THREE.AnimationMixer(person);
    const actions = {
      sad: mixer.clipAction(sadClip),
      happy: mixer.clipAction(happyClip), 
      r: mixer.clipAction(jumpRClip), 
      l: mixer.clipAction(jumpLClip), 
      f: mixer.clipAction(jumpFClip)
    };
    actions.happy.loop = THREE.LoopOnce;
    actions.r.loop = THREE.LoopOnce;
    actions.l.loop = THREE.LoopOnce;
    actions.f.loop = THREE.LoopOnce;
    
    actions.sad.timeScale = Math.random() + 0.7;
    actions.sad.time = 0.5 * i;
    actions.sad.play();
    
    person.userData = {
      mixer:mixer, actions:actions, danceNumber:i, dancePosition:dancePosition, turn:-1
      , rotationRemain:0, nextAction:null, happyFace:happyFace, sadFace:sadFace
      , number:number, numberRising:false, numberElapsed:0, puff:puff
      , material:bodyMat, heart:heart, heartPosition:heartPosition, heartState:0, heartElapsed:0
    };
    people[i] = person;
    scene.add(person);
  }

  ground.position.set(34,-1,110);
  ground.rotateY(Math.PI/2);
  let gs = 2;
  ground.scale.set(gs,gs,gs);
  group.add(ground);

  camera.position.copy(people[1].position);
  camera.position.y += 4;
  camera.position.z += 23;

  let pouchIntersect = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 3, 0.5), 
    new THREE.MeshBasicMaterial({transparent:true, opacity:0}));
  pouchIntersect.layers.set( 1 );
  cameraGroup.add(pouchIntersect);
  cameraGroup.userData = {pouchIntersect:pouchIntersect, person:null, count:3};
  pouchIntersect.position.set(0, -4, -9);
  pouchIntersect.userData = {type:'pouch'};

  // fireworks
  itemsToLoad += 2;
  textureLoader.load('texture/launcher.png', (texture) => {launcherTexture = texture; itemsToLoad--;});
  textureLoader.load('texture/dot.png', (texture) => {particleTexture = texture; itemsToLoad--;});
  launchTimer = 30;

  stage = 3;
}

function createFireworks(){
  const color = new THREE.Color();
  let hue = Math.random();
  color.setHSL( hue, 1.0, 0.4 );

  const launcherGeo = new THREE.BufferGeometry();
  launcherGeo.setAttribute( 'position', new THREE.Float32BufferAttribute( [0, 0, 0], 3 ) );
  const launcherMat = new THREE.PointsMaterial( { map: launcherTexture, color: color, transparent:true } );
  const launcher = new THREE.Points( launcherGeo, launcherMat );

  const launchFrom = camera.position.clone();
  launchFrom.x += randFloat(-20,20);
  launchFrom.z += 20;
  launchFrom.y -= randFloat(30,100);
  const launchTo = launchFrom.clone();
  launchTo.x += randFloat(-5,5);
  launchTo.z -= randFloat(20,40);
  launchTo.y += randFloat(-5,5);

  const positions = [];
  const colors = [];
  const sizes = [];
  const translations = [];
  const timings = [];
  let patternDuration, downSpeed, flashPoint;

  const whatPattern = Math.random();
  if(whatPattern < 0.4){
    patternDuration = 4; downSpeed = 0.06; flashPoint = 2;
    let particles = 50;
    // ring # 1
    let p = Math.floor(particles * 0.7), radius = 3.4, velocity = 0.3, size = 4.0;
    color.setHSL( hue, 1.0, 0.5 );
    makeRing(positions, translations, colors, sizes, timings, color, p, radius, velocity, size);
    
    // ring # 2
    p = particles - p; radius = 3.2; velocity = 0.2; size = 4.0;
    hue = hue < 0.5 ? hue + 0.5 : hue - 0.5;
    color.setHSL( hue, 1.0, 0.5 );
    makeRing(positions, translations, colors, sizes, timings, color, p, radius, velocity, size);
  }
  else if(whatPattern < 0.8){
    // bundle
    patternDuration = 5; downSpeed = 0.01; flashPoint = 0.0;
    let particles = 40, radius = 2, velocity = 0.3, size = 2.0;
    makeBundle(positions, translations, colors, sizes, timings, color, particles, radius, velocity, size);
  }
  else {
    patternDuration = 4; downSpeed = 0.1; flashPoint = 1.5;
    // i heart u
    let particles = 80, velocity = 0.02, size = 2.0, scale = 2;
    color.setHSL( hue, 1.0, 0.5 );
    makePhrase(positions, translations, colors, sizes, timings, color, particles, velocity, size, scale);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));

  const pattern = new THREE.Points( geometry, getFireworkMaterial() );

  const firework = new THREE.Object3D();
  firework.userData = {
    launcher: launcher, 
    launchFrom: launchFrom,
    launchTo: launchTo,
    status: 0, elapsed: 0, launchDuration: randFloat(0.5, 1.5), waitDuration: randFloat(0.1, 0.5),
    pattern: pattern, 
    translations: translations, timings: timings,
    patternDuration: patternDuration, downSpeed: downSpeed, flashPoint: flashPoint};

  fireworks.push(firework);
  scene.add( launcher );
}

function getFireworkMaterial(){

  const vertexShader = 
`
attribute float size;
varying vec4 vColor;
void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = size * ( 300.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
`;

  const fragmentShader =
`
uniform sampler2D pointTexture;
varying vec4 vColor;
void main() {
  gl_FragColor = vColor * texture2D( pointTexture, gl_PointCoord );
}
`;

  const uniforms = {
    pointTexture: { value: particleTexture }
  };

  return new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true
  } );
}

function makePhrase(positions, translations, colors, sizes, timings, color, particles, velocity, size, scale){
  const curvesArrays = [
  [
  new THREE.CubicBezierCurve3(new THREE.Vector3(-0.88,-0.06,0.00),new THREE.Vector3(-1.19,0.38,0.00),new THREE.Vector3(-0.60,1.50,0.00),new THREE.Vector3(0.00,0.66,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(0.00,0.66,0.00),new THREE.Vector3(0.59,1.51,0.00),new THREE.Vector3(1.20,0.32,0.00),new THREE.Vector3(0.89,-0.05,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(0.89,-0.05,0.00),new THREE.Vector3(0.30,-0.75,0.00),new THREE.Vector3(0.51,-0.46,0.00),new THREE.Vector3(-0.00,-0.91,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-0.00,-0.91,0.00),new THREE.Vector3(-0.50,-0.46,0.00),new THREE.Vector3(-0.41,-0.71,0.00),new THREE.Vector3(-0.88,-0.06,0.00)),
  ],
  [
  new THREE.CubicBezierCurve3(new THREE.Vector3(-0.78,0.34,0.00),new THREE.Vector3(-0.42,0.80,0.00),new THREE.Vector3(0.04,0.93,0.00),new THREE.Vector3(-0.39,0.36,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-0.39,0.36,0.00),new THREE.Vector3(-1.50,-1.10,0.00),new THREE.Vector3(1.56,2.07,0.00),new THREE.Vector3(0.02,0.10,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(0.02,0.10,0.00),new THREE.Vector3(-1.48,-1.83,0.00),new THREE.Vector3(2.09,1.91,0.00),new THREE.Vector3(0.09,-0.59,0.00)),
  ],
  [
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.84,0.95,0.00),new THREE.Vector3(-2.83,0.95,0.00),new THREE.Vector3(-2.07,0.95,0.00),new THREE.Vector3(-2.06,0.95,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.06,0.95,0.00),new THREE.Vector3(-2.06,0.94,0.00),new THREE.Vector3(-2.06,0.80,0.00),new THREE.Vector3(-2.06,0.78,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.06,0.78,0.00),new THREE.Vector3(-2.07,0.78,0.00),new THREE.Vector3(-2.33,0.78,0.00),new THREE.Vector3(-2.35,0.78,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.35,0.78,0.00),new THREE.Vector3(-2.35,0.76,0.00),new THREE.Vector3(-2.35,-0.75,0.00),new THREE.Vector3(-2.35,-0.76,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.35,-0.76,0.00),new THREE.Vector3(-2.33,-0.76,0.00),new THREE.Vector3(-2.07,-0.76,0.00),new THREE.Vector3(-2.06,-0.76,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.06,-0.76,0.00),new THREE.Vector3(-2.06,-0.78,0.00),new THREE.Vector3(-2.06,-0.90,0.00),new THREE.Vector3(-2.06,-0.91,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.06,-0.91,0.00),new THREE.Vector3(-2.07,-0.91,0.00),new THREE.Vector3(-2.83,-0.93,0.00),new THREE.Vector3(-2.84,-0.93,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.84,-0.93,0.00),new THREE.Vector3(-2.84,-0.91,0.00),new THREE.Vector3(-2.84,-0.78,0.00),new THREE.Vector3(-2.84,-0.77,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.84,-0.77,0.00),new THREE.Vector3(-2.83,-0.77,0.00),new THREE.Vector3(-2.57,-0.76,0.00),new THREE.Vector3(-2.55,-0.76,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.55,-0.76,0.00),new THREE.Vector3(-2.55,-0.75,0.00),new THREE.Vector3(-2.54,0.77,0.00),new THREE.Vector3(-2.54,0.79,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.54,0.79,0.00),new THREE.Vector3(-2.56,0.79,0.00),new THREE.Vector3(-2.83,0.79,0.00),new THREE.Vector3(-2.85,0.79,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(-2.85,0.79,0.00),new THREE.Vector3(-2.85,0.80,0.00),new THREE.Vector3(-2.84,0.94,0.00),new THREE.Vector3(-2.84,0.95,0.00)),
  ],
  [
  new THREE.CubicBezierCurve3(new THREE.Vector3(3.53,0.95,0.00),new THREE.Vector3(3.79,-1.53,0.00),new THREE.Vector3(1.67,-1.54,0.00),new THREE.Vector3(2.00,0.94,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(2.00,0.94,0.00),new THREE.Vector3(2.04,0.94,0.00),new THREE.Vector3(2.17,0.95,0.00),new THREE.Vector3(2.20,0.95,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(2.20,0.95,0.00),new THREE.Vector3(1.94,-1.32,0.00),new THREE.Vector3(3.57,-1.32,0.00),new THREE.Vector3(3.36,0.95,0.00)),
  new THREE.CubicBezierCurve3(new THREE.Vector3(3.36,0.95,0.00),new THREE.Vector3(3.39,0.95,0.00),new THREE.Vector3(3.50,0.94,0.00),new THREE.Vector3(3.53,0.95,0.00)),
  ]];

  const lengthsArray = [0.22,0.24,0.23,0.31];

  const nSplines = curvesArrays.length, holdTime = 2;
  const radian = randFloat(-0.8, 0.8), cos = Math.cos(radian), sin = Math.sin(radian);

  for(let i = 0; i < nSplines; i++){
    let curvepath = new THREE.CurvePath();
    curvepath.curves = curvesArrays[i];
    let points = curvepath.getSpacedPoints( Math.round(particles * lengthsArray[i]) - 1 );
    let len = points.length;
    for ( let j = 0; j < len; j++ ) {
      let p = points[j], rand = Math.random(), r = rand * 0.1 - 0.05,
        x = (p.x + r) * scale, y = -(p.y + r) * scale,
        nx = cos * x + sin * y ,
        ny = cos * y - sin * x ;
        
      positions.push( nx, 0.0, ny );
      translations.push( nx * velocity, 0.0, ny * velocity );
      colors.push( color.r, color.g, color.b, 1.0 );
      sizes.push( size );
      timings.push(-holdTime-rand);
    }
  }
}

function makeRing(positions, translations, colors, sizes, timings, color, particles, radius, velocity, size){
  const angleStep = (Math.PI + Math.PI) / particles, holdTime = 0.5;
  for ( let i = 0; i < particles; i ++ ) {
    let a = i * angleStep, x = Math.cos(a), y = Math.sin(a);
    let rand = Math.random(), r = rand * 0.06, v = r / 3;
    r += radius;
    v += velocity;

    positions.push( x * r, rand - 0.5, y * r );
    translations.push( x * v, 0.0, y * v );
    colors.push( color.r, color.g, color.b, 1.0 );
    sizes.push( size );
    timings.push(-holdTime-rand);
  }
}

function makeBundle(positions, translations, colors, sizes, timings, color, particles, radius, velocity, size){
  const holdTime = 1;
  for ( let i = 0; i < particles; i ++ ) {
    let rand = Math.random(), xr = randFloat(-radius, radius), yr = randFloat(-radius, radius) * 0.7;
    positions.push( xr, (rand - 0.5) * radius, yr );
    translations.push( xr * velocity, 0.0, yr * velocity );
    color.setHSL( rand, 1.0, 0.5 );
    colors.push( color.r, color.g, color.b, 1.0 );
    sizes.push( size );
    timings.push(-holdTime-rand);
  }
}

function showFireworks(delta){
  if(launchTimer == -1){ return; }
  else if(launchTimer > 0){ launchTimer--; }
  else if(launchTimer == 0){ launchTimer = getRandomInteger(90, 300); createFireworks(); }

  for(let idx = fireworks.length - 1; idx >= 0; idx--) {
    const fd = fireworks[idx].userData;
    if(fd.status == 0){
      // launching
      fd.elapsed += delta;
      let alpha = fd.elapsed / fd.launchDuration;
      alpha = easeOutCubic(alpha);
      const launcher = fd.launcher;
      if(alpha <= 1){
        launcher.position.lerpVectors(fd.launchFrom, fd.launchTo, alpha);
        if(alpha > 0.9){
          launcher.material.color.multiplyScalar(0.5);
        }
      }
      else{
        scene.remove(launcher);
        launcher.geometry.dispose();
        launcher.material.dispose();
        // fd.elapsed = 0;
        fd.status = 1;
      }
    }
    else if(fd.status == 1){
      // wait
      fd.waitDuration -= delta;
      if(fd.waitDuration < 0){
        const pattern = fd.pattern;
        scene.add(pattern);
        pattern.position.copy(fd.launchTo);
        fd.elapsed = 0;
        fd.status = 2;
      }
    }
    else if(fd.status == 2){
      fd.elapsed += delta;
      const elapsed = fd.elapsed;
      const ttl = fd.patternDuration - elapsed;
      const pattern = fd.pattern;
      if(ttl > 0){
        const attributes = pattern.geometry.attributes;
        const position = attributes.position;
        const positions = position.array;
        const translations = fd.translations;
        const timings = fd.timings;
        let len = positions.length, k = 0;
        for ( let i = 0; i < len; i++ ){
          translations[i] *= 0.98;
          positions[i] += translations[i];

          if(i % 3 == 2){
            let t = timings[k];
            if(t > 0){
              // drop
              positions[i] += t * fd.downSpeed;
            }
            timings[k] = t + delta;
            k++;
          }
        }
        position.needsUpdate = true;
        
        const color = attributes.color;
        const colors = color.array;
        const size = attributes.size;
        const sizes = size.array;
        const flashPoint = fd.flashPoint;
        const fduration = fd.patternDuration - flashPoint;
        len = sizes.length;
        for ( let i = 0; i < len; i++ ){
          if(elapsed < flashPoint){
            sizes[i] = (Math.sin(timings[i] * 10) * 0.08 + sizes[i]) * 0.996;
          }
          else{
            // fade
            sizes[i] *= 0.993;
            let a = i * 4 + 3;
            if(Math.random()*fduration > ttl){ colors[a] = 0.0; }
            else{ colors[a] = 1.0; }
          }
        }
        color.needsUpdate = true;
        size.needsUpdate = true;
      }
      else{
        scene.remove(pattern);
        pattern.geometry.dispose();
        pattern.material.dispose();
        fireworks.splice(idx, 1);
      }
    }
  }
}

function moveHeart2Pouch(person){
  const data = person.userData;
  data.heart.material.emissiveIntensity = 1.5;
  data.heartState = 2;
}

function moveHeart2OriginalPosition(person){
  const data = person.userData;
  const heart = data.heart;
  scene.add(heart);
  heart.material.emissiveIntensity = 0;
  data.heartState = 3;
}

function moveHeart2Person(person){
  const data = person.userData;
  const heart = data.heart;
  scene.add(heart);
  heart.material.depthTest = true;
  heart.material.emissiveIntensity = 0;
  heart.scale.set(2,2,2);
  data.heartState = 4;
}

function beHappy(person){
  const data = person.userData;
  data.material.transparent = false;
  data.material.opacity = 1;
  data.material.depthTest = true;
  data.sadFace.visible = false;
  data.happyFace.visible = true;
  const actions = data.actions;
  actions.sad.crossFadeTo(actions.happy, 0.3, false);
  scene.add(data.number);
  scene.add(data.puff);
  data.numberRising = true;
}

function startDance(person){
  const data = person.userData;
  const mixer = data.mixer;
  mixer.stopAllAction();
  person.position.copy(data.dancePosition);

  let action;
  switch(data.danceNumber){
    case 0: // 5
      person.rotateY(Math.PI); action = data.actions.l;
      break;
    case 1: // 2
      person.rotateY(-Math.PI); action = data.actions.r;
      break;
    case 2: // 0
      action = data.actions.f;
      break;
  }
  data.turn = 0;
  mixer.addEventListener( 'finished', transitionDanceTurn );
  action.play();
  cameraGroup.userData.count--;
}

function transitionDanceTurn(event){
  const person = event.action.getRoot();
  const data = person.userData;
  if(data.turn < 0) { return; }
  event.action.stop();
  switch(data.danceNumber){
    case 0: // number 5
      switch(data.turn % 10){
        case 0: person.position.x -= 12.5; data.rotationRemain=(Math.PI/2); data.nextAction = data.actions.l; break;
        case 1: person.position.z += 12.5; data.rotationRemain=(Math.PI/2); data.nextAction = data.actions.l; break;
        case 2: person.position.x += 12.5; data.rotationRemain=(Math.PI/2); data.nextAction = data.actions.r; break;
        case 3: person.position.z += 12.5; data.rotationRemain=(-Math.PI/2); data.nextAction = data.actions.r; break;
        case 4: person.position.x -= 12.5; data.nextAction = data.actions.l; break;
        case 5: person.position.x += 12.5; data.rotationRemain=(Math.PI/2); data.nextAction = data.actions.l; break;
        case 6: person.position.z -= 12.5; data.rotationRemain=(-Math.PI/2); data.nextAction = data.actions.r; break;
        case 7: person.position.x -= 12.5; data.rotationRemain=(-Math.PI/2); data.nextAction = data.actions.r; break;
        case 8: person.position.z -= 12.5; data.rotationRemain=(-Math.PI/2); data.nextAction = data.actions.r; break;
        case 9: person.position.x += 12.5; data.nextAction = data.actions.l; break;
      }
      break;
    case 1: // number 2
      switch(data.turn % 10){
        case 0: person.position.x += 12.5; data.rotationRemain=(-Math.PI/2); data.nextAction = data.actions.r; break;
        case 1: person.position.z += 12.5; data.rotationRemain=(-Math.PI/2); data.nextAction = data.actions.r; break;
        case 2: person.position.x -= 12.5; data.rotationRemain=(-Math.PI/2); data.nextAction = data.actions.l; break;
        case 3: person.position.z += 12.5; data.rotationRemain=(Math.PI/2); data.nextAction = data.actions.l; break;
        case 4: person.position.x += 12.5; data.nextAction = data.actions.r; break;
        case 5: person.position.x -= 12.5; data.rotationRemain=(-Math.PI/2); data.nextAction = data.actions.r; break;
        case 6: person.position.z -= 12.5; data.rotationRemain=(Math.PI/2); data.nextAction = data.actions.l; break;
        case 7: person.position.x += 12.5; data.rotationRemain=(Math.PI/2); data.nextAction = data.actions.l; break;
        case 8: person.position.z -= 12.5; data.rotationRemain=(Math.PI/2); data.nextAction = data.actions.l; break;
        case 9: person.position.x -= 12.5; data.nextAction = data.actions.r; break;
      }
      break;
    case 2: // number 0
      switch(data.turn % 4){
        case 0: person.position.z += 25; data.nextAction = data.actions.r; break;
        case 1: person.position.x -= 12.5; data.rotationRemain=(-Math.PI); data.nextAction = data.actions.f; break;
        case 2: person.position.z -= 25; data.nextAction = data.actions.r; break;
        case 3: person.position.x += 12.5; data.rotationRemain=(-Math.PI); data.nextAction = data.actions.f; break;
      }
      break;
  }
  data.turn++;
}

function playSong(){
  let song;
  gltf.scene.traverse((node)=>{
    const name = node.name;
    switch(name){
      case 'song': song = node; break;
    }
  });
  camera.add(song);
  // let scale = 0.07;
  song.scale.set(0.07,0.07,0.07);
  song.position.set(0, -0.7, -1);
  songMixer = new THREE.AnimationMixer(song);
  const actionSong = songMixer.clipAction(
    THREE.AnimationClip.findByName(gltf.animations, 'song'));
  actionSong.play();  
  playingSong = true;
}

function showText(){
  // CREDITS
  const container = document.createElement('div');
  container.id = 'text';
  document.body.appendChild(container);
  const blinker = '<span id="blinker">\u25ae</span>', newline = '<br>';
  const lines = ['In a sea of people','my eyes will always','search for you'];
  let line = 0;
  let typePosition = 0;
  let msg = '';
  container.innerHTML = blinker;
  function typewriter(){
    let str = lines[line];
    if(typePosition == str.length - 1){
      if(line == 2){
        msg += str.substr(typePosition, 1);
        container.innerHTML = msg + blinker;
        setTimeout(()=>{container.style.opacity = '0.2';}, 1000);
      }
      else{
        msg += str.substr(typePosition, 1) + newline;
        container.innerHTML = msg + blinker;
        line++;
        typePosition = 0;
        setTimeout(typewriter, 1000);
      }
    }
    else{
      msg += str.substr(typePosition, 1);
      container.innerHTML = msg + blinker;
      typePosition++;
      setTimeout(typewriter, 150);
    }
  }
  setTimeout(typewriter, 1000);
  container.addEventListener('mouseup', handleMouseUp, false);
  container.addEventListener("touchend", handleTouchEnd, false);
}

function showCaptainLog(){
  const day1 = new Date(2021, 5, 2); // '2021-06-02'
  const dayn = Math.ceil((Date.now() - day1) / (1000 * 60 * 60 * 24));
  const str = 'Captain\'s log:<br><span id="day">Day</span> <span id="number">' + dayn + '</span>';

  const container = document.createElement('div');
  container.id = 'log';
  container.innerHTML = str;
  document.body.appendChild(container);
  // container.addEventListener('mousedown', handleMouseDown, false);
  // container.addEventListener("touchstart", handleTouchStart, false);
}

function addHealthBar(index, texture, visible){
  const material = new THREE.SpriteMaterial({map:texture, sizeAttenuation:false, fog:false});
  const imageWidth = material.map.image.width;
  const imageHeight = material.map.image.height;
  const scale = 0.0003;
  const sprite = new THREE.Sprite( material );
  // sprite.center.set(0.5, 0.5);
  sprite.position.set(0, 0.06, -0.1);
  sprite.scale.set(imageWidth * scale, imageHeight * scale, 1);
  sprite.material.rotation = Math.PI / -2;
  sprite.visible = visible;
  health[index] = sprite;
  cameraGroup.add( sprite );
}

// HANDLE MOUSE EVENTS
function onMouseDown(clientX, clientY){
  if(itemsToLoad != 0){ return; }
  const intersects = [];
  switch(stage){
    case 0:
      if(step > 0){ return; }
      step = 1;
      break;
    case 1:
      mousePos.x = (clientX / WIDTH) * 2 - 1;
      mousePos.y = -(clientY / HEIGHT) * 2 + 1;
      raycaster.setFromCamera( mousePos, camera );
      targetBox.raycast(raycaster, intersects);
      if(intersects.length > 0){
        targetBox.removeFromParent();
        loadStage_2();
        return;
      }
      people.forEach((person)=>{
        person.userData.action.timeScale = 0.04 * person.userData.animationSpeed;
      });
      slowmo = true;
      mouseDown = true;
      break;
    case 2: 
      if(playingSong){
        mousePos.x = (clientX / WIDTH) * 2 - 1;
        mousePos.y = -(clientY / HEIGHT) * 2 + 1;
        raycaster.setFromCamera( mousePos, camera );
        raycaster.intersectObjects(balloons, true, intersects);
        if(intersects.length > 0){
          let balloon = intersects[0].object.parent;
          balloon.userData.speed = 0.3;
        }
      }
      break;
    case 3:
      if(cameraGroup.userData.count > 0){
        mousePos.x = (clientX / WIDTH) * 2 - 1;
        mousePos.y = -(clientY / HEIGHT) * 2 + 1;
        mouseDown = true;
      }
      break;
  }
}

function onMouseUp(){
  if(itemsToLoad != 0){ return; }
  switch(stage){
    case 0:break;
    case 1:
      people.forEach((person)=>{
        person.userData.action.timeScale = person.userData.animationSpeed;
      });
      slowmo = false;
      mouseDown = false;
      break;
    case 2:
      if(canPlaySong && !playingSong){
        document.getElementById('text').remove();
        playSong();
        createBalloons();
      } 
      break;
    case 3:
      if(mouseDown && !mouseMove){
        raycaster.setFromCamera( mousePos, camera );
        const intersects = raycaster.intersectObjects(scene.children, true);
        if(intersects.length > 0){
          let box = intersects[0].object;
          switch(box.userData.type){
            case 'pouch':
              if(cameraGroup.userData.person){
                moveHeart2OriginalPosition(cameraGroup.userData.person);
                cameraGroup.userData.person = null;
              }
              break;
            case 'person':
              if(cameraGroup.userData.person){
                if(cameraGroup.userData.person == box.userData.person){
                  moveHeart2Person(cameraGroup.userData.person);
                  cameraGroup.userData.person = null;
                }
              }
              break;
            case 'heart':
              if(box.userData.person.userData.heartState != 0){ return; }
              if(cameraGroup.userData.person){
                moveHeart2OriginalPosition(cameraGroup.userData.person);
              }
              moveHeart2Pouch(box.userData.person);
              cameraGroup.userData.person = box.userData.person;
              break;
          }
        }
      }
      mouseMove = false;
      mouseDown = false;
      break;
  }
}

function onMouseMove(clientX) {
  if(!mouseDown) { return; }
  switch(stage){
    case 0:break;
    case 1:
      let tx = -1 + (clientX / WIDTH)*2;
      let lr = mousePos.x - tx;
      camera.position.x += lr * 30;
      let bound = 72;
      if(camera.position.x < -bound){camera.position.x = -bound;}
      else if(camera.position.x > bound){camera.position.x = bound;}
      mousePos.x = tx;
      break;
    case 2:break;
    case 3:
      let nx = -1 + (clientX / WIDTH)*2;
      let p = (mousePos.x - nx) * 30 + camera.position.x;
      let bl = 36, br = 40;
      if(p < -bl){p = -bl;}
      else if(p > br){p = br;}
      camera.position.x = p;
      mousePos.x = nx;
      mouseMove = true;
      break;
  }
}

function handleMouseDown(event){
  event.preventDefault();
  event.stopImmediatePropagation();
  onMouseDown(event.clientX, event.clientY);
}

function handleMouseUp(event){
  event.preventDefault();
  event.stopImmediatePropagation();
  onMouseUp();
}

function handleMouseMove(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  onMouseMove(event.clientX);
}

function handleTouchStart(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  onMouseDown(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
}

function handleTouchMove(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  onMouseMove(event.targetTouches[0].clientX);
}

function handleTouchEnd(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  onMouseUp();
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function createBalloons(){
  const pos = people[0].position;
  for(let i = 0; i < 10; i++){
    let m = new THREE.MeshPhongMaterial({color: Math.random() * 0xaf62ff,shininess: 10});
    let g = new THREE.SphereGeometry(0.5);
    let b = new THREE.Mesh(g, m);

    let t = new THREE.Mesh(
      new THREE.BoxGeometry(), 
      new THREE.MeshBasicMaterial({transparent:true, opacity:0}));
    t.layers.set( 1 );
    b.add( t );

    b.position.set(
      pos.x + Math.random()*8-4,
      Math.random()*10 - 13,
      pos.z + (Math.random() < 0.5 ? Math.random()+1 : Math.random()-2));
    b.userData = {speed: Math.random() * 0.05 + 0.01};
    balloons.push(b);
    scene.add(b);
  }
}

function randFloat(a, b){
  return Math.random() * (b - a) + a;
}

function lerp(a, b, x){
  return a + (b - a) * x;
}

function easeInBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * x * x * x - c1 * x * x;
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeInElastic(x) {
  const c4 = Math.PI;
  return x === 0
    ? 0
    : x === 1
    ? 1
    : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function animate(){
  let delta = clock.getDelta();
  runTime += delta;
  if(stage == 0){
    if(itemsToLoad == 0){ //loadStage_3();//loadStage_1(); ///////////////////////
      health[0].material.opacity= (Math.sin(runTime*5) + 1) * 0.5;
      earth.rotateY(spinSpeed);
      if(step > 0){
        if(zoomCount==0){
          if(step <= 100){
            let alpha = step/100;
            alpha = easeInOutCubic(alpha);
            let camZ = lerp(100, 3.2, alpha);
            let ampX = lerp(25, 5, alpha);
            let ampY = lerp(15, 5, alpha);
            let camX = Math.sin(2 * Math.PI * alpha) * ampX;
            let camY = -Math.sin(4 * Math.PI * alpha) * ampY;
            camera.position.set(camX, camY, camZ);
            step++;
          }
          else{
            step = 0; zoomCount++; spinSpeed = 0.01;
          }
        }
        else{
          if(step <= 50){
            let alpha = step/50;
            alpha = easeInElastic(alpha);
            camera.position.z = lerp(3.2, 0.5, alpha);
            if(step == 50){document.getElementById('log').remove();}
            step++;
          }
          else{
            const today = new Date();
            const month = today.getMonth();
            if(month == 2){ loadStage_1(); }
            else{ loadStage_3(); }
          }
        }
      }
    }
  }
  else if(stage == 1){
    if(itemsToLoad == 0){ //loadStage_2(); //////////////////////////////
      let dist = camera.position.distanceTo(people[0].position);
      let bar;
      if(dist > 50){bar = 0;}
      else if(dist > 40){bar = 1;}
      else if(dist > 30){bar = 2;}
      else if(dist > 20){bar = 3;}
      else if(dist >= 0){bar = 4;}
      for(let i = 0; i < 5; i++){
        if(bar == i){
          health[i].visible = true;
          health[i].material.opacity= (Math.sin(runTime*(i+5)) + 1) * 0.5;}
        else{health[i].visible = false;}
      }
      
      people.forEach((person)=>{
        person.userData.mixer.update(delta);
        if(person.position.z > 0){
          //back to start
          person.position.z = horizon;
        }
        else{
          //advance
          person.translateZ(person.userData.movementSpeed * person.userData.action.timeScale);
        }
      });
    }
  }
  else if(stage == 2){
    const person = people[0];

    // heart
    if(itemsToLoad == 0){
      if(beatingHeart){
        let hd = heart.userData;
        hd.elapsed += delta;
        
        if(lastBeat){
          if(hd.elapsed < 2){}
          else if(hd.elapsed < 5){
            let alpha = (hd.elapsed - 2) / 1.6;
            if(alpha > 1){alpha = 1;}
            heart.position.lerpVectors(hd.origin, hd.near, easeInOutCubic(alpha));
          }
          else if(hd.elapsed < 17){
            if(hd.beats == 0){
              hd.beats = 1;
              showText();
            }
            else{
              heart.material.opacity = 1 - (hd.elapsed - 5) / 12;
            }
          }
          else {
            heart.material.opacity = 0;
            beatingHeart = false;
            canPlaySong = true;
          }
        }
        else{
          if(hd.elapsed < 0.15){
            let alpha = hd.elapsed / 0.15;
            heart.position.lerpVectors(hd.origin, camera.position, alpha);
            let scale = lerp(hd.small, hd.big, alpha);
            let size = hd.size;
            heart.scale.set(scale * size.x, scale * size.y, 1);
          }
          else if(hd.elapsed < 0.55){
            let alpha = (hd.elapsed - 0.15) / 0.3;
            heart.position.lerpVectors(hd.origin, camera.position, alpha);
            let scale = lerp(hd.small, hd.big, alpha);
            let size = hd.size;
            heart.scale.set(scale * size.x, scale * size.y, 1);
          }
          else if(hd.elapsed < 0.8){
            let alpha = (hd.elapsed - 0.55) / 0.2;
            if(alpha > 1) { alpha = 1; }
            alpha = easeInOutCubic(alpha);
            if(hd.beats == 0) {alpha = alpha * 0.5;}
            else {alpha = alpha * 0.5 + 0.5;}
            camera.quaternion.slerpQuaternions(camQStart, camQStop, alpha);
          }
          else if(hd.elapsed > (0.8 + hd.pause)){
            if(hd.beats == 1){panningCamera = true;}
            hd.elapsed = 0;
            hd.beats++;
          }
        }

        // move camera
        if(panningCamera){
          camElapsed += delta;
          if(camElapsed < camDuration){
            let alpha = camElapsed / camDuration;
            alpha = easeInBack(alpha);
            camera.position.lerpVectors(camStart, camStop, alpha);
            camera.position.y += Math.sin(camElapsed * 14) * 0.5;
            if(alpha > 0.5) {hd.pause = 100; heart.material.opacity = 0;}
          }
          else if(camElapsed < camDuration + 4){
            let alpha = (camElapsed - camDuration) / 4;
            if(camStart.x - camStop.x > 0){
              camera.position.set(
                camStop.x - Math.sin(2 * Math.PI * alpha) * 4,
                camStop.y + Math.sin(camElapsed * 14) * 0.2,
                camStop.z - Math.sin(Math.PI * alpha) * 8);
            }
            else{
              camera.position.set(
                camStop.x + Math.sin(2 * Math.PI * alpha) * 4,
                camStop.y + Math.sin(camElapsed * 14) * 0.2,
                camStop.z - Math.sin(Math.PI * alpha) * 8);
            }
          }
          else{
            if(hd.pause == 100){
              camera.position.copy(camStop);
              camera.position.y += Math.sin(camElapsed * 14) * 0.2;
              camStart.copy(camera.position);
              hd.pause = 200;
            }
            else{
              let alpha = (camElapsed - camDuration - 4) / 0.2;
              if(alpha < 1){
                camera.position.y = lerp(camStart.y, camStop.y, alpha);
              }
              else{
                camera.position.y = camStop.y;
                panningCamera = false;
                lastBeat = true;
                hd.beats = 0;
                hd.elapsed = 0;
                let scale = hd.small;
                let size = hd.size;
                heart.scale.set(scale * size.x, scale * size.y, 1);
                heart.material.opacity = 1;
                heart.position.copy(camera.position);
                hd.near.copy(camStop);
                hd.near.z -= 0.15;
              }
            }
          }
          camera.lookAt(camLookat);
        }
      }
    }
    
    // salute
    if(greeting){
      person.userData.mixer.update(delta);
      if(group.children.length > 0){
        if(step%2 == 0){group.children.pop();}
        step++;
      }
    }
    else{
      const dist = camera.position.distanceTo(camLookat);
      if(dist < 8){
        greeting = true; 
        camera.remove(cameraGroup);
        step = 0;
      }
    }
    // scene.remove(group);

    // song
    if(playingSong){
      songMixer.update(delta);
      const pos = person.position;
      balloons.forEach((b)=>{
        if(b.position.y > 7){
          b.position.set(
            pos.x + Math.random()*8-4,
            -3,
            pos.z + (Math.random() < 0.5 ? Math.random()+1 : Math.random()-2));
          b.userData.speed = Math.random() * 0.05 + 0.01;
        }
        else{b.position.y+=b.userData.speed;}
      });
    }
  }
  else if(stage == 3){
    if(itemsToLoad == 0){
      const cd = cameraGroup.userData;

      people.forEach((person)=>{
        const data = person.userData;
        data.mixer.update(delta);
        if(data.heart){
          let heart = data.heart, period, scale, alpha;
          switch(data.heartState){
            case 0: // original position
              heart.position.copy(data.heartPosition);
              period = runTime*3;
              heart.position.y += Math.sin(period) * 0.3;
              scale = Math.sin(period) * 0.1 + 2;
              heart.scale.set(scale,scale,scale);
              heart.material.emissiveIntensity = (-Math.sin(period) + 1) * 0.5;
              break;
            case 1: // in pouch
              period = runTime*3;
              scale = Math.sin(period) * 0.1 + 2;
              heart.scale.set(scale,scale,scale);
              break;
            case 2: // transit to pouch
              cd.pouchIntersect.getWorldPosition(heart.position);
              data.heartElapsed += delta;
              alpha = data.heartElapsed / 0.2;
              if(alpha < 1){
                heart.position.lerpVectors(data.heartPosition, heart.position, alpha);
                heart.position.y -= Math.sin(alpha * Math.PI) * 2;
              }
              else{
                cd.pouchIntersect.add(heart);
                heart.position.set(0,0,0);
                data.heartElapsed = 0;
                data.heartState = 1;
              }
              break;
            case 3: // transit to original position
              cd.pouchIntersect.getWorldPosition(heart.position);
              data.heartElapsed += delta;
              alpha = data.heartElapsed / 0.2;
              if(alpha < 1){
                heart.position.lerpVectors(heart.position, data.heartPosition, alpha);
                heart.position.y += Math.sin(alpha * Math.PI) * 5;
              }
              else{
                heart.position.copy(data.heartPosition);
                data.heartElapsed = 0;
                data.heartState = 0;
              }
              break;
            case 4: // transit to person
              cd.pouchIntersect.getWorldPosition(heart.position);
              let pos = person.position.clone();
              pos.y += 0.5;
              data.heartElapsed += delta;
              alpha = data.heartElapsed / 2;
              if(alpha < 1){
                heart.position.lerpVectors(heart.position, pos, alpha);
                heart.position.y += Math.sin(alpha * Math.PI) * 14;
                heart.rotateY(0.2);
                if(alpha > 0.5){
                  let beta = (alpha-0.5)*2;
                  heart.rotateY(lerp(0, 0.4, beta));
                  scale = lerp(2, 0.5, beta);
                  heart.scale.set(scale,scale,scale);
                }
              }
              else{
                scene.remove(heart);
                data.heart = null;
                beHappy(person);
              }
              break;
          }
        }
        else if(data.numberRising){
          data.numberElapsed += delta;
          let elapsed = data.numberElapsed;
          if(elapsed < 3){
            let alpha = elapsed / 3;
            data.number.position.set(
              data.dancePosition.x + Math.sin(runTime*80) * 0.2,
              lerp(-2, data.dancePosition.y, alpha),
              data.dancePosition.z + Math.sin(runTime*80+1) * 0.2);
            const puffTime = 2.2;
            elapsed -= 3 - puffTime;
            if(elapsed > 0){
              //teleport to stage
              alpha = elapsed / puffTime;
              const s = lerp(0.6, 1.2, alpha);
              data.puff.scale.set(s, s, s);
              data.puff.material.opacity = (Math.sin(Math.PI * (alpha + alpha - 0.5)) + 1) * 0.4;
              person.visible = Math.random() + 0.5 < alpha ? false : true;
            }
          }
          else{
            person.visible = true;
            scene.remove(data.puff);
            data.number.position.copy(data.dancePosition);
            data.numberRising = false;
            startDance(person);
          }
        }
        else if(data.nextAction){
          const rot = data.rotationRemain;
          if(rot != 0){
            let amount = 0.4;
            if(rot > 0){
              if(rot < amount){
                amount = rot;
                data.rotationRemain = 0;
              }
              else{
                data.rotationRemain -= amount;
              }
            }
            else{
              amount = -amount;
              if(rot > amount){
                amount = rot;
                data.rotationRemain = 0;
              }
              else{
                data.rotationRemain -= amount;
              }
            }
            person.rotateY(amount);
          }
          else{
            data.nextAction.play();
            data.nextAction = null;
          }
        }
      });

      if(cd.count == 0){
        cd.count--;
        camera.remove(cameraGroup);
        camElapsed = 0;
        camStart = camera.position.clone();
        camStop = new THREE.Vector3(0, 100, 23);
        camQStart = camera.quaternion.clone();
        camera.position.copy(camStop);
        camera.lookAt(0,0,0);
        camQStop = camera.quaternion.clone();
        camera.position.copy(camStart);
        camera.quaternion.copy(camQStart);
      }
      else if(cd.count == -1){
        camElapsed += delta;
        if(camElapsed < 10){
          if(camElapsed > 2){
            let alpha = (camElapsed - 2) / 8;
            alpha = easeInOutCubic(alpha);
            camera.position.lerpVectors(camStart, camStop, alpha);
            camera.quaternion.slerpQuaternions(camQStart, camQStop, alpha);
          }
        }
        else{
          showFireworks(delta);

          let t = camElapsed - 10;
          camera.position.set(
            camStop.x + Math.sin(t * 0.8) * 2,
            camStop.y + Math.sin(t * 0.4) * 5,
            camStop.z + Math.sin(t * 0.2) * 10
          );
          if(Math.floor(t * 0.2 / Math.PI) % 2 == 0){
            camera.quaternion.copy(camQStop);
          }
          else{
            camera.lookAt(0,0,0);
          }
        }
        
        if(group){
          if(group.scale.x < 0.01){
            scene.remove(group);
            group = null;

            people.forEach((person)=>{
              let a = person.userData.actions;
              a.r.timeScale = 3;
              a.l.timeScale = 3;
              a.f.timeScale = 3;
            });
          }
          else {
            if(camElapsed > 8){
              group.position.x += 0.2;
              group.position.z -= 0.4;
              group.scale.subScalar(0.002);
              group.rotateX(-0.08);
              group.rotation.z = Math.sin((camElapsed - 5) * 4) * 0.6;
            }
            else if(camElapsed > 6.2){
              group.position.y -= 3;
              group.position.z -= 0.5;
              group.rotateX(-0.04);
              group.rotation.z = Math.sin((camElapsed - 5) * 4) * 0.4;
            }
            else if(camElapsed > 5){
              group.position.y -= 0.6;
              group.position.z -= 0.5;
              group.scale.subScalar(0.01);
              group.rotateX(-0.01);
              group.rotation.z = Math.sin((camElapsed - 5) * 4) * 0.2;
            }
          }
        }
      }
    }
  }
  else { return; }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function init(event){
  createScene();
}

window.addEventListener('load', init, false);

import * as THREE from '../js/three.module.js';
import { GLTFLoader } from '../js/GLTFLoader.js';


// THREEJS RELATED VARIABLES

let scene, camera, // disposables = []
textureLoader, gltf, itemsToLoad = 0,
renderer, clock, people, 
step = 0, zoomCount = 0, spinSpeed = 0.03, 
horizon = -56, health, raycaster, targetBox, earth, group, cameraGroup, 
greeting = false, songMixer, heart, beatingHeart = false, lastBeat = false,
camStart, camStop, camLookat, camDuration = 0, camElapsed = 0, panningCamera = false,
camQStart, camQStop, canPlaySong = false, playingSong = false, runTime = 0, balloons = [],

//SCREEN & MOUSE VARIABLES

HEIGHT, WIDTH, mousePos, 
mouseDown = false, 
//personFound = false, 
slowmo = false,
stage = -1,
tpCache = [];

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  // const color = 'lightblue';
  // scene.background = new THREE.Color(color);
  // scene.fog = new THREE.FogExp2(color, 0.04);
  // scene.fog = new THREE.Fog(color, 50,55);

  // sceneOrtho = new THREE.Scene();

  // LIGHTS
  let hemisphereLight = new THREE.HemisphereLight(); //(0xaaaaaa,0x000000, 1)
  let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  // directionalLight.position.set(1, 1, 1).normalize();
  // directionalLight.castShadow = true;
  // directionalLight.shadow.camera.left = -400;
  // directionalLight.shadow.camera.right = 400;
  // directionalLight.shadow.camera.top = 400;
  // directionalLight.shadow.camera.bottom = -400;
  // directionalLight.shadow.camera.near = 1;
  // directionalLight.shadow.camera.far = 1000;
  // directionalLight.shadow.mapSize.width = 2048;
  // directionalLight.shadow.mapSize.height = 2048;

  // hemisphereLight.layers.enable( 1 );
  // directionalLight.layers.enable( 1 );
  scene.add(hemisphereLight);
  scene.add(directionalLight);

  // CAMERA
  let aspectRatio = WIDTH / HEIGHT;
  let fieldOfView = 70;
  let nearPlane = 0.1;
  let farPlane = 1000;
  camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
  // camera.position.set(0, 6, 0);
  // camera.lookAt(0, 0, -20);
  // camera.layers.enable( 1 );
  camera.layers.enable( 1 );
  scene.add(camera);

  raycaster = new THREE.Raycaster();
  raycaster.layers.set( 1 );

  // let left = - WIDTH / 2,
  // right = WIDTH / 2,
  // top = HEIGHT / 2,
  // bottom = - HEIGHT / 2,
  // near = 1,
  // far = 10;
  // cameraOrtho = new THREE.OrthographicCamera(left,right,top,bottom,near,far);
  // cameraOrtho.position.z = 10;

  // HUD
  textureLoader = new THREE.TextureLoader();
  health = new Array(5);
  

  // raycaster = new THREE.Raycaster();
  // raycaster.layers.set( 1 );
  const gltfLoader = new GLTFLoader(); //.setPath( 'models/' );
  gltfLoader.load( 'models/model.glb', 
    function ( results ) {
      gltf = results;
      loadStage_0();
      //console.log(gltf);
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
  // renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  let container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  mousePos = new THREE.Vector2();
  container.addEventListener('mousedown', handleMouseDown, true);
  container.addEventListener('mouseup', handleMouseUp, true);
  container.addEventListener('mousemove', handleMouseMove, true);
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

  group.add(atmosphere);
  group.add(earth);

  camera.position.set(0, 0, 100);

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


  let model, name01, name02, face01, faces = [], hat, ground; //earth, atmosphere;
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
  // const clipIdle = THREE.AnimationClip.findByName(clips, 'idle');
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
    // face.position.z=0.15;
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
    let whatAction = getRandomInteger(0, nAnimations), action, speed;
    switch(whatAction){
      case 0:
        action = mixer.clipAction(clipWalk); speed = 1; break;
      case 1:
        action = mixer.clipAction(clipWalk); speed = 1.4; break;
      case 2:
        action = mixer.clipAction(clipRun); speed = 1.7; break;
    }
    action.timeScale = speed;
    action.play();
    mixer.setTime(3 * Math.random());

    
    loc = locs[currentIndex];
    person.position.x = loc % xLen + x0;
    person.position.z = Math.floor(loc/xLen) + z0;
    currentIndex--;

    person.userData = {mixer:mixer, action:action, speed:speed};
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
  // scene.remove(group);
  // group = new THREE.Group();
  // scene.add(group);

  // console.log(gltf);

  const person = people[0];
  itemsToLoad++;
  textureLoader.load('texture/heart.png', (texture) => {
    const material = new THREE.SpriteMaterial({
      map:texture, transparent:true, opacity:0.5, fog:false //sizeAttenuation:false
    });
    heart = new THREE.Sprite(material);
    heart.center.set(0.5, 0.5);
    
    const pos = person.position.clone();
    pos.y += 0.2; pos.z += 0.5;
    heart.position.copy(pos);
    
    const big = 0.003, small = 0.0001;
    const size = new THREE.Vector3(material.map.image.width,material.map.image.height,1);
    heart.scale.set(small * size.x, small * size.y, 1);

    heart.userData = {
      origin:pos, size:size, big:big, small:small, 
      duration: 0.4, elapsed: 0, beats: 0, near: new THREE.Vector3()
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
  container.addEventListener('mouseup', handleMouseUp, true);
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
function handleMouseDown(event){
  event.preventDefault();
  if(mouseDown || itemsToLoad != 0){ return; }
  mousePos.x = (event.clientX / WIDTH) * 2 - 1;
  mousePos.y = -(event.clientY / HEIGHT) * 2 + 1;
  raycaster.setFromCamera( mousePos, camera );
  const intersects = [];
  switch(stage){
    case 0:
      if(step > 0){ return; }
      step = 1;
      break;
    case 1:
      targetBox.raycast(raycaster, intersects);
      if(intersects.length > 0){
        targetBox.removeFromParent();
        loadStage_2();
        return;
      }
      people.forEach((person)=>{
        person.userData.action.timeScale = 0.04 * person.userData.speed;
      });
      slowmo = true;
      break;
    case 2: break;
  }
  
  mouseDown = true;
}

function handleMouseUp(event){
  event.preventDefault();
  if(itemsToLoad != 0){ return; }
  switch(stage){
    case 0:break;
    case 1:
      people.forEach((person)=>{
        person.userData.action.timeScale = person.userData.speed;
      });
      slowmo = false;
      break;
    case 2:
      if(canPlaySong && !playingSong){
        document.getElementById('text').remove();
        playSong();
        createBalloons();
      } 
      break;
  }
  mouseDown = false;
}

function handleMouseMove(event) {
  event.preventDefault();
  if(!mouseDown) { return; }
  switch(stage){
    case 0:break;
    case 1:
      let tx = -1 + (event.clientX / WIDTH)*2;
      // let ty = 1 - (event.clientY / HEIGHT)*2;

      let lr = mousePos.x - tx;
      // let ud = mousePos.y - ty;

      camera.position.x += lr * 30;
      let bound = 72;
      if(camera.position.x < -bound){camera.position.x = -bound;}
      else if(camera.position.x > bound){camera.position.x = bound;}
      mousePos.x = tx;
      // mousePos.y = ty;
      break;
    case 2:break;
  }
}

function handleTouchStart(ev) {
  if (stage==1 && ev.targetTouches.length == 2) {
    ev.preventDefault();
    tpCache = [ev.targetTouches[0], ev.targetTouches[1]];
    people.forEach((person)=>{
      person.userData.action.timeScale = 0.04 * person.userData.speed;
    });
    slowmo = true;
  }
}

function handleTouchMove(ev) {
  if(stage == 1 && ev.touches.length == 2 && ev.targetTouches.length == 2 && ev.changedTouches.length == 2) {
    ev.preventDefault();
    let point1=-1, point2=-1;
    for (let i=0; i < tpCache.length; i++) {
      if (tpCache[i].identifier == ev.targetTouches[0].identifier) point1 = i;
      if (tpCache[i].identifier == ev.targetTouches[1].identifier) point2 = i;
    }
    if (point1 >=0 && point2 >= 0) {
      // Calculate the difference between the start and move coordinates
      let diff1 = Math.abs(tpCache[point1].clientX - ev.targetTouches[0].clientX);
      let diff2 = Math.abs(tpCache[point2].clientX - ev.targetTouches[1].clientX);

      if (Math.abs(diff1-diff2) < ev.target.clientWidth / 10){
        let lr;
        if(diff1 > diff2){
          lr = (tpCache[point1].clientX - ev.targetTouches[0].clientX) * 2/WIDTH;
        }
        else{
          lr = (tpCache[point2].clientX - ev.targetTouches[1].clientX) * 2/WIDTH;
        }

        camera.position.x += lr * 2;
        let bound = 72;
        if(camera.position.x < -bound){camera.position.x = -bound;}
        else if(camera.position.x > bound){camera.position.x = bound;}
        
        tpCache[point1].clientX = ev.targetTouches[0].clientX;
        tpCache[point2].clientX = ev.targetTouches[1].clientX;
      }
    }
  }
}

function handleTouchEnd(ev) {
  if (stage==1 && tpCache.length!=0) {
    ev.preventDefault();
    if(ev.targetTouches.length == 0){
      tpCache = [];
      people.forEach((person)=>{
        person.userData.action.timeScale = person.userData.speed;
      });
      slowmo = false;
    }
  }
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
    b.position.set(
      pos.x + Math.random()*8-4,
      Math.random()*10 - 13,
      pos.z + (Math.random() < 0.5 ? Math.random()+1 : Math.random()-2));
    b.userData = {speed: Math.random() * (0.06 - 0.01) + 0.01};
    balloons.push(b);
    scene.add(b);
  }
}

function animate(){
  let delta = clock.getDelta();
  runTime += delta;
  if(stage == 0){
    if(itemsToLoad == 0){ //loadStage_1(); ///////////////////////
      health[0].material.opacity= (Math.sin(runTime*5) + 1) * 0.5;
      earth.rotateY(spinSpeed);
      if(step > 0){
        if(step <= 50){
          if(zoomCount==0){
            let camZ = lerp(100, 3.2, easeOutCubic(step/50));
            // let camZ = lerp(100, 3.2, step/50);
            let s = 2*Math.PI / -96.8;
            let t = s * (camZ - 100);
            let camX = Math.sin(t) * 10;
            camera.position.set(camX, 0, camZ);
          }
          else{
            //second click
            camera.position.z = lerp(3.2, 0.5, step/50);
          }
          step++;
        }
        else if(zoomCount == 1){ loadStage_1(); }
        else{step = 0; zoomCount++; spinSpeed = 0.01;}
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
      // console.log(bar);
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
          if(slowmo){person.translateZ(0.05 * person.userData.action.timeScale);}
          else{person.translateZ(0.05 * person.userData.speed);}
        }
      });
    }
  }
  else if(stage == 2){
    const person = people[0];

    // heart
    if(itemsToLoad == 0){
      if(beatingHeart){
        let hd = heart.userData, alpha;
        hd.elapsed += delta;
        
        if(lastBeat){
          if(hd.elapsed < 1.6){
            alpha = hd.elapsed / 1.6;
            heart.position.lerpVectors(hd.origin, hd.near, easeOutBack(alpha));
            camera.position.y = lerp(camStart.y, camStop.y, alpha);
            camera.lookAt(camLookat);
          }
          else if(hd.elapsed < 3){
            if(hd.beats == 0){
              hd.beats = 1;
              heart.position.copy(hd.near);
              camera.position.y = camStop.y;
              camera.lookAt(camLookat);
            }
          }
          else if(hd.elapsed < 15){
            if(hd.beats == 1){
              hd.beats = 2;
              showText();
            }
            else{
              heart.material.opacity = 1 - (hd.elapsed - 3) / 12;
            }
          }
          else {
            heart.material.opacity = 0;
            beatingHeart = false;
            canPlaySong = true;
          }
        }
        else{
          alpha = hd.elapsed / hd.duration;
          if(alpha < 1.5){
            heart.position.lerpVectors(hd.origin, camera.position, alpha);
            let scale = lerp(hd.small, hd.big, alpha);
            let size = hd.size;
            heart.scale.set(scale * size.x, scale * size.y, 1);
          }
          else if(alpha < 2){
            switch(hd.beats){
              case 0: 
                camera.quaternion.slerpQuaternions(camQStart, camQStop, alpha - 1.5);
                break;
              case 1: 
                camera.quaternion.slerpQuaternions(camQStart, camQStop, alpha - 1);
                break;
            }
          }
          else if(alpha < 3.5){
            switch(hd.beats){
              case 0: 
                camera.quaternion.slerpQuaternions(camQStart, camQStop, 0.5);
                break;
              case 1: 
                camera.quaternion.copy(camQStop);
                panningCamera = true;
                break;
            }
          }
          else {
            hd.elapsed = 0;
            hd.beats++;
          }
        }

        // move camera
        if(panningCamera){
          camElapsed += delta;
          let alpha = camElapsed / camDuration;
          if(alpha >= 1) {
            alpha = 1;
            camStart.copy(camera.position);
            panningCamera = false;
            lastBeat = true;
            hd.beats = 0;
            hd.elapsed = 0;
            let scale = hd.small;
            let size = hd.size;
            heart.scale.set(scale * size.x, scale * size.y, 1);
            heart.material.opacity = 1;
            hd.near.copy(camStop);
            hd.near.z -= 0.15;
          }
          else if(alpha > 0.66) {hd.duration = 0.2;}
          else if(alpha > 0.33) {hd.duration = 0.3;}

          camera.position.lerpVectors(camStart, camStop, easeInOutBack(alpha));
          camera.position.y += Math.sin(camElapsed * 14) * 0.5;
          camera.lookAt(camLookat);
        }
      }
    }
    
    // salute
    if(greeting){
      person.userData.mixer.update(delta);
      if(group.children.length > 0){group.children.pop();}
    }
    else{
      const dist = camera.position.distanceTo(camLookat);
      if(dist < 8){
        greeting = true; 
        camera.remove(cameraGroup);
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
          b.userData.speed = Math.random() * (0.06 - 0.01) + 0.01;
        }
        else{b.position.y+=b.userData.speed;}
      });
    }
  }
  else { return; }

  // renderer.render(sceneOrtho, cameraOrtho);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function lerp(a, b, x){
  return a + (b - a) * x;
}

function easeInOutBack(x){
  const c2 = 1.525;
  return (x < 0.5
    ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2);
}

function easeOutCubic(x){
  return 1 - Math.pow(1 - x, 3);
}

function easeOutBack(x) {
  return 1 + Math.pow(x - 1, 3) ;
}

function init(event){
  createScene();
}

window.addEventListener('load', init, false);

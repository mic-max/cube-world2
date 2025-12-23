import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as dat from 'dat.gui';

const gui = new dat.GUI();

// Create Renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x111111 );

// Create Camera + Controls
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(53, 20, 87);
controls.autoRotate = true;
controls.autoRotateSpeed = 19;
controls.target.set(1, 1, 5)
controls.update();

// Create Lights
const ambientLight = new THREE.AmbientLight( 0xBBBBBB );
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light.position.set(0, 1, 1);
light.target.position.set(0, 0, 0);
light.castShadow = true;
scene.add(light);

const light2 = new THREE.DirectionalLight(0xFFAAAA, 0.5);
light2.position.set(1, 0.2, 1);
light2.target.position.set(0, 0, 0);
light2.castShadow = true;
scene.add(light2);

const light3 = new THREE.DirectionalLight(0xAAAAFF, 0.5);
light3.position.set(-1, 0.2, 1);
light3.target.position.set(0, 0, 0);
light3.castShadow = true;
scene.add(light3);

// const helper = new THREE.DirectionalLightHelper( light, 5 );
// scene.add( helper );
// const helper2 = new THREE.DirectionalLightHelper( light2, 5 );
// scene.add( helper2 );
// const helper3 = new THREE.DirectionalLightHelper( light3, 5 );
// scene.add( helper3 );

// const size = 10;
// const divisions = 10;

// const gridHelper = new THREE.GridHelper( size, divisions );
// scene.add( gridHelper );

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// Main Code
let materials = {};
let groups = {};
const box = new THREE.BoxGeometry(1, 1, 1);
const select = document.getElementById('select');
const logPositionsButton = document.getElementById('positionLog');

select.addEventListener('change', changeEntity);
logPositionsButton.addEventListener('click', logPositions);
loadOptions("alpaca");
// const stats = new Stats()
// document.body.appendChild(stats.dom)

// TODO: play location's music, sounds? bird chirps, cricket etc. Skybox
animate();

// Helper Functions
function animate() {
	controls.update();
	renderer.render(scene, camera);
	
	// stats.update()
	requestAnimationFrame(animate);
}

function logPositions() {
	let result = {}
	for (const [partName, part] of Object.entries(groups)) {
		result[partName] = []
		for (let x of part) {
			result[partName].push([x.position.x, x.position.y, x.position.z])
		}
	}
	console.log(JSON.stringify(result))
}

function convertIndexToXYZ(sizeX, sizeY, idx) {
    const z = Math.floor(idx / (sizeX * sizeY));
    const remaining = idx % (sizeX * sizeY);
    const y = Math.floor(remaining / sizeX);
    const x = remaining % sizeX;
    return [x, z, y];
}

function loadOptions(selectMe) {
	const response = fetch(`http://localhost:3000/names`)
	.then(data => data.json())
	.then(res => {
		for (const entityName of res) {
			select.appendChild(new Option(entityName, entityName, null, entityName === selectMe));
		}
		// add dropdown for variations? lots of entities have number suffixes
		// or colours. eg. brown alpaca
		changeEntity();
	})
}

function loadEntity(name) {
	const response = fetch(`http://localhost:3000/entities?name=${name}`)
	.then(data => data.json())
	.then(res => {
		const entity = res[0];
		let partNumber = 0;
		clearSliders();
		materials = {}; // Reset Materials Map
		groups = {} // Reset Groups
		for (const [name, part] of Object.entries(entity.parts)) {
			for (let [i, origin] of part.positions.entries()) {
				let group = loadSprite(part.size, part.color, origin)
				if (!(name in groups)) {
					groups[name] = [];
				}
				groups[name].push(group);
				
				// Only load sliders for entities with multiple parts.
				// Don't allow adjustment of body. The other parts should be adjusted instead.
				if (name !== 'x' && name !== 'body') {
					for (let d of ['x', 'y', 'z']) {
						const label = name + (part.positions.length > 1 ? ` ${i}` : '') + ` ${d}`;
						const posDimensionIdx = 'xyz'.indexOf(d)
						createSlider(`range${partNumber}`, label, -20, 20, origin[posDimensionIdx], name, groups[name].length - 1, d);
					}
					partNumber++;
				}
			}
		}
		var aabb = new THREE.Box3().setFromObject( groups.x );
		aabb.getCenter( controls.target );

		controls.target.set(10, 10, 5);
	})
}

function createSlider(inputId, labelText, min, max, value, groupName, indexInGroup, xyOrz) {
	// Add a button to add or remove a sprite
	// show actual x,y,z value.
	// align them across the top in columns
	// each row will be a new instance of the sprite in the column name
	const sliderDiv = document.getElementById("sliders");
	const div = document.createElement("div");

    const rangeInput = document.createElement('input');
    rangeInput.type = 'range';
    rangeInput.id = inputId;
    rangeInput.min = min;
    rangeInput.max = max;
    rangeInput.value = value;
	rangeInput.step = 0.5;
	rangeInput.addEventListener('input', (event) => {
		const spriteGroup = groups[groupName][indexInGroup];
		if (xyOrz === 'x') {
			spriteGroup.position.x = event.target.value;
		} else if (xyOrz === 'y') {
			spriteGroup.position.y = event.target.value;
		} else if (xyOrz === 'z') {
			spriteGroup.position.z = event.target.value;
		}
	})
	
	// TODO: 
	// gui.add(spriteGroup.position.x, 'x');

	const label = document.createElement('label');
    label.textContent = labelText;
	label.for = inputId;

    div.appendChild(rangeInput);
    div.appendChild(label);

	sliderDiv.appendChild(div);
}

function clearSliders() {
	const sliderDiv = document.getElementById("sliders");
	sliderDiv.innerHTML = "";
}

function loadSprite(size, color, origin) {
	const group = new THREE.Group();
	// TODO: mask each sprite with a colour

	for (let i = 0; i < color.length; i++) {
		const c = color[i];

		// No Cube. Internal. c === 0xFF4900
		if (c === 0x000000)
			continue;

		if (!(c in materials)) {
			materials[c] = new THREE.MeshStandardMaterial( { color: c } );
		}

		const cube = new THREE.Mesh( box, materials[c] );
		cube.castShadow = true;
		cube.receiveShadow = true;
		const position = convertIndexToXYZ(size[0], size[1], i);
		cube.position.set(position[0], position[1], position[2])
		group.add(cube);
	}

	group.position.x = origin[0]
	group.position.y = origin[1]
	group.position.z = origin[2]

	scene.add(group)
	return group;
}

function changeEntity() {
	const entityName = select.options[select.selectedIndex].value;
	for (let i = scene.children.length - 1; i >= 0; i--) {
		if(scene.children[i].type === "Group")
			scene.remove(scene.children[i]);
	}
	loadEntity(entityName);
}

# gl-flyCamera
✈️ controls

## Installation

```
$ npm install gl-flyCamera
```

## Example

```javascript
controls = new flyCamera({
	domElement: document, // default: document
	movementSpeed: 100, // default: 10
	rollSpeed: Math.PI, // default: Math.PI / 3
	dragToLook: true, // default: false
	autoForward: true, // default: false
	paused: true, //default: false
	position: [1, 2, 5] //default: [0, 0, 0]
});
controls.start();

var lastTimeStamp = 0;
function renderLoop(timeStamp){
	var delta = timeStamp - lastTimeStamp;
	lastTimeStamp = timeStamp;

	controls.update(delta);
	var currentPosition = controls.position; //current camera position
	var currentOrientation = controls.quaternion; //current camera orientation
	/*

		...doing the actual rendering

	*/
	window.requestAnimationFrame(renderLoop);
}
window.requestAnimationFrame(renderLoop);

```

## Badges

![](https://img.shields.io/badge/license-MIT-blue.svg)
![](https://img.shields.io/badge/status-developing-yellow.svg)

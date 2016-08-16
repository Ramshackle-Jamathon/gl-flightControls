# gl-flyCamera
✈️ controls

## Installation

```
$ npm install gl-flyCamera
```

## Example

```javascript
controls = new flyCamera();
controls.start();

function renderLoop(){
	controls.update();
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

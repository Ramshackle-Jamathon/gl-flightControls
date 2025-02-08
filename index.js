var glMatrix = require('gl-matrix');

var flyCamera = function( opts ) {
	if ( !opts ) opts = {};
	this.domElement = ( opts.domElement !== undefined ) ? opts.domElement : document;
	if ( opts.domElement ) this.domElement.setAttribute( 'tabindex', -1 );

	this.movementSpeed = opts.movementSpeed || 10.0;
	this.rollSpeed = opts.rollSpeed || Math.PI / 3;
	this.dragToLook = opts.dragToLook || false;
	this.autoForward = opts.autoForward || false;
	this.paused = opts.paused || false;
	this.mouseStatus = 0;

	this.tmpQuaternion = glMatrix.quat.create();
	this.moveVector = glMatrix.vec3.create();
	this.rotationVector = glMatrix.vec3.create();


	if (opts.position){
		this.position = glMatrix.vec3.fromValues(opts.position[0], opts.position[1], opts.position[2])
	} else {
		this.position = glMatrix.vec3.create();
	}
	if(opts.quaternion){
		this.quaternion = glMatrix.quat.fromValues(opts.quaternion[0], opts.quaternion[1], opts.quaternion[2], opts.quaternion[3])
	} else {
		this.quaternion = glMatrix.quat.create();
	}

	this.moveState = { 
		up: 0, 
		down: 0, 
		left: 0, 
		right: 0, 
		forward: 0, 
		back: 0, 
		pitchUp: 0, 
		pitchDown: 0, 
		yawLeft: 0, 
		yawRight: 0, 
		rollLeft: 0, 
		rollRight: 0 
	};
}

flyCamera.prototype.keydown = function (event) {
	if ( event.altKey ) {
			return;
	}
	switch ( event.keyCode ) {
		case 16: /* shift */ this.movementSpeedMultiplier = .1; break;
		case 87: /*W*/ this.moveState.forward = 1; break;
		case 83: /*S*/ this.moveState.back = 1; break;
		case 65: /*A*/ this.moveState.left = 1; break;
		case 68: /*D*/ this.moveState.right = 1; break;
		case 82: /*R*/ this.moveState.up = 1; break;
		case 70: /*F*/ this.moveState.down = 1; break;
		case 38: /*up*/ this.moveState.pitchUp = 1; break;
		case 40: /*down*/ this.moveState.pitchDown = 1; break;
		case 37: /*left*/ this.moveState.yawLeft = 1; break;
		case 39: /*right*/ this.moveState.yawRight = 1; break;
		case 81: /*Q*/ this.moveState.rollLeft = 1; break;
		case 69: /*E*/ this.moveState.rollRight = 1; break;
		case 32: /*space*/ this.paused = !this.paused; break;
	}
	this.updateMovementVector();
	this.updateRotationVector();
}

flyCamera.prototype.keyup = function (event) {
	switch ( event.keyCode ) {
		case 16: /* shift */ this.movementSpeedMultiplier = 1; break;
		case 87: /*W*/ this.moveState.forward = 0; break;
		case 83: /*S*/ this.moveState.back = 0; break;
		case 65: /*A*/ this.moveState.left = 0; break;
		case 68: /*D*/ this.moveState.right = 0; break;
		case 82: /*R*/ this.moveState.up = 0; break;
		case 70: /*F*/ this.moveState.down = 0; break;
		case 38: /*up*/ this.moveState.pitchUp = 0; break;
		case 40: /*down*/ this.moveState.pitchDown = 0; break;
		case 37: /*left*/ this.moveState.yawLeft = 0; break;
		case 39: /*right*/ this.moveState.yawRight = 0; break;
		case 81: /*Q*/ this.moveState.rollLeft = 0; break;
		case 69: /*E*/ this.moveState.rollRight = 0; break;
	}
	this.updateMovementVector();
	this.updateRotationVector();
};

flyCamera.prototype.mousemove = function (event) {
	if ( !this.dragToLook || this.mouseStatus > 0 ) {
		var container = this.getContainerDimensions();
		var halfWidth  = container.size[ 0 ] / 2;
		var halfHeight = container.size[ 1 ] / 2;
		this.moveState.yawLeft   = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth;
		this.moveState.pitchDown =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;
		this.updateRotationVector();
	}
};

flyCamera.prototype.mouseleave = function (event) {
	if ( !this.dragToLook || this.mouseStatus > 0 ) {
		this.moveState.yawLeft = this.moveState.pitchDown = 0;
		this.updateRotationVector();
	}
};

flyCamera.prototype.mousedown = function (event) {
	if ( this.domElement !== document ) {
		this.domElement.focus();
	}
	if ( this.dragToLook ) {
		this.mouseStatus ++;
	} else {
		switch ( event.button ) {
			case 0: this.moveState.forward = 1; break;
			case 2: this.moveState.back = 1; break;
		}
		this.updateMovementVector();
	}
};

flyCamera.prototype.mouseup = function (event) {
	if ( this.dragToLook ) {
		this.mouseStatus --;
		this.moveState.yawLeft = this.moveState.pitchDown = 0;
	} else {
		switch ( event.button ) {
			case 0: this.moveState.forward = 0; break;
			case 2: this.moveState.back = 0; break;
		}
		this.updateMovementVector();
	}
	this.updateRotationVector();
};

flyCamera.prototype.update = function (delta) {
	if (!this.paused){
		this.updateMovementVector();
		this.updateRotationVector();

		delta = delta / 1000;

		var moveMult = delta * this.movementSpeed;
		var rotMult  = delta * this.rollSpeed;


		glMatrix.vec3.scale( this.rotationVector, this.rotationVector, rotMult );
		this.tmpQuaternion = glMatrix.quat.fromValues(this.rotationVector[0],this.rotationVector[1],this.rotationVector[2], 1);
		glMatrix.quat.normalize(this.tmpQuaternion,this.tmpQuaternion);
		glMatrix.quat.mul(this.quaternion, this.quaternion, this.tmpQuaternion);

		glMatrix.vec3.scale( this.moveVector, this.moveVector, moveMult );
		glMatrix.vec3.transformQuat( this.moveVector,  this.moveVector, this.quaternion );
		glMatrix.vec3.add( this.position, this.position, this.moveVector );
	}
};

flyCamera.prototype.updateMovementVector = function () {
	if (!this.paused){
		var forward = ( this.moveState.forward || ( this.autoForward && !this.moveState.back ) ) ? 1 : 0;
		this.moveVector = glMatrix.vec3.fromValues(
			-this.moveState.left    + this.moveState.right,
			-this.moveState.down    + this.moveState.up,
			-forward + this.moveState.back
		);
	}
};

flyCamera.prototype.updateRotationVector = function () {
	if (!this.paused){
		this.rotationVector = glMatrix.vec3.fromValues(
			-this.moveState.pitchDown + this.moveState.pitchUp,
			-this.moveState.yawRight  + this.moveState.yawLeft,
			-this.moveState.rollRight + this.moveState.rollLeft
		);
	}
};

flyCamera.prototype.getContainerDimensions = function () {
	if ( this.domElement !== document ) {
		return {
			size  : [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
			offset  : [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
		};
	} else {
		return {
			size  : [ window.innerWidth, window.innerHeight ],
			offset  : [ 0, 0 ]
		};
	}
};

flyCamera.prototype.start = function () {
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); } );
	this.domElement.addEventListener( 'mousemove', this.mousemove.bind(this) );
	this.domElement.addEventListener( 'mouseleave', this.mouseleave.bind(this) );
	this.domElement.addEventListener( 'mousedown', this.mousedown.bind(this) );
	this.domElement.addEventListener( 'mouseup',   this.mouseup.bind(this) );
	window.addEventListener( 'keydown', this.keydown.bind(this) );
	window.addEventListener( 'keyup',   this.keyup.bind(this) );
	this.updateMovementVector();
	this.updateRotationVector();
}

module.exports = flyCamera;

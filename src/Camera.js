import * as Matrix from './gl-matrix.js';

export default class Camera {

    constructor(gl, cameraType) {

        this.gl = gl;

        let viewMatrix = glMatrix.mat4.create();
        glMatrix.mat4.identity(viewMatrix);

        let projMatrix = glMatrix.mat4.create();
        glMatrix.mat4.identity(projMatrix);

        let fovy = 40 * Math.PI / 180;
        glMatrix.mat4.perspective(projMatrix, fovy, gl.canvas.width / gl.canvas.height, 1, 100);

        this.vMatrix = viewMatrix;
        this.pMatrix = projMatrix;

        this.eye = glMatrix.vec3.create();
        glMatrix.vec3.set(this.eye, 0.0, 3.0, 5.0);	//Traditional X,Y,Z 3d position set(out, x, y, z)

        this.center = glMatrix.vec3.create();
        glMatrix.vec3.set(this.center, 0.0, 1.0, 0.0);

        this.up = glMatrix.vec3.create();
        glMatrix.vec3.set(this.up, 0.0, 1.0, 0.0);  //Hold rotation values based on degrees, Object will translate it to radians


        glMatrix.mat4.lookAt(this.vMatrix, this.eye, this.center, this.up);

    }

    //Methods
    activatePerspective() {
        glMatrix.mat4.perspective(this.pMatrix, fovy, gl.canvas.width / gl.canvas.height, 1, 100);
    };

    activateOrtho() {
        glMatrix.mat4.ortho(this.pMatrix, left, right, bottom, top, 0.1, 100)
    };

    updateCameraVectors() {

        let model_translate = glMatrix.vec3.create();
        glMatrix.vec3.set(model_translate, 0, 0, this.dZ);
        //glMatrix.mat4.translate(this.vMatrix, this.vMatrix, model_translate);
        let eyeOld = glMatrix.vec3.clone(this.eye);
        glMatrix.vec3.set(model_translate, 0, 0, this.dZ);
        glMatrix.vec3.add(this.eye, this.eye, model_translate);
        if (this.eye[2] < 1 || this.eye[2] > 10) {
            this.eye = eyeOld;
        } else {
            glMatrix.mat4.lookAt(this.vMatrix, this.eye, this.center, this.up);
        }
    }
};

export class CameraController {

    constructor(gl, camera) {

        let oThis = this;
        this.canvas = gl.canvas;
        this.camera = camera;

        document.addEventListener("keydown", function (e) { oThis.onkeydown(e); });
        document.addEventListener("wheel", function (e) { oThis.onWheel(e); });
    }

    onkeydown = function (e) {

        if (e.key === "ArrowUp") { this.camera.dZ = 0.03; }
        if (e.key === "ArrowDown") { this.camera.dZ = -0.03; }

        this.camera.updateCameraVectors();

    };

    onWheel = function (e) {
        this.camera.dZ = e.wheelDelta * 0.001;
        this.camera.updateCameraVectors();
    };

}




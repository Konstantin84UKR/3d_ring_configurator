import * as Matrix from './gl-matrix.js';
import MouseController from './MouseController.js';
import Camera from './Camera.js';
import { CameraController } from './Camera.js';

import { createPromiseShaderProgram } from './ShaderUtil.js';

import { loadJSON } from './ModelUtil.js';
import { LoadModeltUsingPromise } from './ModelUtil.js';
import { loadBuffer } from './ModelUtil.js';
import { setGeometrySkyBox } from './ModelUtil.js';
import { get_cube_texture_MIPMAP } from './ModelUtil.js';
import { get_cube_texture } from './ModelUtil.js';
import { get_texture } from './ModelUtil.js';

import { loadTextureSet } from './settingLoadTex.js';
import { loadTextureSetMaterial } from './settingLoadTex.js';
import { loadModelSet } from './settingLoadTex.js';
import { loadModelDekor } from './settingLoadTex.js';

import Shader from './ShaderUtil.js';
import { Material } from './ShaderUtil.js';


export default class webGLStart {

    constructor() {

        // Initialize the context
        this.canvas = document.getElementById('canvas_1');
        this.gl = this.canvas.getContext('webgl', { alpha: false, antialias: false });

        try {
            // this.gl.getExtension('OES_standard_derivatives');
            // this.gl.getExtension('EXT_shader_texture_lod');
        } catch (e) {
            alert("You are not webgl compatible :(");
            //return false;
        }

        this.canvas.width = 500;
        this.canvas.height = 500;

        this.InputController = new MouseController(this.gl);
        this.camera = new Camera(this.gl, 1);
        this.cameraController = new CameraController(this.gl, this.camera);

    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async settingRender() {

        //  SKY_BOX shaderProgram ---------------------------------------------------------------//
        this.shader_SkyBox = new Shader();
        this.shader_SkyBox.shaderProgram = await createPromiseShaderProgram(this.gl, 'resource/shaders/vertex_shader_sky_box.glsl', 'resource/shaders/fragment_shader_sky_box.glsl');
        this.shader_SkyBox.getAttribLocation(this.gl);
        this.shader_SkyBox.getUniformLocation(this.gl);

        this.gl.useProgram(this.shader_SkyBox.shaderProgram);
        this.gl.uniform1i(this.shader_SkyBox.samplerTex, 4);
        this.gl.useProgram(null);

        //  MAIN shaderProgram ---------------------------------------------------------------//
        this.shader_Model = new Shader();
        this.shader_Model.shaderProgram = await createPromiseShaderProgram(this.gl, 'resource/shaders/vertex_shaderPBR.glsl', 'resource/shaders/fragment_shaderPBR.glsl');

        this.shaderProgram = this.shader_Model.shaderProgram;
        this.shader_Model.getAttribLocation(this.gl);
        this.shader_Model.getUniformLocation(this.gl);

        this.gl.useProgram(this.shader_Model.shaderProgram);

        this.gl.uniform1i(this.shader_Model.u_sampler, 0);
        this.gl.uniform1i(this.shader_Model.u_samplerNormalMap, 1);
        this.gl.uniform1i(this.shader_Model.u_samplerRoughnessMap, 2);
        this.gl.uniform1i(this.shader_Model.u_samplerMetallicMap, 3);
        this.gl.uniform1i(this.shader_Model.u_irradianceMap, 4);
        this.gl.uniform1i(this.shader_Model.u_sampler_LUT, 5);
        this.gl.uniform1i(this.shader_Model.u_skyBox, 6);
        this.gl.uniform1i(this.shader_Model.u_samplerAOMap, 7);
        this.gl.useProgram(null);
        let XXX;
        //loadJSON(this.gl, 'resource/ring.json', XXX);

        await LoadModeltUsingPromise('resource/ring.json')
            .then(function (data) {
                XXX = data;
                console.log(XXX);
            });
        this.gl.model = XXX;
        // ------------------------ LOAD BUFFER MODEL -----------------------------------------//
        let modelIndex = loadModelSet(this.gl, this.InputController.ring);
        let modelRing = this.InputController.ring;
        let model_1;
        this.ModelMain = loadBuffer(this.gl, this.gl.model.meshes[modelIndex], model_1);
        this.ModelSkyBox = setGeometrySkyBox(this.gl);

        let modelIndexDekor = loadModelDekor(this.gl, this.InputController.dekor);
        let modelDekorName = this.InputController.dekor;
        let model_2;
        this.modelDekor = loadBuffer(this.gl, this.gl.model.meshes[modelIndexDekor], model_2);

        //--------------------------- create TEXTURE ------------------------------------------//

        this.textureSet = loadTextureSet(this.InputController.skybox, this.InputController.skybox_blur);
        this.textureSetNumber = this.InputController.skybox;
        this.skybox_blur = this.InputController.skybox_blur;

        this.tex_SkyBox = get_cube_texture_MIPMAP(this.gl, this.textureSet.textureSetSkyBox);
        this.tex_irradianceMap = get_cube_texture(this.gl, this.textureSet.textureSetirradianceMap);

        this.tex_LUT = get_texture(this.gl, "resource/LUT.png");

        let textureMaterial = loadTextureSetMaterial(this.gl, this.InputController.material);
        let textureMaterialDekor = loadTextureSetMaterial(this.gl, 'plastic');
        this.material = this.InputController.material;

        // GOLD 
        this.mainMaterial = new Material(this.InputController.material);
        this.mainMaterial.settingTextue(textureMaterial);
        // DEKOR
        this.dekorMaterial = new Material('plastic');
        this.dekorMaterial.settingTextue(textureMaterialDekor);


        // ----------------------------- Create MATRIX -----------------------------------------//
        this.PROJMATRIX = glMatrix.mat4.create();
        glMatrix.mat4.identity(this.PROJMATRIX);
        let fovy = 40 * Math.PI / 180;

        glMatrix.mat4.perspective(this.PROJMATRIX, fovy, this.canvas.width / this.canvas.height, 1, 50);

        this.MODELMATRIX = glMatrix.mat4.create();
        this.VIEWMATRIX = glMatrix.mat4.create();
        this.VIEWMATRIX_CAMERA = glMatrix.mat4.create();
        this.NORMALMATRIX = glMatrix.mat4.create();
        this.NORMALMATRIX_HELPER = glMatrix.mat4.create();

        //------------------------------- RENDER -----------------------------------------------//

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearDepth(1.0);

        let Z = 0.;
        let AMORTIZATION = 0.8;
        let animate;
        let x = 0.0;
        this.renderLoop(this);

    }
    renderLoop(thisRL) {

        let dt = 0;
        let old_time = 0;
        let time = 0;
        let skybox_blur;
        let tex_SkyBox;
        let tex_irradianceMap;
        let AMORTIZATION = 0.90;
        let Z = 0.;
        let x = 0.0;

        const animate = function () {

            // //-------------------------- SKY BOX -----------------------------------------------//
            thisRL.gl.viewport(0.0, 0.0, thisRL.canvas.width, thisRL.canvas.height);
            thisRL.gl.clearColor(0.8, 0.9, 0.9, 1.0);
            thisRL.gl.clear(thisRL.gl.COLOR_BUFFER_BIT | thisRL.gl.DEPTH_BUFFER_BIT);

            thisRL.gl.useProgram(thisRL.shader_SkyBox.shaderProgram);
            thisRL.gl.enableVertexAttribArray(thisRL.shader_SkyBox.a_Position);

            if (thisRL.textureSetNumber != thisRL.InputController.skybox || skybox_blur != thisRL.InputController.skybox_blur) {
                let textureSet = loadTextureSet(thisRL.InputController.skybox, thisRL.InputController.skybox_blur);
                thisRL.textureSetNumber = thisRL.InputController.skybox;
                skybox_blur = thisRL.InputController.skybox_blur;

                thisRL.tex_SkyBox = get_cube_texture_MIPMAP(thisRL.gl, textureSet.textureSetSkyBox);
                thisRL.tex_irradianceMap = get_cube_texture(thisRL.gl, textureSet.textureSetirradianceMap);
            }

            if (thisRL.tex_SkyBox.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE4);
                if (!skybox_blur) {
                    thisRL.gl.bindTexture(thisRL.gl.TEXTURE_CUBE_MAP, thisRL.tex_SkyBox.webGLtexture);
                } else {
                    thisRL.gl.bindTexture(thisRL.gl.TEXTURE_CUBE_MAP, thisRL.tex_irradianceMap.webGLtexture);
                }
            }

            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelSkyBox.TRIANGLE_VERTEX);
            thisRL.gl.vertexAttribPointer(thisRL.shader_SkyBox.a_Position, 2, thisRL.gl.FLOAT, false, 0, 0);

            let v = [Math.cos(time * .0001), 0, Math.sin(time * .0001)];
            glMatrix.mat4.identity(thisRL.VIEWMATRIX_CAMERA);

            let worldCameraPosition = glMatrix.vec3.create();
            glMatrix.vec3.set(worldCameraPosition, 0, 5, - 5);

            glMatrix.vec3.transformMat4(worldCameraPosition, worldCameraPosition, thisRL.VIEWMATRIX_CAMERA);
            glMatrix.vec3.normalize(worldCameraPosition, worldCameraPosition);
            glMatrix.mat4.lookAt(thisRL.VIEWMATRIX, worldCameraPosition, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);

            glMatrix.mat4.multiply(thisRL.VIEWMATRIX, thisRL.PROJMATRIX, thisRL.VIEWMATRIX);
            glMatrix.mat4.invert(thisRL.VIEWMATRIX, thisRL.VIEWMATRIX);

            thisRL.gl.uniformMatrix4fv(thisRL.shader_SkyBox.u_viewDirectionProjectionInverse, false, thisRL.VIEWMATRIX);
            thisRL.gl.uniform1i(thisRL.shader_SkyBox.samplerTex, 4);
            thisRL.gl.drawArrays(thisRL.gl.TRIANGLES, 0, 6);
            thisRL.gl.useProgram(null);

            //-------------------------- translate  --------------------------------------------//
            thisRL.InputController.dX *= AMORTIZATION, thisRL.InputController.dY *= AMORTIZATION;
            thisRL.InputController.theta += thisRL.InputController.dX, thisRL.InputController.phi += thisRL.InputController.dY;
            Z = Z + thisRL.InputController.dZ; if (Z < 1.0) { Z = 1.0 };
            //--------------------------- VIEWMATRIX -------------------------------------------//
            //----------------- NORMALMATRIX_HELPER --------------------------------------------//
            glMatrix.mat4.identity(thisRL.NORMALMATRIX_HELPER);
            glMatrix.mat4.invert(thisRL.NORMALMATRIX_HELPER, thisRL.NORMALMATRIX_HELPER);
            glMatrix.mat4.transpose(thisRL.NORMALMATRIX_HELPER, thisRL.NORMALMATRIX_HELPER);
            //----------------- MODELMATRIX  ---------------------------------------------------//
            glMatrix.mat4.identity(thisRL.MODELMATRIX);
            let model_translate = glMatrix.vec3.create();
            glMatrix.vec3.set(model_translate, 0, 1, 0);

            // x = x + 0.005;
            glMatrix.mat4.translate(thisRL.MODELMATRIX, thisRL.MODELMATRIX, model_translate);
            glMatrix.mat4.rotateX(thisRL.MODELMATRIX, thisRL.MODELMATRIX, thisRL.InputController.phi);
            glMatrix.mat4.rotateY(thisRL.MODELMATRIX, thisRL.MODELMATRIX, thisRL.InputController.theta);
            glMatrix.mat4.rotateY(thisRL.MODELMATRIX, thisRL.MODELMATRIX, x);
            //glMatrix.mat4.scale(thisRL.MODELMATRIX, thisRL.MODELMATRIX, [1.0, Z, 1.0]);
            //----------------- NORMALMATRIX_REAL ----------------------------------------------//
            glMatrix.mat4.invert(thisRL.NORMALMATRIX, thisRL.MODELMATRIX);
            glMatrix.mat4.transpose(thisRL.NORMALMATRIX, thisRL.NORMALMATRIX);
            // //-------------------------------MAIN RENDER ---------------------------------------//

            thisRL.gl.useProgram(thisRL.shader_Model.shaderProgram);
            thisRL.gl.enableVertexAttribArray(thisRL.shader_Model.a_Position);
            thisRL.gl.enableVertexAttribArray(thisRL.shader_Model.a_uv);
            thisRL.gl.enableVertexAttribArray(thisRL.shader_Model.a_normal);
            thisRL.gl.enableVertexAttribArray(thisRL.shader_Model.a_tangent);
            thisRL.gl.enableVertexAttribArray(thisRL.shader_Model.a_bitangent);

            thisRL.gl.uniformMatrix4fv(thisRL.shader_Model.u_Pmatrix, false, thisRL.camera.pMatrix);
            thisRL.gl.uniformMatrix4fv(thisRL.shader_Model.u_Mmatrix, false, thisRL.MODELMATRIX);
            thisRL.gl.uniformMatrix4fv(thisRL.shader_Model.u_Vmatrix, false, thisRL.camera.vMatrix);
            thisRL.gl.uniformMatrix4fv(thisRL.shader_Model.u_Nmatrix, false, thisRL.NORMALMATRIX);

            //-------------------------- Lighting ---------------------------------------------//
            let source_direction = glMatrix.vec3.create();

            glMatrix.vec3.set(source_direction, 0, 5, 5);

            thisRL.gl.uniform3fv(thisRL.shader_Model.u_source_direction, source_direction);
            thisRL.gl.uniform1f(thisRL.shader_Model.u_shininess, 100);
            //----------------------------------------------------------------------------------//
            let albedo = glMatrix.vec3.create();

            thisRL.gl.uniform1f(thisRL.shader_Model.u_ao, 1);
            //-------------------------- CAMERA ----------------------------------------------//  
            thisRL.gl.uniform3fv(thisRL.shader_Model.u_Camera, thisRL.camera.eye);
            //----------------------------------------------------------------------------------//


            thisRL.gl.uniform3fv(thisRL.shader_Model.u_view_direction, thisRL.camera.center);

            if (thisRL.mainMaterial.name != thisRL.InputController.material) {
                thisRL.textureMaterial = loadTextureSetMaterial(thisRL.gl, thisRL.InputController.material);

                thisRL.mainMaterial.name = thisRL.InputController.material;
                thisRL.mainMaterial.settingTextue(thisRL.textureMaterial);

            }

            if (thisRL.modelRing != thisRL.InputController.ring) {
                thisRL.modelIndex = loadModelSet(thisRL.gl, thisRL.InputController.ring);
                thisRL.modelRing = thisRL.InputController.ring;
                let model_1;
                thisRL.ModelMain = loadBuffer(thisRL.gl, thisRL.gl.model.meshes[thisRL.modelIndex], model_1);
            }

            if (thisRL.dekorMaterial.name != thisRL.InputController.dekor) {
                thisRL.modelIndexDekor = loadModelDekor(thisRL.gl, thisRL.InputController.dekor);
                thisRL.dekorMaterial.name = thisRL.InputController.dekor;
                let model_2;
                thisRL.modelDekor = loadBuffer(thisRL.gl, thisRL.gl.model.meshes[thisRL.modelIndexDekor], model_2);
            }

            if (thisRL.mainMaterial.texture.tex.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE0);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.mainMaterial.texture.tex.webGLtexture);
            }
            if (thisRL.mainMaterial.texture.tex_normal.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE1);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.mainMaterial.texture.tex_normal.webGLtexture);
            }
            if (thisRL.mainMaterial.texture.tex_roughness.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE2);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.mainMaterial.texture.tex_roughness.webGLtexture);
            }
            if (thisRL.mainMaterial.texture.tex_metallic.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE3);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.mainMaterial.texture.tex_metallic.webGLtexture);
            }
            if (thisRL.tex_irradianceMap.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE4);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_CUBE_MAP, thisRL.tex_irradianceMap.webGLtexture);
            }
            if (thisRL.tex_LUT.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE5);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex_LUT.webGLtexture);
            }
            if (thisRL.tex_SkyBox.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE6);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_CUBE_MAP, thisRL.tex_SkyBox.webGLtexture);
            }
            if (thisRL.mainMaterial.texture.tex_AO.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE7);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.mainMaterial.texture.tex_AO.webGLtexture);
            }


            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_VERTEX);
            thisRL.gl.vertexAttribPointer(thisRL.shader_Model.a_Position, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_NORMAL);
            thisRL.gl.vertexAttribPointer(thisRL.shader_Model.a_normal, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_TANGENT);
            thisRL.gl.vertexAttribPointer(thisRL.shader_Model.a_tangent, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_BITANGENT);
            thisRL.gl.vertexAttribPointer(thisRL.shader_Model.a_bitangent, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_UV);
            thisRL.gl.vertexAttribPointer(thisRL.shader_Model.a_uv, 2, thisRL.gl.FLOAT, false, 4 * (2), 0);

            thisRL.gl.bindBuffer(thisRL.gl.ELEMENT_ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_FACES);
            thisRL.gl.drawElements(thisRL.gl.TRIANGLES, thisRL.ModelMain.ModelIndiceslength, thisRL.gl.UNSIGNED_SHORT, 0);

            thisRL.gl.flush();

            //----------------------  DEKOR ------------------------------------// 
            if (thisRL.InputController.dekor != 'none') {
                if (thisRL.InputController.dekor == 'gemstone') {

                    if (thisRL.dekorMaterial.texture.tex.webGLtexture) {
                        thisRL.gl.activeTexture(thisRL.gl.TEXTURE0);
                        thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.dekorMaterial.texture.tex.webGLtexture);
                    }
                    if (thisRL.dekorMaterial.texture.tex_normal.webGLtexture) {
                        thisRL.gl.activeTexture(thisRL.gl.TEXTURE1);
                        thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.dekorMaterial.texture.tex_normal.webGLtexture);
                    }
                    if (thisRL.dekorMaterial.texture.tex_roughness.webGLtexture) {
                        thisRL.gl.activeTexture(thisRL.gl.TEXTURE2);
                        thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.dekorMaterial.texture.tex_roughness.webGLtexture);
                    }
                    if (thisRL.dekorMaterial.texture.tex_metallic.webGLtexture) {
                        thisRL.gl.activeTexture(thisRL.gl.TEXTURE3);
                        thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.dekorMaterial.texture.tex_metallic.webGLtexture);
                    }

                    if (thisRL.dekorMaterial.texture.tex_AO.webGLtexture) {
                        thisRL.gl.activeTexture(thisRL.gl.TEXTURE7);
                        thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.dekorMaterial.texture.tex_AO.webGLtexture);
                    }
                }

                thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_VERTEX);
                thisRL.gl.vertexAttribPointer(thisRL.shader_Model.a_Position, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

                thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_NORMAL);
                thisRL.gl.vertexAttribPointer(thisRL.shader_Model.a_normal, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

                thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_TANGENT);
                thisRL.gl.vertexAttribPointer(thisRL.shader_Model.a_tangent, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

                thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_BITANGENT);
                thisRL.gl.vertexAttribPointer(thisRL.shader_Model.a_bitangent, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

                thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_UV);
                thisRL.gl.vertexAttribPointer(thisRL.shader_Model.a_uv, 2, thisRL.gl.FLOAT, false, 4 * (2), 0);

                thisRL.gl.bindBuffer(thisRL.gl.ELEMENT_ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_FACES);
                thisRL.gl.drawElements(thisRL.gl.TRIANGLES, thisRL.modelDekor.ModelIndiceslength, thisRL.gl.UNSIGNED_SHORT, 0);
            }

            thisRL.gl.disableVertexAttribArray(thisRL.shader_Model.a_Position);
            thisRL.gl.disableVertexAttribArray(thisRL.shader_Model.a_uv);
            thisRL.gl.disableVertexAttribArray(thisRL.shader_Model.a_normal);
            thisRL.gl.disableVertexAttribArray(thisRL.shader_Model.a_tangent);
            thisRL.gl.disableVertexAttribArray(thisRL.shader_Model.a_bitangent);


            window.requestAnimationFrame(animate);
        }
        animate(0);
    }


}






import * as Matrix from './gl-matrix.js';
import MouseController from './MouseController.js';
import Camera from './Camera.js';
import { CameraController } from './Camera.js';
import { getShader } from './ShaderUtil.js';
import { getProgram } from './ShaderUtil.js';
import { createDomShaderProgram } from './ShaderUtil.js';
import { LoadShaderTextUsingPromise } from './ShaderUtil.js';
import { createPromiseShaderProgram } from './ShaderUtil.js';

import { loadJSON } from './ModelUtil.js';
import { loadBuffer } from './ModelUtil.js';
import { setGeometrySkyBox } from './ModelUtil.js';
import { get_cube_texture_MIPMAP } from './ModelUtil.js';
import { get_cube_texture } from './ModelUtil.js';
import { get_texture } from './ModelUtil.js';

import { loadTextureSet } from './settingLoadTex.js';
import { loadTextureSetMaterial } from './settingLoadTex.js';
import { loadModelSet } from './settingLoadTex.js';
import { loadModelDekor } from './settingLoadTex.js';


export default class webGLStart {

    constructor() {

        // Initialize the context
        this.canvas = document.getElementById('canvas_1');
        this.gl = this.canvas.getContext('webgl', { alpha: false, antialias: false });

        try {
            this.gl.getExtension('OES_standard_derivatives');
            this.gl.getExtension('EXT_shader_texture_lod');
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
        this.shaderProgram_SkyBox = await createPromiseShaderProgram(this.gl, 'resource/shaders/vertex_shader_sky_box.glsl', 'resource/shaders/fragment_shader_sky_box.glsl');

        this.u_viewDirectionProjectionInverse_SB = this.gl.getUniformLocation(this.shaderProgram_SkyBox, 'u_viewDirectionProjectionInverse');

        this.a_Position_SB = this.gl.getAttribLocation(this.shaderProgram_SkyBox, 'a_Position');
        this.u_sampler_SB = this.gl.getUniformLocation(this.shaderProgram_SkyBox, 'samplerTex');

        this.gl.useProgram(this.shaderProgram_SkyBox);

        this.gl.uniform1i(this.u_sampler_SB, 4);
        this.gl.useProgram(null);

        //  MAIN shaderProgram ---------------------------------------------------------------//
        this.shaderProgram = await createPromiseShaderProgram(this.gl, 'resource/shaders/vertex_shaderPBR_basic_3.glsl', 'resource/shaders/fragment_shaderPBR_basic_4.glsl');

        this.u_Pmatrix = this.gl.getUniformLocation(this.shaderProgram, 'u_Pmatrix');
        this.u_Mmatrix = this.gl.getUniformLocation(this.shaderProgram, 'u_Mmatrix');
        this.u_Vmatrix = this.gl.getUniformLocation(this.shaderProgram, 'u_Vmatrix');
        this.u_Nmatrix = this.gl.getUniformLocation(this.shaderProgram, 'u_Nmatrix');
        this.u_source_direction = this.gl.getUniformLocation(this.shaderProgram, 'u_source_direction');
        this.u_view_direction = this.gl.getUniformLocation(this.shaderProgram, 'u_view_direction');
        this.u_shininess = this.gl.getUniformLocation(this.shaderProgram, 'u_shininess');

        this.u_Camera = this.gl.getUniformLocation(this.shaderProgram, 'u_Camera');

        this.a_Position = this.gl.getAttribLocation(this.shaderProgram, 'a_Position');
        this.a_uv = this.gl.getAttribLocation(this.shaderProgram, 'a_uv');
        this.a_normal = this.gl.getAttribLocation(this.shaderProgram, 'a_normal');
        this.a_tangent = this.gl.getAttribLocation(this.shaderProgram, 'a_tangent');
        this.a_bitangent = this.gl.getAttribLocation(this.shaderProgram, 'a_bitangent');

        this.u_sampler = this.gl.getUniformLocation(this.shaderProgram, 'samplerTex');
        this.u_samplerNormalMap = this.gl.getUniformLocation(this.shaderProgram, 'samplerNormalMap');
        this.u_samplerRoughnessMap = this.gl.getUniformLocation(this.shaderProgram, 'samplerRoughnessMap');
        this.u_samplerMetallicMap = this.gl.getUniformLocation(this.shaderProgram, 'samplerMetallicMap');

        this.u_irradianceMap = this.gl.getUniformLocation(this.shaderProgram, 'u_irradianceMap');
        this.u_sampler_LUT = this.gl.getUniformLocation(this.shaderProgram, 'u_sampler_LUT');
        this.u_skyBox = this.gl.getUniformLocation(this.shaderProgram, 'u_skyBox');
        this.u_samplerAOMap = this.gl.getUniformLocation(this.shaderProgram, 'samplerAOMap');

        this.u_diffuse = this.gl.getUniformLocation(this.shaderProgram, 'u_diffuse');
        this.u_normalPower = this.gl.getUniformLocation(this.shaderProgram, 'u_normalPower');


        this.u_albedo = this.gl.getUniformLocation(this.shaderProgram, 'u_albedo');
        this.u_metallic = this.gl.getUniformLocation(this.shaderProgram, 'u_metallic');
        this.u_roughness = this.gl.getUniformLocation(this.shaderProgram, 'u_roughness');
        this.u_ao = this.gl.getUniformLocation(this.shaderProgram, 'u_ao');


        this.gl.useProgram(this.shaderProgram);

        this.gl.uniform1i(this.u_sampler, 0);
        this.gl.uniform1i(this.u_samplerNormalMap, 1);
        this.gl.uniform1i(this.u_samplerRoughnessMap, 2);
        this.gl.uniform1i(this.u_samplerMetallicMap, 3);
        this.gl.uniform1i(this.u_irradianceMap, 4);
        this.gl.uniform1i(this.u_sampler_LUT, 5);
        this.gl.uniform1i(this.u_skyBox, 6);
        this.gl.uniform1i(this.u_samplerAOMap, 7);

        loadJSON(this.gl, 'resource/ring.json');

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

        this.tex = false;
        this.tex_normal = false;
        this.tex_roughness = false;
        this.tex_metallic = false;
        this.tex_AO = false;


        this.textureMaterial = loadTextureSetMaterial(this.gl, this.InputController.material);
        this.textureMaterialDekor = loadTextureSetMaterial(this.gl, 'plastic');
        this.material = this.InputController.material;

        // GOLD 
        this.tex = this.textureMaterial.tex;
        this.tex_normal = this.textureMaterial.tex_normal;
        this.tex_roughness = this.textureMaterial.tex_roughness;
        this.tex_metallic = this.textureMaterial.tex_metallic;
        this.tex_AO = this.textureMaterial.tex_AO;

        this.tex_dekor = this.textureMaterialDekor.tex;
        this.tex_normal_dekor = this.textureMaterialDekor.tex_normal;
        this.tex_roughness_dekor = this.textureMaterialDekor.tex_roughness;
        this.tex_metallic_dekor = this.textureMaterialDekor.tex_metallic;
        this.tex_AO_dekor = this.textureMaterialDekor.tex_AO;

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

            thisRL.gl.useProgram(thisRL.shaderProgram_SkyBox);
            thisRL.gl.enableVertexAttribArray(thisRL.a_Position_SB);

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
            thisRL.gl.vertexAttribPointer(thisRL.a_Position_SB, 2, thisRL.gl.FLOAT, false, 0, 0);

            //glMatrix.mat4.identity(thisRL.VIEWMATRIX);
            let v = [Math.cos(time * .0001), 0, Math.sin(time * .0001)];
            // rotate = rotate + .001;
            //glMatrix.mat4.identity(thisRL.VIEWMATRIX);

            glMatrix.mat4.identity(thisRL.VIEWMATRIX_CAMERA);
            // glMatrix.mat4.rotateY(VIEWMATRIX_CAMERA, VIEWMATRIX_CAMERA, -rotate);
            let worldCameraPosition = glMatrix.vec3.create();
            //glMatrix.vec3.set(worldCameraPosition, thisRL.gui.view_directionX, thisRL.gui.view_directionY, - thisRL.gui.view_directionZ);
            glMatrix.vec3.set(worldCameraPosition, 0, 5, - 5);

            glMatrix.vec3.transformMat4(worldCameraPosition, worldCameraPosition, thisRL.VIEWMATRIX_CAMERA);
            glMatrix.vec3.normalize(worldCameraPosition, worldCameraPosition);

            //this.camera.vMatrix;


            glMatrix.mat4.lookAt(thisRL.VIEWMATRIX, worldCameraPosition, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);

            glMatrix.mat4.multiply(thisRL.VIEWMATRIX, thisRL.PROJMATRIX, thisRL.VIEWMATRIX);
            glMatrix.mat4.invert(thisRL.VIEWMATRIX, thisRL.VIEWMATRIX);

            thisRL.gl.uniformMatrix4fv(thisRL.u_viewDirectionProjectionInverse_SB, false, thisRL.VIEWMATRIX);
            thisRL.gl.uniform1i(thisRL.u_sampler_SB, 4);
            thisRL.gl.drawArrays(thisRL.gl.TRIANGLES, 0, 6);
            thisRL.gl.useProgram(null);

            //-------------------------- translate  --------------------------------------------//
            thisRL.InputController.dX *= AMORTIZATION, thisRL.InputController.dY *= AMORTIZATION;
            thisRL.InputController.theta += thisRL.InputController.dX, thisRL.InputController.phi += thisRL.InputController.dY;
            Z = Z + thisRL.InputController.dZ; if (Z < 1.0) { Z = 1.0 };
            //--------------------------- VIEWMATRIX -------------------------------------------//
            // glMatrix.mat4.identity(thisRL.VIEWMATRIX);
            //glMatrix.mat4.lookAt(thisRL.VIEWMATRIX, [thisRL.gui.view_directionX, thisRL.gui.view_directionY, thisRL.gui.view_directionZ], [0.0, 1.0, 0.0], [0.0, 1.0, 0.0]);
            //glMatrix.mat4.lookAt(thisRL.VIEWMATRIX, [0, 3, 3], [0.0, 1.0, 0.0], [0.0, 1.0, 0.0]);
            //----------------- NORMALMATRIX_HELPER --------------------------------------------//
            glMatrix.mat4.identity(thisRL.NORMALMATRIX_HELPER);
            // glMatrix.mat4.scale(thisRL.NORMALMATRIX_HELPER, thisRL.NORMALMATRIX_HELPER, [1.0, Z, 1.0]);
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
            // // gl.viewport(0.0, 0.0, canvas.width, canvas.height);
            // // gl.clearColor(0.1, 0.1, 0.1, 1.0);
            // // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            // //----------------------------------------------------------------------------------//


            thisRL.gl.useProgram(thisRL.shaderProgram);
            thisRL.gl.enableVertexAttribArray(thisRL.a_Position);
            thisRL.gl.enableVertexAttribArray(thisRL.a_uv);
            thisRL.gl.enableVertexAttribArray(thisRL.a_normal);
            thisRL.gl.enableVertexAttribArray(thisRL.a_tangent);
            thisRL.gl.enableVertexAttribArray(thisRL.a_bitangent);

            //thisRL.gl.uniformMatrix4fv(thisRL.u_Pmatrix, false, thisRL.PROJMATRIX);
            thisRL.gl.uniformMatrix4fv(thisRL.u_Pmatrix, false, thisRL.camera.pMatrix);
            thisRL.gl.uniformMatrix4fv(thisRL.u_Mmatrix, false, thisRL.MODELMATRIX);
            thisRL.gl.uniformMatrix4fv(thisRL.u_Vmatrix, false, thisRL.camera.vMatrix);
            thisRL.gl.uniformMatrix4fv(thisRL.u_Nmatrix, false, thisRL.NORMALMATRIX);

            // const diffuse = (thisRL.gui.diffuse == true) ? 1.0 : 0.0;
            // thisRL.gl.uniform1f(thisRL.u_diffuse, diffuse);
            // thisRL.gl.uniform1f(thisRL.u_normalPower, thisRL.gui.normalPower);


            //-------------------------- Lighting ---------------------------------------------//
            let source_direction = glMatrix.vec3.create();
            //glMatrix.vec3.set(source_direction, thisRL.gui.source_directionX, thisRL.gui.source_directionY, thisRL.gui.source_directionZ);
            glMatrix.vec3.set(source_direction, 0, 5, 5);

            thisRL.gl.uniform3fv(thisRL.u_source_direction, source_direction);
            //  thisRL.gl.uniform1f(thisRL.u_shininess, thisRL.gui.shininess);
            thisRL.gl.uniform1f(thisRL.u_shininess, 100);
            //----------------------------------------------------------------------------------//
            let albedo = glMatrix.vec3.create();
            // glMatrix.vec3.set(albedo, thisRL.gui.albedo[0] / 255, thisRL.gui.albedo[1] / 255, thisRL.gui.albedo[2] / 255);
            //console.log(gui.albedo);
            // thisRL.gl.uniform3fv(thisRL.u_albedo, albedo);
            // thisRL.gl.uniform1f(thisRL.u_metallic, thisRL.gui.metallic);
            // thisRL.gl.uniform1f(thisRL.u_roughness, thisRL.gui.roughness);
            //thisRL.gl.uniform1f(thisRL.u_ao, thisRL.gui.ao);
            thisRL.gl.uniform1f(thisRL.u_ao, 1);
            //-------------------------- CAMERA ----------------------------------------------//  
            thisRL.gl.uniform3fv(thisRL.u_Camera, thisRL.camera.eye);
            //----------------------------------------------------------------------------------//

            // glMatrix.mat4.identity(thisRL.VIEWMATRIX_CAMERA);
            //let view_direction = glMatrix.vec3.create();
            //glMatrix.vec3.set(view_direction, thisRL.gui.view_directionX, thisRL.gui.view_directionY, thisRL.gui.view_directionZ);
            //glMatrix.vec3.set(view_direction, 0, 3, 3);
            //glMatrix.vec3.transformMat4(view_direction, view_direction, thisRL.VIEWMATRIX_CAMERA);
            // thisRL.gl.uniform3fv(thisRL.u_view_direction, view_direction);
            thisRL.gl.uniform3fv(thisRL.u_view_direction, thisRL.camera.center);

            if (thisRL.material != thisRL.InputController.material) {
                thisRL.textureMaterial = loadTextureSetMaterial(thisRL.gl, thisRL.InputController.material);
                thisRL.material = thisRL.InputController.material;

                thisRL.tex = thisRL.textureMaterial.tex;
                thisRL.tex_normal = thisRL.textureMaterial.tex_normal;
                thisRL.tex_roughness = thisRL.textureMaterial.tex_roughness;
                thisRL.tex_metallic = thisRL.textureMaterial.tex_metallic;
                thisRL.tex_AO = thisRL.textureMaterial.tex_AO;
            }

            if (thisRL.modelRing != thisRL.InputController.ring) {
                thisRL.modelIndex = loadModelSet(thisRL.gl, thisRL.InputController.ring);
                thisRL.modelRing = thisRL.InputController.ring;
                let model_1;
                thisRL.ModelMain = loadBuffer(thisRL.gl, thisRL.gl.model.meshes[thisRL.modelIndex], model_1);
            }

            if (thisRL.modelDekorName != thisRL.InputController.dekor) {
                thisRL.modelIndexDekor = loadModelDekor(thisRL.gl, thisRL.InputController.dekor);
                thisRL.modelDekorName = thisRL.InputController.dekor;//thisRL.gui.dekor;
                let model_2;
                thisRL.modelDekor = loadBuffer(thisRL.gl, thisRL.gl.model.meshes[thisRL.modelIndexDekor], model_2);
            }

            if (thisRL.tex.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE0);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex.webGLtexture);
            }
            if (thisRL.tex_normal.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE1);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex_normal.webGLtexture);
            }
            if (thisRL.tex_roughness.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE2);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex_roughness.webGLtexture);
            }
            if (thisRL.tex_metallic.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE3);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex_metallic.webGLtexture);
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
            if (thisRL.tex_AO.webGLtexture) {
                thisRL.gl.activeTexture(thisRL.gl.TEXTURE7);
                thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex_AO.webGLtexture);
            }


            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_VERTEX);
            thisRL.gl.vertexAttribPointer(thisRL.a_Position, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_NORMAL);
            thisRL.gl.vertexAttribPointer(thisRL.a_normal, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_TANGENT);
            thisRL.gl.vertexAttribPointer(thisRL.a_tangent, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_BITANGENT);
            thisRL.gl.vertexAttribPointer(thisRL.a_bitangent, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

            thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_UV);
            thisRL.gl.vertexAttribPointer(thisRL.a_uv, 2, thisRL.gl.FLOAT, false, 4 * (2), 0);

            thisRL.gl.bindBuffer(thisRL.gl.ELEMENT_ARRAY_BUFFER, thisRL.ModelMain.TRIANGLE_FACES);
            thisRL.gl.drawElements(thisRL.gl.TRIANGLES, thisRL.ModelMain.ModelIndiceslength, thisRL.gl.UNSIGNED_SHORT, 0);

            thisRL.gl.flush();

            //----------------------  DEKOR ------------------------------------// 
            if (thisRL.InputController.dekor != 'none') {
                if (thisRL.InputController.dekor == 'gemstone') {
                    // textureMaterialDekor = loadTextureSetMaterial(gl, 'plastic');
                    //  material = gui.material;

                    thisRL.tex_dekor = thisRL.textureMaterialDekor.tex;
                    thisRL.tex_normal_dekor = thisRL.textureMaterialDekor.tex_normal;
                    thisRL.tex_roughness_dekor = thisRL.textureMaterialDekor.tex_roughness;
                    thisRL.tex_metallic_dekor = thisRL.textureMaterialDekor.tex_metallic;
                    thisRL.tex_AO_dekor = thisRL.textureMaterialDekor.tex_AO;

                    if (thisRL.tex_dekor.webGLtexture) {
                        thisRL.gl.activeTexture(thisRL.gl.TEXTURE0);
                        thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex_dekor.webGLtexture);
                    }
                    if (thisRL.tex_normal_dekor.webGLtexture) {
                        thisRL.gl.activeTexture(thisRL.gl.TEXTURE1);
                        thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex_normal_dekor.webGLtexture);
                    }
                    if (thisRL.tex_roughness_dekor.webGLtexture) {
                        thisRL.gl.activeTexture(thisRL.gl.TEXTURE2);
                        thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex_roughness_dekor.webGLtexture);
                    }
                    if (thisRL.tex_metallic_dekor.webGLtexture) {
                        thisRL.gl.activeTexture(thisRL.gl.TEXTURE3);
                        thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex_metallic_dekor.webGLtexture);
                    }

                    if (thisRL.tex_AO_dekor.webGLtexture) {
                        thisRL.gl.activeTexture(thisRL.gl.TEXTURE7);
                        thisRL.gl.bindTexture(thisRL.gl.TEXTURE_2D, thisRL.tex_AO_dekor.webGLtexture);
                    }
                }

                thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_VERTEX);
                thisRL.gl.vertexAttribPointer(thisRL.a_Position, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

                thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_NORMAL);
                thisRL.gl.vertexAttribPointer(thisRL.a_normal, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

                thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_TANGENT);
                thisRL.gl.vertexAttribPointer(thisRL.a_tangent, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

                thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_BITANGENT);
                thisRL.gl.vertexAttribPointer(thisRL.a_bitangent, 3, thisRL.gl.FLOAT, false, 4 * (3), 0);

                thisRL.gl.bindBuffer(thisRL.gl.ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_UV);
                thisRL.gl.vertexAttribPointer(thisRL.a_uv, 2, thisRL.gl.FLOAT, false, 4 * (2), 0);

                thisRL.gl.bindBuffer(thisRL.gl.ELEMENT_ARRAY_BUFFER, thisRL.modelDekor.TRIANGLE_FACES);
                thisRL.gl.drawElements(thisRL.gl.TRIANGLES, thisRL.modelDekor.ModelIndiceslength, thisRL.gl.UNSIGNED_SHORT, 0);
            }

            thisRL.gl.disableVertexAttribArray(thisRL.a_Position);
            thisRL.gl.disableVertexAttribArray(thisRL.a_uv);
            thisRL.gl.disableVertexAttribArray(thisRL.a_normal);
            thisRL.gl.disableVertexAttribArray(thisRL.a_tangent);
            thisRL.gl.disableVertexAttribArray(thisRL.a_bitangent);


            window.requestAnimationFrame(animate);
        }
        animate(0);
    }


}






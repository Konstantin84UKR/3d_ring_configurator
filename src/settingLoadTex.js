import { get_texture } from './ModelUtil.js';

export function loadTextureSet(t, blur) {

    const skybox = t;


    let textureSetSkyBox = [];
    let textureSetirradianceMap = [];

    switch (skybox) {
        case 'apartment':
            textureSetSkyBox = [
                'resource/SkyBox1/px.png',
                'resource/SkyBox1/nx.png',
                'resource/SkyBox1/py.png',
                'resource/SkyBox1/ny.png',
                'resource/SkyBox1/nz.png',
                'resource/SkyBox1/pz.png'
            ];

            textureSetirradianceMap = [
                'resource/irradianceMap1/px.png',
                'resource/irradianceMap1/nx.png',
                'resource/irradianceMap1/py.png',
                'resource/irradianceMap1/ny.png',
                'resource/irradianceMap1/nz.png',
                'resource/irradianceMap1/pz.png'
            ];


            break;
        case 'desert':
            textureSetSkyBox = [
                'resource/SkyBox2/px.png',
                'resource/SkyBox2/nx.png',
                'resource/SkyBox2/py.png',
                'resource/SkyBox2/ny.png',
                'resource/SkyBox2/nz.png',
                'resource/SkyBox2/pz.png'
            ];

            textureSetirradianceMap = [
                'resource/irradianceMap2/px.png',
                'resource/irradianceMap2/nx.png',
                'resource/irradianceMap2/py.png',
                'resource/irradianceMap2/ny.png',
                'resource/irradianceMap2/nz.png',
                'resource/irradianceMap2/pz.png'
            ];

            break;
        case 'tokio':
            textureSetSkyBox = [
                'resource/SkyBox3/px.png',
                'resource/SkyBox3/nx.png',
                'resource/SkyBox3/py.png',
                'resource/SkyBox3/ny.png',
                'resource/SkyBox3/nz.png',
                'resource/SkyBox3/pz.png'
            ]
            textureSetirradianceMap = [
                'resource/irradianceMap3/px.png',
                'resource/irradianceMap3/nx.png',
                'resource/irradianceMap3/py.png',
                'resource/irradianceMap3/ny.png',
                'resource/irradianceMap3/nz.png',
                'resource/irradianceMap3/pz.png'
            ]
            break;
        default:
            textureSetSkyBox = [
                'resource/SkyBox2/px.png',
                'resource/SkyBox2/nx.png',
                'resource/SkyBox2/py.png',
                'resource/SkyBox2/ny.png',
                'resource/SkyBox2/nz.png',
                'resource/SkyBox2/pz.png'
            ]
            textureSetirradianceMap = [
                'resource/irradianceMap2/px.png',
                'resource/irradianceMap2/nx.png',
                'resource/irradianceMap2/py.png',
                'resource/irradianceMap2/ny.png',
                'resource/irradianceMap2/nz.png',
                'resource/irradianceMap2/pz.png'
            ]
    }

    return {
        'textureSetSkyBox': textureSetSkyBox,
        'textureSetirradianceMap': textureSetirradianceMap
    }

}

export function loadTextureSetMaterial(gl, m) {
    const material = m;
    let textureMaterial = [];
    switch (material) {
        case "gold":
            textureMaterial = {
                // GOLD 
                'tex': get_texture(gl, "resource/pbr_gold/gold-scuffed_basecolor-boosted.png"),
                'tex_normal': get_texture(gl, "resource/pbr_gold/gold-scuffed_normal.png"),
                'tex_roughness': get_texture(gl, "resource/pbr_gold/gold-scuffed_roughness.png"),
                'tex_metallic': get_texture(gl, "resource/pbr_gold/gold-scuffed_metallic.png"),
                'tex_AO': get_texture(gl, "resource/pbr_wood_2/bamboo-wood-semigloss-ao.png")
            }

            break;
        case "metal":
            textureMaterial = {
                // metal 
                'tex': get_texture(gl, "resource/pbr_metal_1/scuffed-metal1_albedo.png"),
                'tex_normal': get_texture(gl, "resource/pbr_metal_1/scuffed-metal1_normal-dx.png"),
                'tex_roughness': get_texture(gl, "resource/pbr_metal_1/scuffed-metal1_roughness.png"),
                'tex_metallic': get_texture(gl, "resource/pbr_metal_1/scuffed-metal1_metallic.png"),
                'tex_AO': get_texture(gl, "resource/pbr_metal_1/scuffed-metal1_ao.png")



            }

            break;
        case "wood":
            textureMaterial = {
                // wood 
                'tex': get_texture(gl, "resource/pbr_wood_2/bamboo-wood-semigloss-albedo.png"),
                'tex_normal': get_texture(gl, "resource/pbr_wood_2/bamboo-wood-semigloss-normal.png"),
                'tex_roughness': get_texture(gl, "resource/pbr_wood_2/bamboo-wood-semigloss-roughness.png"),
                'tex_metallic': get_texture(gl, "resource/pbr_wood_2/bamboo-wood-semigloss-metal.png"),
                'tex_AO': get_texture(gl, "resource/pbr_wood_2/bamboo-wood-semigloss-ao.png")


            }
            break;

        case "rust_1":
            textureMaterial = {
                // rust_1 
                'tex': get_texture(gl, "resource/pbr_rust/rustediron-streaks_basecolor.png"),
                'tex_normal': get_texture(gl, "resource/pbr_rust/rustediron-streaks_normal.png"),
                'tex_roughness': get_texture(gl, "resource/pbr_rust/rustediron-streaks_roughness.png"),
                'tex_metallic': get_texture(gl, "resource/pbr_rust/rustediron-streaks_metallic.png.png"),
                'tex_AO': get_texture(gl, "resource/pbr_wood_2/bamboo-wood-semigloss-ao.png")


            }
            break;
        case "rust_2":
            textureMaterial = {
                // rust_2 
                'tex': get_texture(gl, "resource/pbr/rustediron2_basecolor.png"),
                'tex_normal': get_texture(gl, "resource/pbr/rustediron2_normal.png"),
                'tex_roughness': get_texture(gl, "resource/pbr/rustediron2_roughness.png"),
                'tex_metallic': get_texture(gl, "resource/pbr/rustediron2_metallic.png"),
                'tex_AO': get_texture(gl, "resource/pbr_wood_2/bamboo-wood-semigloss-ao.png")
            }
            break;

        case "plastic":
            textureMaterial = {
                // plastic 
                'tex': get_texture(gl, "resource/plastic/albedo.png"),
                'tex_normal': get_texture(gl, "resource/plastic/normal.png"),
                'tex_roughness': get_texture(gl, "resource/plastic/roughness.png"),
                'tex_metallic': get_texture(gl, "resource/plastic/metallic.png"),
                'tex_AO': get_texture(gl, "resource/plastic/ao.png")
            }
            break;

        default:
            textureMaterial = {
                // GOLD 
                'tex': get_texture(gl, "resource/pbr_gold/gold-scuffed_basecolor-boosted.png"),
                'tex_normal': get_texture(gl, "resource/pbr_gold/gold-scuffed_normal.png"),
                'tex_roughness': get_texture(gl, "resource/pbr_gold/gold-scuffed_roughness.png"),
                'tex_metallic': get_texture(gl, "resource/pbr_gold/gold-scuffed_metallic.png"),
                'tex_AO': get_texture(gl, "resource/pbr_wood_2/bamboo-wood-semigloss-ao.png")
            }
    }

    return textureMaterial;

}

export function loadModelSet(gl, m) {
    const model = m;
    let modelIndex = 0;
    switch (model) {
        case "ring_1":
            modelIndex = 0;

            break;
        case "ring_2":
            modelIndex = 1;
            break;
        case "ring_3":
            modelIndex = 4;
            break;

        default:
            modelIndex = 0;
    }
    return modelIndex;
}

export function loadModelDekor(gl, m) {
    const model = m;
    let modelIndex = 0;
    switch (model) {
        case "gemstone":
            modelIndex = 3;

            break;
        case "dekor_1":
            modelIndex = 2;
            break;
        default:
            modelIndex = 2;
    }
    return modelIndex;
}
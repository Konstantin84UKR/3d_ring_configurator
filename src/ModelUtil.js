
export function get_texture(gl, image_URL) {

    var image = new Image();
    image.src = image_URL;
    image.webGLtexture = false;

    image.onload = function (e) {

        var texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        image.webGLtexture = texture;

    };

    return image;

}

export function loadVertex() {

    let vertex =
        [
            -1, -1, -1, 0.0, 0.0,
            1, -1, -1, 1.0, 0.0,
            1, 1, -1, 1.0, 1.0,
            -1, 1, -1, 0.0, 1.0,

            // -1,-1, 1,    -0.5,-0.5,
            // 1,-1, 1,     1.5,-0.5,
            // 1, 1, 1,     1.5,1.5,
            // -1, 1, 1,    -0.5,1.5,
            //
            // -1,-1,-1,    0,0,
            // -1, 1,-1,    1,0,
            // -1, 1, 1,    1,1,
            // -1,-1, 1,    0,1,
            //
            // 1,-1,-1,     0,0,
            // 1, 1,-1,     1,0,
            // 1, 1, 1,     1,1,
            // 1,-1, 1,     0,1,
            //
            // -1,-1,-1,    0,0,
            // -1,-1, 1,    1,0,
            // 1,-1, 1,     1,1,
            // 1,-1,-1,     0,1,
            //
            // -1, 1,-1,    0,0,
            // -1, 1, 1,    1,0,
            // 1, 1, 1,     1,1,
            // 1, 1,-1,     0,1

        ];

    return vertex;

}

export function loadFace() {

    let face = [

        0, 1, 2,
        0, 2, 3,

        // 4,5,6,
        // 4,6,7,
        //
        // 8,9,10,
        // 8,10,11,
        //
        // 12,13,14,
        // 12,14,15,
        //
        // 16,17,18,
        // 16,18,19,
        //
        // 20,21,22,
        // 20,22,23,

    ];

    return face;

}

export function loadJSON(gl, modelURL) {
    var xhr = new XMLHttpRequest();
    var model;

    xhr.open('GET', modelURL, false);
    xhr.onload = function () {
        if (xhr.status != 200) {

            alert('LOAD' + xhr.status + ': ' + xhr.statusText);
        } else {

            gl.model = JSON.parse(xhr.responseText);
            // model = JSON.parse(xhr.responseText);
            // return true;
        }
    }
    xhr.send();
}

export function loadBuffer(gl, meshes, modelbuffer) {

    let modelbufferRef = {

        TRIANGLE_VERTEX: 0,
        TRIANGLE_UV: 0,
        TRIANGLE_NORMAL: 0,
        TRIANGLE_TANGENT: 0,
        TRIANGLE_BITANGENT: 0,
        TRIANGLE_FACES: 0,
        ModelIndiceslength: 0,
    };

    modelbuffer = Object.assign({}, modelbufferRef);


    let ModelVertices = meshes.vertices;
    let ModelIndices = [].concat.apply([], meshes.faces);
    let ModelTexCoords = meshes.texturecoords[0];
    let ModelNormal = meshes.normals;
    let ModelTangent = meshes.tangents;
    let ModelBiTangent = meshes.bitangents;
    modelbuffer.ModelIndiceslength = ModelIndices.length;

    modelbuffer.TRIANGLE_VERTEX = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_VERTEX);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelVertices), gl.STATIC_DRAW);

    // modelbuffer.TRIANGLE_VERTEX = TRIANGLE_VERTEX;

    modelbuffer.TRIANGLE_UV = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_UV);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelTexCoords), gl.STATIC_DRAW);

    modelbuffer.TRIANGLE_NORMAL = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_NORMAL);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelNormal), gl.STATIC_DRAW);

    modelbuffer.TRIANGLE_TANGENT = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_TANGENT);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelTangent), gl.STATIC_DRAW);

    modelbuffer.TRIANGLE_BITANGENT = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_BITANGENT);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelBiTangent), gl.STATIC_DRAW);

    modelbuffer.TRIANGLE_FACES = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelbuffer.TRIANGLE_FACES);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ModelIndices), gl.STATIC_DRAW);

    gl.modelbufferPlane = modelbuffer;
    return modelbuffer;

}

export function setGeometrySkyBox(gl) {

    let modelbuffer = {
        TRIANGLE_VERTEX: 0,
        ModelIndiceslength: 0,
    };

    const positions =
        [
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ];

    modelbuffer.TRIANGLE_VERTEX = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_VERTEX);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.ModelIndiceslength = positions.length / 2;
    gl.modelbufferSkyBox = modelbuffer;
    return modelbuffer;
}

export function get_cube_texture_MIPMAP(gl, textureSet) {

    // const textureSet = [
    //     'resource/SkyBox1/px.png',
    //     'resource/SkyBox1/nx.png',
    //     'resource/SkyBox1/py.png',
    //     'resource/SkyBox1/ny.png',
    //     'resource/SkyBox1/nz.png',
    //     'resource/SkyBox1/pz.png'
    // ]

    // // const textureSet = [
    // //     'resource/irradianceMap1/px.png',
    // //     'resource/irradianceMap1/nx.png',
    // //     'resource/irradianceMap1/py.png',
    // //     'resource/irradianceMap1/ny.png',
    // //     'resource/irradianceMap1/nz.png',
    // //     'resource/irradianceMap1/pz.png'
    // // ]

    let texture = gl.createTexture();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            // url: 'resource/SkyBox1/px.png',
            url: textureSet[0],
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            // url: 'resource/SkyBox1/nx.png',
            url: textureSet[1],
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            // url: 'resource/SkyBox1/py.png',
            url: textureSet[2],
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            // url: 'resource/SkyBox1/ny.png',
            url: textureSet[3],
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            // url: 'resource/SkyBox1/nz.png',
            url: textureSet[4],
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            //  url: 'resource/SkyBox1/pz.png',
            url: textureSet[5],
        },

    ];

    faceInfos.forEach((faceInfo) => {

        const { target, url } = faceInfo;

        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 128;
        const hight = 128;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        gl.texImage2D(target, level, internalFormat, width, hight, 0, format, type, null);

        const image = new Image();
        image.src = url;
        image.addEventListener('load', function () {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        });

    });

    // gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

    let tex = {};
    tex.webGLtexture = texture;
    return tex;
}

export function get_cube_texture(gl, textureSet) {

    // const textureSet = [
    //     'resource/SkyBox1/px.png',
    //     'resource/SkyBox1/nx.png',
    //     'resource/SkyBox1/py.png',
    //     'resource/SkyBox1/ny.png',
    //     'resource/SkyBox1/nz.png',
    //     'resource/SkyBox1/pz.png'
    // ]

    // // const textureSet = [
    // //     'resource/irradianceMap1/px.png',
    // //     'resource/irradianceMap1/nx.png',
    // //     'resource/irradianceMap1/py.png',
    // //     'resource/irradianceMap1/ny.png',
    // //     'resource/irradianceMap1/nz.png',
    // //     'resource/irradianceMap1/pz.png'
    // // ]

    let texture = gl.createTexture();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            // url: 'resource/SkyBox1/px.png',
            url: textureSet[0],
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            // url: 'resource/SkyBox1/nx.png',
            url: textureSet[1],
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            // url: 'resource/SkyBox1/py.png',
            url: textureSet[2],
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            // url: 'resource/SkyBox1/ny.png',
            url: textureSet[3],
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            // url: 'resource/SkyBox1/nz.png',
            url: textureSet[4],
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            //  url: 'resource/SkyBox1/pz.png',
            url: textureSet[5],
        },

    ];

    faceInfos.forEach((faceInfo) => {

        const { target, url } = faceInfo;

        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 32;
        const hight = 32;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        gl.texImage2D(target, level, internalFormat, width, hight, 0, format, type, null);

        const image = new Image();
        image.src = url;
        image.addEventListener('load', function () {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        });

    });

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    let tex = {};
    tex.webGLtexture = texture;
    return tex;
}

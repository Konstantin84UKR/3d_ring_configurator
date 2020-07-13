precision mediump float;

uniform samplerCube samplerTex;
uniform mat4 u_viewDirectionProjectionInverse;

varying vec4 v_position;
void main(){
    vec4 t=(u_viewDirectionProjectionInverse*v_position)*-1.;
    vec3 f=normalize(t.xyz/t.w);
    f.z=-f.z;
    gl_FragColor=textureCube(samplerTex,f);
    // gl_FragColor=vec4(1.,.5,0.,1.);
}
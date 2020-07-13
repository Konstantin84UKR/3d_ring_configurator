precision highp float;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;

uniform samplerCube samplerTex;
uniform vec3 u_worldCameraPosition;
//varying vec3 v_worldCameraPosition;

void main(){
    // //refract  стекло
    // vec3 worldNormal=normalize(v_worldNormal);
    // float ratio=1./1.520;
    // vec3 I=normalize(v_worldPosition-u_worldCameraPosition);
    // vec3 R=refract(I,normalize(worldNormal),ratio);
    // vec4 skyColor=textureCube(samplerTex,R);
    // //gl_FragColor=vec4(skyColor);
    // vec4 red=vec4(.6667,.4627,.0863,1.);
    // gl_FragColor=mix(skyColor,red,.5);
    
    ////  reflect зеркало
    vec3 worldNormal=normalize(v_worldNormal);
    vec3 eyeToSurfaceDir=normalize(v_worldPosition-u_worldCameraPosition);
    vec3 direction=reflect(eyeToSurfaceDir,worldNormal);
    vec4 skyColor=textureCube(samplerTex,direction);
    vec4 red=vec4(.7,.2,.2,1.);
    gl_FragColor=mix(skyColor,red,.5);
    
}

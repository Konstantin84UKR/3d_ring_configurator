attribute vec3 a_Position;
attribute vec3 a_normal;

uniform mat4 u_Pmatrix;
uniform mat4 u_Mmatrix;
uniform mat4 u_Vmatrix;
uniform mat4 u_Nmatrix;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;

void main(){
    
    v_worldPosition=(u_Mmatrix*vec4(a_Position,1.)).xyz;
    v_worldNormal=mat3(u_Nmatrix)*a_normal;
    gl_Position=u_Pmatrix*u_Vmatrix*u_Mmatrix*vec4(a_Position,1.);
}
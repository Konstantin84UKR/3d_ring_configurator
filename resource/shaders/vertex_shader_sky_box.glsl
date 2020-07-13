
attribute vec3 a_Position;
varying vec4 v_position;
void main(){
    v_position=vec4(a_Position,1.);
    // gl_Position=vec4(a_Position,1.);
    gl_Position=vec4(a_Position,1.).xyww;
}
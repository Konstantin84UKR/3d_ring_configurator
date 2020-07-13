precision highp float;

uniform sampler2D samplerTex;
uniform sampler2D samplerShadowMap;
uniform sampler2D samplerNormalMap;
uniform sampler2D samplerRoughnessMap;
uniform sampler2D samplerMetallicMap;
uniform sampler2D samplerAOMap;

uniform float u_shininess;
uniform float u_diffuse;
uniform float u_normalPower;

varying vec2 v_uv;
varying vec3 v_LightDir;
varying vec3 v_ViewDir;

varying vec3 v_pos_World;
varying vec3 v_LightDir_World;
varying vec3 v_ViewDir_World;

varying vec3 v_LightDir_1;
varying vec3 v_LightDir_2;
varying vec3 v_LightDir_3;
varying vec3 v_LightDir_4;

const vec3 source_diffuse_color=vec3(1.,1.,1.);
const vec3 source_ambient_color=vec3(.1,.1,.1);
const vec3 source_specular_color=vec3(.5,.5,.5);

const vec3 mat_diffuse_color=vec3(.5,.5,.5);

float PI=3.14159265359;

// vec3 lightPositions[] = {
  //         vec3(-10.0,  10.0, 10.0),
  //         vec3( 10.0,  10.0, 10.0),
  //         vec3(-10.0, -10.0, 10.0),
  //         vec3( 10.0, -10.0, 10.0),
//     };

// Normal Distribution Function - D
//
float DistributionGGX(vec3 N,vec3 H,float roughness)
{
  float a=roughness*roughness;
  float a2=a*a;
  float NdotH=max(dot(N,H),0.);
  float NdotH2=NdotH*NdotH;
  
  float num=a2;
  float demon=(NdotH2*(a2-1.)+1.);
  demon=PI*demon*demon;
  
  return num/demon;
  
}

// Geometry Function - G
float GeometryDclickGGX(float NdotV,float roughness)
{
  float r=(roughness+1.);
  float k=(r*r)/8.;
  
  float num=NdotV;
  float denom=NdotV*(1.-k)+k;
  
  return num/denom;
}

float GeometrySmith(vec3 N,vec3 V,vec3 L,float roughness)
{
  float NdotV=max(dot(N,V),0.);
  float NdotL=max(dot(N,L),0.);
  float ggx2=GeometryDclickGGX(NdotV,roughness);
  float ggx1=GeometryDclickGGX(NdotL,roughness);
  
  return ggx1*ggx2;
}

// Fresnel Reflectance
vec3 frenelSchlick(float cosTheta,vec3 F0)
{
  return F0+(1.-F0)*pow(1.-cosTheta,5.);
}

vec3 rim(vec3 color,float start,float end,float coef,vec3 fNormal,vec3 fPosition)
{
  vec3 normal=normalize(fNormal);
  vec3 eye=normalize(-fPosition.xyz);
  float rim=smoothstep(start,end,1.-dot(normal,eye));
  return clamp(rim,0.,1.)*coef*color;
}

void main(){
  
  float gamma=2.2;
  /////////////////////////////////////////////////////////////////
  vec2 uv=v_uv*2.;
  vec3 colorTex=vec3(texture2D(samplerTex,uv));
  colorTex.r=pow(colorTex.r,gamma);
  colorTex.g=pow(colorTex.g,gamma);
  colorTex.b=pow(colorTex.b,gamma);
  
  //colorTex = pow(colorTex.rgb, 2.2);
  
  vec3 colorRoughness=vec3(texture2D(samplerRoughnessMap,uv));
  vec3 colorNormal=normalize(2.*vec3(texture2D(samplerNormalMap,uv))-1.);
  //vec3 colorMetallic=normalize(2.*vec3(texture2D(samplerMetallicMap,uv))-1.);
  vec3 colorMetallic=vec3(texture2D(samplerMetallicMap,uv));
  // colorMetallic.r = pow(colorMetallic.r, gamma);
  // colorMetallic.g = pow(colorMetallic.g, gamma);
  // colorMetallic.b = pow(colorMetallic.b, gamma);
  // float metal=step(.8,colorMetallic.r);
  vec3 colorAO=vec3(texture2D(samplerAOMap,uv));
  
  vec3 F0=vec3(.04);
  F0=mix(F0,colorTex,colorMetallic);
  //F0 = mix(F0,colorTex,0.5);
  //F0=vec3(colorTex);
  // calculate per-light radiance
  vec3 Lo=vec3(0.);
  
  // v_LightDir_1
  vec3 N=normalize(vec3(colorNormal.xy*u_normalPower,colorNormal.z*1.));
  vec3 L=normalize(v_LightDir);// TODO тут возможно нужно вычислять положение источника света в фрагментном шейдере
  // vec3 L = normalize(v_LightDir_World ); // TODO тут возможно нужно вычислять положение источника света в фрагментном шейдере
  vec3 V=normalize(v_ViewDir);
  vec3 H=normalize(V+L);
  float distance=length(v_LightDir-v_pos_World);
  float attenuation=1./(distance*distance);
  //  vec3 radiance = source_diffuse_color * attenuation;
  vec3 radiance=source_diffuse_color;
  radiance=radiance*u_shininess;
  
  // cook-torrance brdf
  float NDF=DistributionGGX(N,H,colorRoughness.r);
  float G=GeometrySmith(N,V,L,colorRoughness.r);
  vec3 F=frenelSchlick(max(dot(H,N),0.),F0);
  // vec3  F   = rim(vec3(0.5,0.0,0.5),0.6, 0.9, 0.5,N,V);
  //vec3  F   = vec3(max(dot(H,V),0.0));
  
  vec3 kS=F;
  vec3 kD=vec3(1.)-kS;
  //kD*=1.-step(.8,colorMetallic.r);
  kD*=1.-colorMetallic;
  //kD*=vec3(0.);
  
  vec3 numerator=NDF*G*F;
  float denominator=4.*max(dot(N,V),0.)*max(dot(N,L),0.);
  vec3 specular=numerator/max(denominator,.001);
  
  float NdotL=max(dot(N,L),0.);
  //Lo += (kD * colorTex / PI + specular) * radiance * NdotL;
  Lo=(kD*colorTex/PI+specular)*radiance*NdotL;
  
  /////////////////////////////////////////////////////////////
  vec3 ambient=vec3(.03)*colorTex*colorAO;
  //vec3 ambient=vec3(.01)*colorTex;
  vec3 color=ambient+Lo;
  // color =  colorTex;
  // color =  colorRoughness;
  // color =  colorNormal;
  //color=colorMetallic;
  color=vec3(V);
  //color=Lo;
  // Гамма корекция
  color=color/(color+vec3(1.));
  
  // float gamma = 2.2;
  color=pow(color,vec3(1./gamma));
  
  gl_FragColor=vec4(color,1.);
  
}

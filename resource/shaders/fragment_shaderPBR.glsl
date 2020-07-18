
precision highp float;

uniform sampler2D samplerTex;
uniform sampler2D samplerShadowMap;
uniform sampler2D samplerNormalMap;
uniform sampler2D samplerRoughnessMap;
uniform sampler2D samplerMetallicMap;
uniform sampler2D samplerAOMap;
uniform sampler2D u_sampler_LUT;

uniform samplerCube u_irradianceMap;
uniform samplerCube u_skyBox;

uniform float u_shininess;
uniform float u_diffuse;
uniform float u_normalPower;

varying vec2 v_uv;
varying vec3 v_LightDir;
varying vec3 v_ViewDir;

varying vec3 v_pos_World;
varying vec3 v_LightDir_World;
varying vec3 v_ViewDir_World;
varying vec3 v_Normal_World;

varying vec3 v_LightDir_1;
varying vec3 v_LightDir_2;
varying vec3 v_LightDir_3;
varying vec3 v_LightDir_4;

varying mat3 v_tbnMatrix;

const vec3 source_diffuse_color=vec3(1.,1.,1.);
const vec3 source_ambient_color=vec3(.1,.1,.1);
const vec3 source_specular_color=vec3(.5,.5,.5);

const vec3 mat_diffuse_color=vec3(.5,.5,.5);

uniform float u_ao;

float PI=3.14159265359;

vec3 getNormalFromMap()
{
  vec3 colorNormal=normalize(2.*vec3(texture2D(samplerNormalMap,v_uv*2.))-1.);
  vec3 tangentNormal=normalize(vec3(colorNormal.xy*u_normalPower,colorNormal.z*1.));
   vec3 Normal = normalize(v_tbnMatrix * tangentNormal);
   return Normal;
}
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
vec3 fresnelSchlickRoughness(float cosTheta,vec3 F0,float roughness)
{
  return F0+(max(vec3(1.-roughness),F0)-F0)*pow(1.-cosTheta,5.);
}

void main(){
  
  // SKY_BOX
  vec3 worldNormal=normalize(v_Normal_World);
  vec3 eyeToSurfaceDir=normalize(v_pos_World-v_ViewDir_World);
  vec3 direction=reflect(eyeToSurfaceDir,worldNormal);
  vec3 irradiance=textureCube(u_irradianceMap,direction,0.).rgb;
  vec3 skyColor=textureCube(u_skyBox,direction,0.).rgb;
  
  float gamma=2.2;
  /////////////////////////////////////////////////////////////////
  vec2 uv=v_uv*2.;
  vec3 colorTex=vec3(texture2D(samplerTex,uv));
  colorTex.r=pow(colorTex.r,gamma);
  colorTex.g=pow(colorTex.g,gamma);
  colorTex.b=pow(colorTex.b,gamma);
  
  vec3 colorRoughness=vec3(texture2D(samplerRoughnessMap,uv));
  vec3 colorNormal=normalize(2.*vec3(texture2D(samplerNormalMap,uv))-1.);
  vec3 colorMetallic=vec3(texture2D(samplerMetallicMap,uv));
  vec3 colorAO=vec3(texture2D(samplerAOMap,uv));
  
  vec3 F0=vec3(.04);
  F0=mix(F0,colorTex,colorMetallic);
  
  // calculate per-light radiance
  vec3 Lo=vec3(0.);
  
  
  vec3 N=getNormalFromMap();
  vec3 L=normalize(v_LightDir_World);// TODO тут возможно нужно вычислять положение источника света в фрагментном шейдере
  
  vec3 V=normalize(v_ViewDir_World);
  vec3 H=normalize(V+L);
  float distance=length(v_LightDir_World-v_pos_World);
  float attenuation=1./(distance*distance);
  vec3 radiance=source_diffuse_color*attenuation*u_shininess;
 
  // cook-torrance brdf
  float NDF=DistributionGGX(N,H,colorRoughness.r);
  float G=GeometrySmith(N,V,L,colorRoughness.r);
  vec3 F=frenelSchlick(max(dot(H,N),0.),F0);
  
  vec3 kS=F;
  vec3 kD=vec3(1.)-kS;
  kD*=1.-colorMetallic;
  
  vec3 numerator=NDF*G*F;
  float denominator=4.*max(dot(N,V),0.)*max(dot(N,L),0.);
  vec3 specular=numerator/max(denominator,.001);
  
  float NdotL=max(dot(N,L),0.);
  Lo=(kD*colorTex/PI+specular)*radiance*NdotL;
  
  //////////////////////////  IBL  ////////////////////////////////////////////////////
  
  float MAX_REFLECTION_LOD=10.;
  vec3 R=reflect(-V,N);
  vec3 kS_IBL=fresnelSchlickRoughness(max(dot(N,V),.0),F0,colorRoughness.r);
  vec3 kD_IBL=vec3(1.)-kS_IBL;
  kD_IBL*=1.-colorMetallic;
  vec3 irradiance_IBL=vec3(0.);
  irradiance_IBL=textureCube(u_irradianceMap,N,colorRoughness.r*MAX_REFLECTION_LOD).rgb;
  
  vec3 diffuse_IBL=irradiance_IBL*colorTex*kD_IBL;
 
  vec3 reflectionVector=reflect(-normalize(v_ViewDir_World),normalize(N));
  vec3 prefilteredColor=textureCube(u_skyBox,reflectionVector,colorRoughness.r*MAX_REFLECTION_LOD).rgb;
  vec2 uvLUT=vec2(max(dot(N,V),.001),colorRoughness.r).rg;
  vec2 brdf=texture2D(u_sampler_LUT,uvLUT).rg;
  vec3 specular_IBL=prefilteredColor*(kS_IBL*brdf.x+brdf.y);
  vec3 ambient=(specular_IBL+diffuse_IBL)*u_ao;
  vec3 color=ambient+Lo;
  // Гамма корекция
  color=color/(color+vec3(1.));
  color=pow(color,vec3(1./gamma));
  gl_FragColor=vec4(color,1.);
  
}

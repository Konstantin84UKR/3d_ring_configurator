
precision highp float;

uniform sampler2D samplerTex;
uniform sampler2D samplerShadowMap;
uniform sampler2D samplerNormalMap;
uniform sampler2D samplerRoughnessMap;
uniform sampler2D samplerAOMap;
uniform sampler2D samplerMetallicMap;
uniform sampler2D u_sampler_LUT;

uniform samplerCube u_irradianceMap;
uniform samplerCube u_skyBox;

uniform float u_shininess;
uniform float u_diffuse;
uniform float u_normalPower;
uniform vec3 u_Camera;

varying vec2 v_uv;
varying vec3 v_LightDir;
varying vec3 v_ViewDir;
varying vec3 v_Normal;

varying vec3 v_LightDir_tangent;
varying vec3 v_ViewDir_tangent;

varying vec3 v_pos_World;
varying vec3 v_LightDir_World;
varying vec3 v_ViewDir_World;
varying vec3 v_Normal_World;

//varying mat3 v_tbnMatrix;

const vec3 source_diffuse_color=vec3(1.,1.,1.);
//const vec3 source_diffuse_color=vec3(0.,0.,0.);
const vec3 source_ambient_color=vec3(.03,.03,.03);
const vec3 source_specular_color=vec3(.5,.5,.5);

const vec3 mat_diffuse_color=vec3(.5,.5,.5);

float PI=3.14159265359;

uniform vec3 u_albedo;
uniform float u_metallic;
uniform float u_roughness;
uniform float u_ao;

// vec3 albedo=u_albedo;
// float metallic=u_metallic;
// float roughness=u_roughness;
float ao=u_ao;

vec3 ambient=vec3(.0);
// Normal Distribution Function - D
//
float DistributionGGX(vec3 N,vec3 H,float roughness)
{
    float a=roughness*roughness;
    float a2=a*a;
    float NdotH=max(dot(N,H),.0001);
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

vec3 rim(vec3 color,float start,float end,float coef)
{
    // vec3 normal = normalize(N);
    // vec3 eye = normalize(-fPosition.xyz);
    vec3 eye=normalize(v_ViewDir-v_pos_World);
    vec3 normal=normalize(v_Normal_World);
    float rim=smoothstep(start,end,1.-dot(normal,eye));
    return clamp(rim,0.,1.)*coef*color;
}

// // Function to get interpolated texel data from a texture with GL_NEAREST property.
// // Bi-Linear interpolation is implemented in this function with the
// // help of nearest four data.
// vec4 tex2DBiLinear(sampler2D textureSampler_i,vec2 texCoord_i){
    //     vec2 fsize=vec2(textureSize(textureSampler_i,0));
    //     vec2 texelSize=1./fsize;
    //     vec4 p0q0=texture(textureSampler_i,texCoord_i);
    //     vec4 p1q0=texture(textureSampler_i,texCoord_i+vec2(texelSize.x,0));
    //     vec4 p0q1=texture(textureSampler_i,texCoord_i+vec2(0,texelSize.y));
    //     vec4 p1q1=texture(textureSampler_i,texCoord_i+vec2(texelSize.x,texelSize.y));
    //     float a=fract(texCoord_i.x*fsize.x);// Get Interpolation factor for X direction.
    
    //     vec4 pInterp_q0=mix(p0q0,p1q0,a);// Interpolates top row in X direction.
    
    //     vec4 pInterp_q1=mix(p0q1,p1q1,a);// Interpolates bottom row in X direction.
    
    //     float b=fract(texCoord_i.y*fsize.y);// Get Interpolation factor for Y direction.
    
    //     return mix(pInterp_q0,pInterp_q1,b);// Interpolate in Y direction.
// }
// //---------------------------------------------------------------

// //---------------------------------------------------------------

void main(){
    
    // float gamma=2.2;
    // // /////////////////////////////////////////////////////////////////
    // vec2 uv=v_uv*2.;
    // vec3 colorTex=vec3(texture2D(samplerTex,uv));
    // colorTex.r=pow(colorTex.r,gamma);
    // colorTex.g=pow(colorTex.g,gamma);
    // colorTex.b=pow(colorTex.b,gamma);
    
    // // //colorTex = pow(colorTex.rgb, 2.2);
    
    // vec3 colorRoughness=vec3(texture2D(samplerRoughnessMap,uv));
    // vec3 colorNormal=normalize(2.*vec3(texture2D(samplerNormalMap,uv))-1.);
    // vec3 colorMetallic=vec3(texture2D(samplerMetallicMap,uv));
    // vec3 colorAO=vec3(texture2D(samplerAOMap,uv));
    
    // vec3 F0=vec3(.04);
    // F0=mix(F0,colorTex,colorMetallic);
    // vec3 Lo=vec3(0.);
    
    // // // v_LightDir_1
    // vec3 N=normalize(vec3(colorNormal.xy*u_normalPower,colorNormal.z*1.));
    // vec3 L=normalize(v_LightDir);// TODO тут возможно нужно вычислять положение источника света в фрагментном шейдере
    // vec3 V=normalize(v_ViewDir);
    // vec3 H=normalize(V+L);
    // float distance=length(v_LightDir_tangent-v_pos_World);
    // float attenuation=1./(distance*distance);
    // //  vec3 radiance = source_diffuse_color * attenuation;
    // vec3 radiance=source_diffuse_color;
    // radiance=radiance*u_shininess;
    
    // // cook-torrance brdf
    // float NDF=DistributionGGX(N,H,colorRoughness.r);
    // float G=GeometrySmith(N,V,L,colorRoughness.r);
    // vec3 F=frenelSchlick(max(dot(H,N),0.),F0);
    // // vec3  F   = rim(vec3(0.5,0.0,0.5),0.6, 0.9, 0.5,N,V);
    // //vec3  F   = vec3(max(dot(H,V),0.0));
    
    // vec3 kS=F;
    // vec3 kD=vec3(1.)-kS;
    // //kD*=1.-step(.8,colorMetallic.r);
    // kD*=1.-colorMetallic;
    // //kD*=vec3(0.);
    
    // vec3 numerator=NDF*G*F;
    // float denominator=4.*max(dot(N,V),0.)*max(dot(N,L),0.);
    // vec3 specular=numerator/max(denominator,.001);
    
    // float NdotL=max(dot(N,L),0.);
    // //Lo += (kD * colorTex / PI + specular) * radiance * NdotL;
    // Lo=(kD*colorTex/PI+specular)*radiance*NdotL;
    
    // /////////////////////////////////////////////////////////////
    // //   vec3 ambient=vec3(.03)*colorTex*colorAO;
    // //   //vec3 ambient=vec3(.01)*colorTex;
    // //   vec3 color=ambient+Lo;
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    vec2 uv=v_uv*2.;
    // vec3 N=normalize(vec3(colorNormal.xy*u_normalPower,colorNormal.z*1.));
    // vec3 N=normalize(v_Normal_World);
    
    //     // NORMAL_tangent
    //     vec2 uv=v_uv*2.;
    //     vec3 Nor=texture2D(samplerNormalMap,uv).rgb;
    //     vec3 colorNormal=normalize(2.*vec3(texture2D(samplerNormalMap,uv))-1.);
    //     vec3 N=normalize(vec3(colorNormal.xy*u_normalPower,colorNormal.z*1.));
    //    // N=v_tbnMatrix*N;
    //     // vec3 V=normalize(v_ViewDir-v_pos_World);
    //     // vec3 V=normalize(v_ViewDir_World);
    //     // vec3 H=normalize(V+L);
    
    // SKY_BOX
    vec3 worldNormal=normalize(v_Normal_World);
    vec3 eyeToSurfaceDir=normalize(v_pos_World-v_ViewDir_World);
    vec3 direction=reflect(eyeToSurfaceDir,worldNormal);
    //vec3 irradiance=textureCube(u_irradianceMap,direction).rgb;
    vec3 irradiance=textureCube(u_irradianceMap,direction,0.).rgb;
    vec3 skyColor=textureCube(u_skyBox,direction,0.).rgb;
    //------------------------
    // vec3 colorNormal=normalize(2.*vec3(texture2D(samplerNormalMap,uv))-1.);
    // //  vec3 N_from_map_1=normalize(vec3(N_from_map.xy*u_normalPower,N_from_map.z*1.));
    
    // ////tangens space
    // vec3 N=normalize(vec3(colorNormal.xy*u_normalPower,colorNormal.z*1.));
    // vec3 L=normalize(v_LightDir_tangent);// TODO тут возможно нужно вычислять положение источника света в фрагментном шейдере
    // vec3 V=normalize(v_ViewDir);
    // vec3 H=normalize(V+L);
    // ////////////////
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    float roughness=vec3(texture2D(samplerRoughnessMap,uv)).r;
    float metallic=vec3(texture2D(samplerMetallicMap,uv)).r;
    vec3 albedo=vec3(texture2D(samplerTex,uv));
    albedo.r=pow(albedo.r,2.2);
    albedo.g=pow(albedo.g,2.2);
    albedo.b=pow(albedo.b,2.2);
    
    vec3 F0=vec3(.04);
    F0=mix(F0,albedo,metallic);
    
    vec3 Lo=vec3(.0);
    
    ////calculate per-light radiance
    vec3 V=normalize(v_ViewDir_World);
    vec3 N=normalize(v_Normal_World);
    vec3 L=normalize(v_LightDir_World-v_pos_World);
    vec3 H=normalize(V+L);
    
    float distance=length(v_LightDir_World-v_pos_World);
    float attenuation=1./(distance*distance);
    
    vec3 radiance=source_diffuse_color;//*attenuation*u_shininess;
    // radiance=radiance*attenuation*u_shininess;
    
    // cook-torrance brdf
    float NDF=DistributionGGX(N,H,roughness);
    float G=GeometrySmith(N,V,L,roughness);
    //vec3 F=frenelSchlick(max(dot(H,N),.0),F0);
    vec3 F=frenelSchlick(max(dot(N,H),.0001),F0);
    
    vec3 kS=F;
    vec3 kD=vec3(1.)-kS;
    kD*=1.-metallic;
    
    vec3 numerator=NDF*G*F;
    float denominator=4.*max(dot(N,V),.0001)*max(dot(N,L),.0001);
    vec3 specular=numerator/max(denominator,.0001);
    
    // // add to outgoing radiance Lo
    //radiance=source_diffuse_color*getIntensityFromPosition(,);
    float NdotL=max(dot(N,L),.0001);
    Lo=(kD*albedo/PI+specular)*radiance*NdotL;
    
    //vec3 ambient=source_ambient_color*albedo*ao;
    // // // //////////////////////////  IBL  ////////////////////////////////////////////////////
    // // vec3 ambient=source_ambient_color*albedo*ao;
    vec3 R=reflect(-V,N);
    vec3 kS_IBL=fresnelSchlickRoughness(max(dot(N,V),.0),F0,roughness);
    vec3 kD_IBL=vec3(1.)-kS_IBL;
    kD_IBL*=1.-metallic;
    vec3 irradiance_IBL=N;
    irradiance_IBL=textureCube(u_irradianceMap,N).rgb;
    
    vec3 diffuse_IBL=irradiance_IBL*albedo*kD_IBL;
    
    float MAX_REFLECTION_LOD=4.;
    vec3 reflectionVector=reflect(-V,N);
    vec3 prefilteredColor=textureCube(u_skyBox,reflectionVector,roughness*MAX_REFLECTION_LOD).rgb;
    vec2 uvLUT=vec2(max(dot(N,V),.001),roughness).rg;
    vec2 brdf=texture2D(u_sampler_LUT,uvLUT).rg;
    vec3 specular_IBL=prefilteredColor*(kS_IBL*brdf.x+brdf.y);
    
    vec3 ambient=(specular_IBL+diffuse_IBL)*ao;
    
    /////////////////////////////////// TEST //////////////////////////////////////////////////
    vec3 color=ambient+Lo;
    //vec3 color=vec3(V);
    //vec3 color=V;
    //color=vec3(G);
    //color=vec3(NDF);
    //color=irradiance_IBL;
    // color=skyColor.rgb;
    //color=kD_IBL;
    //color=diffuse_IBL;
    //color=specular_IBL;
    //color=texture2D(u_sampler_LUT,uvLUT).rgb;
    //color=ambient;
    ///////////////////////////////////////////////////////////////////////////////////////
    color=color/(color+vec3(1.));
    color=pow(color,vec3(1./2.2));
    // color=N;
    // color=vec3(max(dot(N,V),0.));
    //color=vec3(roughness*MAX_REFLECTION_LOD*roughness_mul);
    
    gl_FragColor=vec4(color,1.);
    
}

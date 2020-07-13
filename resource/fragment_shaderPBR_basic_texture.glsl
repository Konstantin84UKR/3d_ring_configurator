precision highp float;

uniform sampler2D samplerTex;
uniform sampler2D samplerShadowMap;
uniform sampler2D samplerNormalMap;
uniform sampler2D samplerRoughnessMap;
uniform sampler2D samplerMetallicMap;

uniform float u_shininess;
uniform float u_diffuse;
uniform float u_normalPower;
uniform vec3 u_Camera;

varying vec2 v_uv;
varying vec3 v_ViewDir;
varying vec3 v_Normal;

varying vec3 v_pos_tangent;
varying vec3 v_ViewDir_tangent;
varying vec3 v_LightDir_tangent;

varying vec3 v_pos_World;
varying vec3 v_LightDir_World;
varying vec3 v_ViewDir_World;
varying vec3 v_Normal_World;
varying vec3 v_tbnMatrix;

const vec3 source_diffuse_color=vec3(1.,1.,1.);
const vec3 source_ambient_color=vec3(.03,.03,.03);
const vec3 source_specular_color=vec3(.5,.5,.5);

const vec3 mat_diffuse_color=vec3(.5,.5,.5);

float PI=3.14159265359;

vec3 albedo=vec3(.9333,.6,.0392);
float metallic=.0;
float roughness=.1;
float ao=.5;
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

void main(){
    
    // vec3 N=normalize(vec3(colorNormal.xy*u_normalPower,colorNormal.z*1.));
    // vec3 N=normalize(v_Normal_World);
    
    //NORMAL_tangent
    vec2 uv=v_uv*2.;
    vec3 colorNormal=normalize(2.*vec3(texture2D(samplerNormalMap,uv))-1.);
    vec3 N_tangent=normalize(vec3(colorNormal.xy*u_normalPower,colorNormal.z*1.));
    vec3 V_tangent=normalize(v_LightDir_tangent);
    vec3 L_tangent=normalize(v_LightDir_tangent-v_pos_tangent);
    vec3 H_tangent=normalize(V_tangent+L_tangent);
    
    vec3 NN_tangent_2=normalize(v_tbnMatrix*N_tangent);
    
    vec3 F0=vec3(.04);
    F0=mix(F0,albedo,metallic);
    
    vec3 Lo=vec3(.0);
    
    // calculate per-light radiance
    vec3 V=normalize(v_ViewDir_World);
    vec3 N=normalize(v_Normal_World);
    vec3 L=normalize(v_LightDir_World-v_pos_World);
    vec3 H=normalize(V+L);
    
    float distance=length(v_LightDir_World-v_pos_World);
    float attenuation=1./(distance*distance);
    vec3 radiance=source_diffuse_color;//*attenuation*u_shininess;
    
    // cook-torrance brdf
    float NDF=DistributionGGX(N,H,roughness);
    float G=GeometrySmith(N,V,L,roughness);
    vec3 F=frenelSchlick(max(dot(H,N),.0),F0);
    
    vec3 kS=F;
    vec3 kD=vec3(1.)-kS;
    kD*=1.-metallic;
    
    vec3 numerator=NDF*G*F;
    float denominator=4.*max(dot(N,V),0.)*max(dot(N,L),0.);
    vec3 specular=numerator/max(denominator,.001);
    
    // // add to outgoing radiance Lo
    float NdotL=max(dot(N,L),0.);
    Lo=(kD*albedo/PI+specular)*radiance*NdotL;
    
    vec3 ambient=source_ambient_color*albedo*ao;
    vec3 color=ambient+Lo;
    
    color=color/(color+vec3(1.));
    color=pow(color,vec3(1./2.2));
    
    // color=vec3(max(dot(N,V),0.));
    //color=source_specular_color;
    
    gl_FragColor=vec4(color,1.);
    
}

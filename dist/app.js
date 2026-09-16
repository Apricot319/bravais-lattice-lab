(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const canvas = $('latticeCanvas');
  const ctx = canvas.getContext('2d');
  canvas.tabIndex = 0;

  const COLORS = ['#5eead4', '#fbbf24', '#a78bfa', '#fb7185', '#60a5fa'];
  const CENTER_NAMES = { P: '原始点阵', I: '体心点阵', F: '面心点阵', C: '底心点阵', R: '菱方点阵' };
  const SYSTEM_NAMES = { triclinic: '三斜晶系', monoclinic: '单斜晶系', orthorhombic: '正交晶系', tetragonal: '四方晶系', hexagonal: '六方晶系', rhombohedral: '菱方晶系', cubic: '立方晶系' };
  const SYSTEM_PREFIX = { triclinic: 'a', monoclinic: 'm', orthorhombic: 'o', tetragonal: 't', hexagonal: 'h', rhombohedral: 'h', cubic: 'c' };
  const LATTICE_NAMES = {
    aP: '三斜原始', mP: '单斜原始', mC: '单斜底心', oP: '正交原始', oC: '正交底心', oI: '正交体心', oF: '正交面心',
    tP: '四方原始', tI: '四方体心', hP: '六方原始', hR: '菱方点阵', cP: '简单立方', cI: '体心立方', cF: '面心立方'
  };

  const BRAVAIS = [
    { id:'aP', code:'aP', system:'triclinic', center:'P', name:'三斜原始', example:'K₂Cr₂O₇', p:[7.42,7.65,13.37,96.2,96.6,87.9] },
    { id:'mP', code:'mP', system:'monoclinic', center:'P', name:'单斜原始', example:'β-S₈', p:[10.70,10.90,10.50,90,96.2,90] },
    { id:'mC', code:'mC', system:'monoclinic', center:'C', name:'单斜底心', example:'CuO', p:[4.69,3.42,5.13,90,99.5,90] },
    { id:'oP', code:'oP', system:'orthorhombic', center:'P', name:'正交原始', example:'文石 CaCO₃', p:[4.96,7.97,5.74,90,90,90] },
    { id:'oC', code:'oC', system:'orthorhombic', center:'C', name:'正交底心', example:'黑磷', p:[3.31,10.48,4.38,90,90,90] },
    { id:'oI', code:'oI', system:'orthorhombic', center:'I', name:'正交体心', example:'NaNO₂', p:[3.57,5.56,5.39,90,90,90] },
    { id:'oF', code:'oF', system:'orthorhombic', center:'F', name:'正交面心', example:'α-S₈', p:[10.46,12.87,24.49,90,90,90] },
    { id:'tP', code:'tP', system:'tetragonal', center:'P', name:'四方原始', example:'金红石 TiO₂', p:[4.59,4.59,2.96,90,90,90] },
    { id:'tI', code:'tI', system:'tetragonal', center:'I', name:'四方体心', example:'β-Sn', p:[5.83,5.83,3.18,90,90,90] },
    { id:'hP', code:'hP', system:'hexagonal', center:'P', name:'六方原始', example:'Mg（hcp）', p:[3.21,3.21,5.21,90,90,120] },
    { id:'hR', code:'hR', system:'rhombohedral', center:'R', name:'菱方点阵', example:'Bi', p:[4.75,4.75,4.75,57.23,57.23,57.23] },
    { id:'cP', code:'cP', system:'cubic', center:'P', name:'简单立方', example:'α-Po', p:[3.35,3.35,3.35,90,90,90], species:'Po' },
    { id:'cI', code:'cI', system:'cubic', center:'I', name:'体心立方', example:'W', p:[3.165,3.165,3.165,90,90,90], species:'W' },
    { id:'cF', code:'cF', system:'cubic', center:'F', name:'面心立方', example:'Cu', p:[3.615,3.615,3.615,90,90,90], species:'Cu' }
  ];

  const fcc = [[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]];
  const STRUCTURES = [
    { id:'nacl', code:'cF', system:'cubic', center:'F', name:'岩盐结构', example:'NaCl', p:[5.64,5.64,5.64,90,90,90], packing:null, nearest:2.82,
      atoms:[...fcc.map(f=>({f,s:'Cl',c:'#5eead4'})), ...[[.5,0,0],[0,.5,0],[0,0,.5],[.5,.5,.5]].map(f=>({f,s:'Na',c:'#a78bfa'}))], coordination:[['Na',6,'Cl'],['Cl',6,'Na']] },
    { id:'cscl', code:'cP', system:'cubic', center:'P', name:'氯化铯结构', example:'CsCl', p:[4.12,4.12,4.12,90,90,90], packing:null, nearest:3.57,
      atoms:[{f:[0,0,0],s:'Cs',c:'#a78bfa'},{f:[.5,.5,.5],s:'Cl',c:'#5eead4'}], coordination:[['Cs',8,'Cl'],['Cl',8,'Cs']] },
    { id:'diamond', code:'cF', system:'cubic', center:'F', name:'金刚石结构', example:'C', p:[3.57,3.57,3.57,90,90,90], packing:.340, nearest:1.55,
      atoms:[...fcc,...[[.25,.25,.25],[.25,.75,.75],[.75,.25,.75],[.75,.75,.25]]].map(f=>({f,s:'C',c:'#60a5fa'})), coordination:[['C',4,'C']] },
    { id:'zns', code:'cF', system:'cubic', center:'F', name:'闪锌矿结构', example:'ZnS', p:[5.41,5.41,5.41,90,90,90], packing:null, nearest:2.34,
      atoms:[...fcc.map(f=>({f,s:'S',c:'#fbbf24'})), ...[[.25,.25,.25],[.25,.75,.75],[.75,.25,.75],[.75,.75,.25]].map(f=>({f,s:'Zn',c:'#a78bfa'}))], coordination:[['Zn',4,'S'],['S',4,'Zn']] },
    { id:'hcp', code:'hP', system:'hexagonal', center:'P', name:'六方最密堆积', example:'Mg', p:[3.21,3.21,5.21,90,90,120], packing:.7405, nearest:3.21,
      atoms:[{f:[0,0,0],s:'Mg',c:'#5eead4'},{f:[2/3,1/3,.5],s:'Mg',c:'#5eead4'}], coordination:[['Mg',12,'Mg']] }
  ];

  const state = {
    yaw:-.62, pitch:.58, zoom:1, perspective:.62, atomSize:.92, auto:true, dragging:false, moved:0,
    modelMatrix:[[1,0,0],[0,1,0],[0,0,1]], displayMatrix:[[1,0,0],[0,1,0],[0,0,1]],
    model:null, currentPreset:null, sceneRadius:1, hitAreas:[], hover:null, animation:null, dpr:1, toastTimer:null
  };

  const V = {
    add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
    scale:(a,s)=>[a[0]*s,a[1]*s,a[2]*s], dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
    cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
    norm:a=>Math.hypot(a[0],a[1],a[2]), unit(a){ const n=this.norm(a)||1; return this.scale(a,1/n); }
  };
  const M = {
    mul:(a,b)=>a.map(r=>b[0].map((_,j)=>r[0]*b[0][j]+r[1]*b[1][j]+r[2]*b[2][j])),
    vec:(m,v)=>[V.dot(m[0],v),V.dot(m[1],v),V.dot(m[2],v)],
    rot(axis,angle){ const [x,y,z]=V.unit(axis), c=Math.cos(angle), s=Math.sin(angle), t=1-c; return [[t*x*x+c,t*x*y-s*z,t*x*z+s*y],[t*x*y+s*z,t*y*y+c,t*y*z-s*x],[t*x*z-s*y,t*y*z+s*x,t*z*z+c]]; },
    reflectPartial(normal,t){ const [x,y,z]=V.unit(normal), k=2*t; return [[1-k*x*x,-k*x*y,-k*x*z],[-k*y*x,1-k*y*y,-k*y*z],[-k*z*x,-k*z*y,1-k*z*z]]; }
  };

  function latticeVectors(p) {
    const [a,b,c,alpha,beta,gamma] = p;
    const ar=alpha*Math.PI/180, br=beta*Math.PI/180, gr=gamma*Math.PI/180;
    const sg=Math.sin(gr), ax=[a,0,0], bx=[b*Math.cos(gr),b*sg,0];
    const cx=c*Math.cos(br), cy=c*(Math.cos(ar)-Math.cos(br)*Math.cos(gr))/(Math.abs(sg)<1e-8?1e-8:sg);
    const cz2=Math.max(0,c*c-cx*cx-cy*cy);
    return [ax,bx,[cx,cy,Math.sqrt(cz2)]];
  }

  function fracToCart(f, vectors, centered=false) {
    const q=centered?[f[0]-.5,f[1]-.5,f[2]-.5]:f;
    return [vectors[0][0]*q[0]+vectors[1][0]*q[1]+vectors[2][0]*q[2], vectors[0][1]*q[0]+vectors[1][1]*q[1]+vectors[2][1]*q[2], vectors[0][2]*q[0]+vectors[1][2]*q[1]+vectors[2][2]*q[2]];
  }

  function cellVolume(p) {
    const [a,b,c,al,be,ga]=p, A=al*Math.PI/180, B=be*Math.PI/180, G=ga*Math.PI/180;
    const q=1+2*Math.cos(A)*Math.cos(B)*Math.cos(G)-Math.cos(A)**2-Math.cos(B)**2-Math.cos(G)**2;
    return a*b*c*Math.sqrt(Math.max(0,q));
  }

  function centerOffsets(center) {
    if(center==='I') return [[0,0,0],[.5,.5,.5]];
    if(center==='F') return [[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]];
    if(center==='C') return [[0,0,0],[.5,.5,0]];
    return [[0,0,0]];
  }

  function boundaryLatticePoints(center) {
    const out=[];
    for(const x of [0,1]) for(const y of [0,1]) for(const z of [0,1]) out.push([x,y,z]);
    if(center==='I') out.push([.5,.5,.5]);
    if(center==='F') out.push([.5,.5,0],[.5,.5,1],[.5,0,.5],[.5,1,.5],[0,.5,.5],[1,.5,.5]);
    if(center==='C') out.push([.5,.5,0],[.5,.5,1]);
    return out;
  }

  function expandBasis(atoms) {
    const out=[], seen=new Set(), eps=1e-7;
    for(const atom of atoms) for(let i=-1;i<=1;i++) for(let j=-1;j<=1;j++) for(let k=-1;k<=1;k++) {
      const f=[atom.f[0]+i,atom.f[1]+j,atom.f[2]+k];
      if(f.every(x=>x>=-eps&&x<=1+eps)) {
        const key=`${atom.s}:${f.map(x=>Math.round(x*1e5)).join(',')}`;
        if(!seen.has(key)){ seen.add(key); out.push({...atom,f}); }
      }
    }
    return out;
  }

  function nearestBravais(model) {
    const points=[];
    for(let i=-2;i<=2;i++) for(let j=-2;j<=2;j++) for(let k=-2;k<=2;k++) for(const o of centerOffsets(model.center)) {
      const f=[i+o[0],j+o[1],k+o[2]];
      if(Math.abs(f[0])+Math.abs(f[1])+Math.abs(f[2])<1e-9) continue;
      const r=fracToCart(f,model.vectors), d=V.norm(r);
      if(d>1e-7) points.push(d);
    }
    points.sort((a,b)=>a-b);
    const nearest=points[0]||0, tol=Math.max(1e-4,nearest*.006), cn=points.filter(d=>Math.abs(d-nearest)<tol).length;
    const count=centerOffsets(model.center).length;
    const packing=model.volume>0?count*(4/3)*Math.PI*(nearest/2)**3/model.volume:0;
    return { nearest, cn, count, packing:Math.min(packing,1) };
  }

  function wsPolyhedron(model) {
    const raw=[];
    for(let i=-2;i<=2;i++) for(let j=-2;j<=2;j++) for(let k=-2;k<=2;k++) for(const o of centerOffsets(model.center)) {
      const f=[i+o[0],j+o[1],k+o[2]];
      if(Math.abs(f[0])+Math.abs(f[1])+Math.abs(f[2])<1e-9) continue;
      const n=fracToCart(f,model.vectors), len=V.norm(n);
      if(len>1e-6) raw.push({n,d:V.dot(n,n)/2,len});
    }
    raw.sort((a,b)=>a.len-b.len);
    const planes=[], seen=new Set();
    for(const p of raw){
      const key=p.n.map(x=>Math.round(x*1e5)).join(',');
      if(!seen.has(key)){seen.add(key);planes.push(p);}
      if(planes.length>=42) break;
    }
    const vertices=[], tol=Math.max(...model.p.slice(0,3))**2*1e-6;
    for(let i=0;i<planes.length-2;i++) for(let j=i+1;j<planes.length-1;j++) for(let k=j+1;k<planes.length;k++) {
      const p=planes[i],q=planes[j],r=planes[k], det=V.dot(p.n,V.cross(q.n,r.n));
      if(Math.abs(det)<1e-9) continue;
      let x=V.add(V.add(V.scale(V.cross(q.n,r.n),p.d),V.scale(V.cross(r.n,p.n),q.d)),V.scale(V.cross(p.n,q.n),r.d));
      x=V.scale(x,1/det);
      if(planes.every(h=>V.dot(h.n,x)<=h.d+tol) && !vertices.some(v=>V.norm(V.sub(v,x))<1e-4)) vertices.push(x);
    }
    const active=vertices.map(v=>planes.map((p,i)=>Math.abs(V.dot(p.n,v)-p.d)<Math.max(1e-4,p.d*2e-5)?i:-1).filter(i=>i>=0));
    const edges=[];
    for(let i=0;i<vertices.length;i++) for(let j=i+1;j<vertices.length;j++) {
      let common=0; for(const x of active[i]) if(active[j].includes(x)) common++;
      if(common>=2) edges.push([i,j]);
    }
    return {vertices,edges};
  }

  function perpendicularBasis(n) {
    n=V.unit(n); const seed=Math.abs(n[2])<.85?[0,0,1]:[1,0,0]; const u=V.unit(V.cross(n,seed)); return [u,V.unit(V.cross(n,u))];
  }

  function symmetryElements(model) {
    const axes=[], planes=[];
    const axis=(dir,order,label)=>axes.push({type:'axis',dir:V.unit(dir),order,label:label||`C${order}`});
    const plane=(normal,label)=>planes.push({type:'plane',normal:V.unit(normal),label:label||'镜面 m'});
    const sys=model.system;
    if(sys==='cubic') {
      [[1,0,0],[0,1,0],[0,0,1]].forEach((d,i)=>axis(d,4,`C₄ · ${['[100]','[010]','[001]'][i]}`));
      [[1,1,1],[1,1,-1],[1,-1,1],[-1,1,1]].forEach(d=>axis(d,3,'C₃ · ⟨111⟩'));
      [[1,1,0],[1,-1,0],[1,0,1],[1,0,-1],[0,1,1],[0,1,-1]].forEach(d=>axis(d,2,'C₂ · ⟨110⟩'));
      [[1,0,0],[0,1,0],[0,0,1]].forEach(n=>plane(n,'m · {100}'));
      [[1,1,0],[1,-1,0],[1,0,1],[1,0,-1],[0,1,1],[0,1,-1]].forEach(n=>plane(n,'m · {110}'));
    } else if(sys==='tetragonal') {
      axis([0,0,1],4,'C₄ · [001]'); [[1,0,0],[0,1,0],[1,1,0],[1,-1,0]].forEach(d=>axis(d,2,'C₂ · 基面'));
      [[0,0,1],[1,0,0],[0,1,0],[1,1,0],[1,-1,0]].forEach(n=>plane(n,n[2]?'m · (001)':'m · 竖直'));
    } else if(sys==='orthorhombic') {
      [[1,0,0],[0,1,0],[0,0,1]].forEach((d,i)=>axis(d,2,`C₂ · ${['[100]','[010]','[001]'][i]}`));
      [[1,0,0],[0,1,0],[0,0,1]].forEach((n,i)=>plane(n,`m · ${['(100)','(010)','(001)'][i]}`));
    } else if(sys==='hexagonal') {
      axis([0,0,1],6,'C₆ · [001]');
      for(let k=0;k<6;k++){ const a=k*Math.PI/6; axis([Math.cos(a),Math.sin(a),0],2,'C₂ · 基面'); }
      plane([0,0,1],'m · (001)'); for(let k=0;k<6;k++){ const a=k*Math.PI/6; plane([Math.cos(a),Math.sin(a),0],'m · 竖直'); }
    } else if(sys==='rhombohedral') {
      const tri=V.unit(V.add(V.add(model.vectors[0],model.vectors[1]),model.vectors[2])); axis(tri,3,'C₃ · 三方轴');
      const [u,v]=perpendicularBasis(tri);
      for(let k=0;k<3;k++){ const a=k*Math.PI/3; axis(V.add(V.scale(u,Math.cos(a)),V.scale(v,Math.sin(a))),2,'C₂ · 基面'); }
      for(let k=0;k<3;k++){ const a=k*Math.PI/3; plane(V.add(V.scale(u,Math.cos(a)),V.scale(v,Math.sin(a))),'m · 竖直'); }
    } else if(sys==='monoclinic') {
      const b=V.unit(model.vectors[1]); axis(b,2,'C₂ · b 轴'); plane(b,'m · ⟂b');
    }
    return {axes,planes};
  }

  function validateParams(p) {
    return p.slice(0,3).every(x=>Number.isFinite(x)&&x>0) && p.slice(3).every(x=>Number.isFinite(x)&&x>0&&x<180) && cellVolume(p)>1e-6;
  }

  function classify(p, requestedCenter) {
    const [a,b,c,al,be,ga]=p, lenEq=(x,y)=>Math.abs(x-y)<=Math.max(x,y)*.018, ang=(x,y)=>Math.abs(x-y)<=1.2;
    const all90=ang(al,90)&&ang(be,90)&&ang(ga,90), allLen=lenEq(a,b)&&lenEq(b,c), allAng=lenEq(al,be)&&lenEq(be,ga);
    let system;
    if(allLen&&allAng&&!all90) system='rhombohedral';
    else if(lenEq(a,b)&&ang(al,90)&&ang(be,90)&&ang(ga,120)) system='hexagonal';
    else if(all90) system=allLen?'cubic':lenEq(a,b)?'tetragonal':'orthorhombic';
    else if(ang(al,90)&&ang(ga,90)) system='monoclinic';
    else system='triclinic';
    const allowed={triclinic:['P'],monoclinic:['P','C'],orthorhombic:['P','C','I','F'],tetragonal:['P','I'],hexagonal:['P'],rhombohedral:['R'],cubic:['P','I','F']}[system];
    let center=requestedCenter, adjusted=false;
    if(!allowed.includes(center)) { adjusted=true; center=system==='rhombohedral'?'R':(system==='monoclinic'&&requestedCenter!=='P'?'C':(system==='tetragonal'&&requestedCenter==='F'?'I':'P')); }
    const code=SYSTEM_PREFIX[system]+center;
    return {system,center,code,name:LATTICE_NAMES[code]||`${SYSTEM_NAMES[system]} ${CENTER_NAMES[center]}`,adjusted,confidence:adjusted?88:100};
  }

  function createModel(source, custom=false) {
    const p=source.p.slice(), model={...source,p,kind:source.atoms?'structure':(custom?'custom':'bravais')};
    model.vectors=latticeVectors(p); model.volume=cellVolume(p);
    if(source.atoms) {
      model.displayAtoms=expandBasis(source.atoms).map(a=>({...a,pos:fracToCart(a.f,model.vectors,true)}));
      model.metrics={nearest:source.nearest,packing:source.packing,count:centerOffsets(source.center).length,cn:source.coordination[0][1]};
    } else {
      const color=source.code==='cF'?'#60a5fa':source.code==='cI'?'#a78bfa':'#5eead4';
      model.displayAtoms=boundaryLatticePoints(source.center).map(f=>({f,s:source.species||'格点',c:color,pos:fracToCart(f,model.vectors,true)}));
      model.metrics=nearestBravais(model);
    }
    model.ws=wsPolyhedron(model); model.symmetry=symmetryElements(model);
    const cellCorners=[]; for(const x of [0,1]) for(const y of [0,1]) for(const z of [0,1]) cellCorners.push(fracToCart([x,y,z],model.vectors,true));
    model.cellCorners=cellCorners;
    state.sceneRadius=Math.max(1,...cellCorners.map(V.norm),...model.ws.vertices.map(V.norm))*1.16;
    return model;
  }

  function inputParams(){ return [+$('paramA').value,+$('paramB').value,+$('paramC').value,+$('paramAlpha').value,+$('paramBeta').value,+$('paramGamma').value]; }
  function setInputs(p,center){ ['paramA','paramB','paramC','paramAlpha','paramBeta','paramGamma'].forEach((id,i)=>$(id).value=p[i]); $('centering').value=center; }

  function updateCustom(showMessage=true) {
    const p=inputParams();
    if(!validateParams(p)){ showToast('参数不能构成有效的三维晶胞，请检查长度与夹角。',true); return false; }
    const result=classify(p,$('centering').value);
    if(result.adjusted){ $('centering').value=result.center; if(showMessage) showToast(`该中心化与${SYSTEM_NAMES[result.system]}不构成独立格子，已约化为 ${result.code}。`); }
    const custom={id:'custom',...result,p,example:'自定义参数',species:'X'};
    state.currentPreset=null; $('templateSelect').value='custom'; applyModel(createModel(custom,true));
    if(showMessage&&!result.adjusted) showToast(`判定为 ${result.code} · ${result.name}`);
    return true;
  }

  function loadPreset(id,announce=false) {
    const preset=[...BRAVAIS,...STRUCTURES].find(x=>x.id===id) || BRAVAIS.find(x=>x.id==='cP');
    state.currentPreset=preset; setInputs(preset.p,preset.center); $('templateSelect').value=preset.id;
    state.modelMatrix=[[1,0,0],[0,1,0],[0,0,1]]; state.animation=null;
    applyModel(createModel(preset));
    document.querySelectorAll('.template-card').forEach(c=>c.classList.toggle('active',c.dataset.id===preset.id));
    if(announce) showToast(`已载入 ${preset.name} · ${preset.example}`);
  }

  function applyModel(model) {
    state.model=model;
    $('viewerTitle').textContent=`${model.name} · ${model.example}`;
    $('bravaisCode').textContent=model.code; $('bravaisName').textContent=model.name;
    $('bravaisSystem').textContent=`${SYSTEM_NAMES[model.system]} · ${CENTER_NAMES[model.center]}`;
    $('confidenceValue').textContent=`${model.confidence||100}%`; $('confidenceBar').style.width=`${model.confidence||100}%`;
    $('cellVolume').textContent=formatNumber(model.volume); $('latticePoints').textContent=model.metrics.count;
    $('neighborDistance').textContent=model.metrics.nearest?formatNumber(model.metrics.nearest):'暂无';
    $('packingFraction').textContent=model.metrics.packing==null?'暂无':formatNumber(model.metrics.packing*100,1);
    $('packingUnit').textContent=model.metrics.packing==null?'':'%';
    updateCoordination(model); updateSymmetrySummary(model);
    if(model.kind==='structure') $('structureNote').textContent='当前模板显示晶体的完整基元；离子晶体的堆积率取决于离子半径，因此不作唯一数值估算。';
    else if(model.kind==='bravais'&&!['cP','cI','cF'].includes(model.code)) $('structureNote').textContent=`当前显示 ${model.code} 布拉维格点；${model.example} 作为代表材料，其复杂原子基元已简化。`;
    else $('structureNote').textContent='等半径硬球按最近邻相切估算堆积率；边界格点按晶胞共享关系计数。';
  }

  function updateCoordination(model) {
    const rows=model.coordination||[[model.species||'格点',model.metrics.cn,model.species||'同种格点']];
    $('coordinationList').innerHTML=rows.map((r,i)=>`<div class="atom-row"><span class="atom-swatch" style="color:${COLORS[i%COLORS.length]};background:${COLORS[i%COLORS.length]}"></span><div><b>${r[0]}</b><small>最近邻 ${r[1]} · ${r[2]}</small></div><strong>CN ${r[1]}</strong></div>`).join('');
  }

  function updateSymmetrySummary(model) {
    const a=model.symmetry.axes, p=model.symmetry.planes, groups={};
    a.forEach(x=>groups[`C${x.order}`]=(groups[`C${x.order}`]||0)+1);
    const parts=Object.entries(groups).map(([k,v])=>`<button type="button" data-sym="axis" data-order="${k.slice(1)}">${k.replace(/(\d)/,c=>'₀₁₂₃₄₅₆₇₈₉'[+c])} ×${v}</button>`);
    if(p.length) parts.push(`<button type="button" data-sym="plane">m ×${p.length}</button>`);
    $('symmetryTags').innerHTML=parts.length?parts.join(''):'<span class="symmetry-empty">仅有反心（无旋转轴或镜面）</span>';
    $('symmetryCount').textContent=`${a.length+p.length} 个`;
    $('symmetryHint').textContent=parts.length?'在视图中点击彩色轴或镜面，即可执行对应的对称操作。':'三斜 Bravais 格子的点群为 1̄；反心未单独绘制。';
    $('symmetryTags').querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
      const type=btn.dataset.sym, order=+btn.dataset.order; const el=type==='plane'?p[0]:a.find(x=>x.order===order); if(el) startSymmetry(el);
    }));
  }

  function formatNumber(n,d=2){ if(!Number.isFinite(n)) return '暂无'; if(Math.abs(n)>=1000) return n.toFixed(0); if(Math.abs(n)>=100) return n.toFixed(1); return n.toFixed(d); }
  function showToast(message,error=false){ const t=$('toast'); clearTimeout(state.toastTimer); t.textContent=message; t.style.borderColor=error?'rgba(251,113,133,.45)':''; t.classList.add('show'); state.toastTimer=setTimeout(()=>t.classList.remove('show'),2400); }

  function resize() {
    const rect=canvas.parentElement.getBoundingClientRect(); state.dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(rect.width*state.dpr)); canvas.height=Math.max(1,Math.round(rect.height*state.dpr));
    canvas.style.width=`${rect.width}px`; canvas.style.height=`${rect.height}px`;
    ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
  }

  function viewTransform(v) {
    v=M.vec(state.displayMatrix,v);
    const cy=Math.cos(state.yaw),sy=Math.sin(state.yaw),cp=Math.cos(state.pitch),sp=Math.sin(state.pitch);
    const x=v[0]*cy-v[2]*sy,z=v[0]*sy+v[2]*cy,y=v[1]*cp-z*sp; return [x,y,v[1]*sp+z*cp];
  }

  function project(v) {
    const q=viewTransform(v), rect=canvas.getBoundingClientRect(), radius=state.sceneRadius||1;
    const s=Math.min(rect.width,rect.height)*.38*state.zoom/radius, perspective=Math.max(.64,1+(q[2]/radius)*.22*state.perspective);
    return {x:rect.width/2+q[0]*s/perspective,y:rect.height/2+q[1]*s/perspective,z:q[2],p:perspective};
  }

  function line(a,b,color,width=1.2,dash=[]) { const p=project(a),q=project(b); ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.restore(); return [p,q]; }
  function polygon(points,fill,stroke,width=1,dash=[]) { const p=points.map(project);ctx.save();ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();return p; }

  function drawAtom(atom) {
    const p=project(atom.pos), r=Math.max(3.5,13*state.atomSize/Math.max(.68,p.p));
    const g=ctx.createRadialGradient(p.x-r*.38,p.y-r*.42,r*.06,p.x,p.y,r); g.addColorStop(0,'#fff');g.addColorStop(.18,atom.c);g.addColorStop(.68,atom.c+'cc');g.addColorStop(1,'#07101b');
    ctx.save();ctx.shadowColor=atom.c;ctx.shadowBlur=10;ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,.34)';ctx.lineWidth=.7;ctx.stroke();ctx.restore();
  }

  const CELL_EDGES=[[0,4],[4,6],[6,2],[2,0],[1,5],[5,7],[7,3],[3,1],[0,1],[4,5],[6,7],[2,3]];

  function drawSymmetry(model) {
    state.hitAreas=[]; const L=state.sceneRadius*.94;
    if($('togglePlanes').checked) for(const el of model.symmetry.planes) {
      const [u,v]=perpendicularBasis(el.normal), s=L*.72, pts=[V.add(V.scale(u,s),V.scale(v,s)),V.add(V.scale(u,-s),V.scale(v,s)),V.add(V.scale(u,-s),V.scale(v,-s)),V.add(V.scale(u,s),V.scale(v,-s))];
      const hovered=state.hover===el, poly=polygon(pts,hovered?'rgba(94,234,212,.16)':'rgba(94,234,212,.075)',hovered?'rgba(94,234,212,.72)':'rgba(94,234,212,.25)',hovered?1.4:.8,[5,6]);
      state.hitAreas.push({el,kind:'plane',poly});
    }
    if($('toggleAxes').checked) for(const el of model.symmetry.axes) {
      const a=V.scale(el.dir,-L),b=V.scale(el.dir,L),hovered=state.hover===el,[p,q]=line(a,b,hovered?'rgba(251,191,36,.98)':'rgba(167,139,250,.78)',hovered?3:1.7,[7,5]);
      ctx.save();ctx.fillStyle=hovered?'#fbbf24':'#c4b5fd';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=7;ctx.beginPath();ctx.arc(q.x,q.y,hovered?4.2:3.2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.font='700 11px ui-monospace,monospace';ctx.fillText(`C${el.order}`,q.x+6,q.y-5);ctx.restore();
      state.hitAreas.push({el,kind:'axis',a:p,b:q});
    }
  }

  function render(t) {
    const rect=canvas.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);
    if(!state.model){requestAnimationFrame(render);return;}
    if(state.auto&&!state.dragging&&!state.animation) state.yaw+=.0017;
    if(state.animation) {
      const u=Math.min(1,(t-state.animation.start)/state.animation.duration),e=u<.5?2*u*u:1-((-2*u+2)**2)/2;
      const op=state.animation.el.type==='axis'?M.rot(state.animation.el.dir,Math.PI*2/state.animation.el.order*e):M.reflectPartial(state.animation.el.normal,e);
      state.displayMatrix=M.mul(state.animation.base,op);
      if(u>=1){state.modelMatrix=state.displayMatrix;const label=state.animation.el.label;state.animation=null;showToast(`已执行 ${label} 对称操作`);}
    } else state.displayMatrix=state.modelMatrix;

    drawSymmetry(state.model);
    CELL_EDGES.forEach(([a,b])=>line(state.model.cellCorners[a],state.model.cellCorners[b],'rgba(152,190,226,.58)',1.25));
    if($('toggleWS').checked) state.model.ws.edges.forEach(([a,b])=>line(state.model.ws.vertices[a],state.model.ws.vertices[b],'rgba(251,191,36,.92)',1.55));
    const atoms=[...state.model.displayAtoms].sort((a,b)=>viewTransform(a.pos)[2]-viewTransform(b.pos)[2]); atoms.forEach(drawAtom);
    requestAnimationFrame(render);
  }

  function pointSegDistance(p,a,b) { const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)),x=a.x+t*dx,y=a.y+t*dy;return Math.hypot(p.x-x,p.y-y); }
  function pointInPoly(p,poly){ let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x))inside=!inside;}return inside; }
  function hitTest(p){ const axis=state.hitAreas.filter(h=>h.kind==='axis').find(h=>pointSegDistance(p,h.a,h.b)<11); if(axis)return axis.el; const plane=[...state.hitAreas].reverse().find(h=>h.kind==='plane'&&pointInPoly(p,h.poly));return plane?.el||null; }

  function startSymmetry(el) { if(state.animation)return; state.auto=false;$('autoRotate').classList.remove('active');state.animation={el,base:state.modelMatrix,start:performance.now(),duration:el.type==='axis'?820:680}; }

  function pointerPosition(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  canvas.addEventListener('pointerdown',e=>{state.dragging=true;state.moved=0;state.lastX=e.clientX;state.lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{
    if(state.dragging){const dx=e.clientX-state.lastX,dy=e.clientY-state.lastY;state.moved+=Math.hypot(dx,dy);state.yaw+=dx*.0075;state.pitch=Math.max(-1.48,Math.min(1.48,state.pitch+dy*.0075));state.lastX=e.clientX;state.lastY=e.clientY;return;}
    const hit=hitTest(pointerPosition(e));state.hover=hit;canvas.style.cursor=hit?'pointer':'grab';const tt=$('elementTooltip');if(hit){const p=pointerPosition(e);tt.textContent=hit.label;tt.style.left=`${p.x}px`;tt.style.top=`${p.y}px`;tt.style.opacity=1;}else tt.style.opacity=0;
  });
  canvas.addEventListener('pointerleave',()=>{if(!state.dragging){state.hover=null;$('elementTooltip').style.opacity=0;}});
  canvas.addEventListener('pointerup',e=>{state.dragging=false;if(state.moved<5){const hit=hitTest(pointerPosition(e));if(hit)startSymmetry(hit);}});
  canvas.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.max(.48,Math.min(2.2,state.zoom*Math.exp(-e.deltaY*.001)));},{passive:false});
  canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')state.yaw-=.1;if(e.key==='ArrowRight')state.yaw+=.1;if(e.key==='ArrowUp')state.pitch-=.1;if(e.key==='ArrowDown')state.pitch+=.1;}if(e.key==='+'||e.key==='=')state.zoom=Math.min(2.2,state.zoom*1.1);if(e.key==='-')state.zoom=Math.max(.48,state.zoom/1.1);});

  function populateUI() {
    $('templateSelect').innerHTML=`<option value="custom">自定义参数</option><optgroup label="14 种布拉维格子">${BRAVAIS.map(x=>`<option value="${x.id}">${x.code} ${x.name}（${x.example}）</option>`).join('')}</optgroup><optgroup label="经典结构（完整基元）">${STRUCTURES.map(x=>`<option value="${x.id}">${x.name}（${x.example}）</option>`).join('')}</optgroup>`;
    $('templateGrid').innerHTML=BRAVAIS.map(x=>`<button type="button" class="template-card" data-id="${x.id}"><span class="template-code">${x.code}</span><b>${x.name}</b><small>${SYSTEM_NAMES[x.system]} · 代表：${x.example}</small></button>`).join('');
    $('templateGrid').querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{loadPreset(btn.dataset.id,true);$('templateDialog').close();}));
  }

  $('templateSelect').addEventListener('change',e=>e.target.value==='custom'?updateCustom(false):loadPreset(e.target.value,true));
  $('classifyButton').addEventListener('click',()=>updateCustom(true));
  let inputTimer; ['paramA','paramB','paramC','paramAlpha','paramBeta','paramGamma'].forEach(id=>$(id).addEventListener('input',()=>{clearTimeout(inputTimer);inputTimer=setTimeout(()=>updateCustom(false),280);}));
  $('centering').addEventListener('change',()=>updateCustom(false));
  $('resetParams').addEventListener('click',()=>loadPreset(state.currentPreset?.id||'cP',true));
  $('resetView').addEventListener('click',()=>{state.yaw=-.62;state.pitch=.58;state.zoom=1;state.modelMatrix=[[1,0,0],[0,1,0],[0,0,1]];});
  $('autoRotate').addEventListener('click',e=>{state.auto=!state.auto;e.currentTarget.classList.toggle('active',state.auto);});
  $('atomSize').addEventListener('input',e=>{state.atomSize=+e.target.value/100;$('atomSizeOutput').value=`${e.target.value}%`;});
  $('perspective').addEventListener('input',e=>{state.perspective=+e.target.value/100;$('perspectiveOutput').value=`${e.target.value}%`;});
  $('fullscreen').addEventListener('click',()=>document.fullscreenElement?document.exitFullscreen():$('canvasWrap').requestFullscreen?.());
  $('openLibrary').addEventListener('click',()=>$('templateDialog').showModal()); $('closeLibrary').addEventListener('click',()=>$('templateDialog').close());
  $('templateDialog').addEventListener('click',e=>{if(e.target===$('templateDialog'))$('templateDialog').close();});
  window.addEventListener('resize',resize);

  function registerWebMCP() {
    const mc=document.modelContext;if(!mc?.registerTool)return;
    const fail=m=>{throw new Error(m);};
    const snapshot=()=>({code:state.model.code,name:state.model.name,system:SYSTEM_NAMES[state.model.system],centering:CENTER_NAMES[state.model.center],volume_angstrom3:+state.model.volume.toFixed(4),nearest_neighbor_angstrom:state.model.metrics.nearest?+state.model.metrics.nearest.toFixed(4):null,packing_fraction:state.model.metrics.packing==null?null:+state.model.metrics.packing.toFixed(4)});
    try{
      mc.registerTool({name:'load_lattice_template',title:'载入晶格模板',description:'在晶格实验室中载入一个布拉维格子或经典晶体结构模板。',inputSchema:{type:'object',properties:{templateId:{type:'string',enum:[...BRAVAIS,...STRUCTURES].map(x=>x.id)}},required:['templateId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:i=>{if(!i||![...BRAVAIS,...STRUCTURES].some(x=>x.id===i.templateId))fail('未知模板');loadPreset(i.templateId,false);return snapshot();}});
      mc.registerTool({name:'set_lattice_parameters',title:'设置晶胞参数',description:'设置 a、b、c、α、β、γ 和中心化类型，判定布拉维格子并更新可视化。',inputSchema:{type:'object',properties:{a:{type:'number',exclusiveMinimum:0},b:{type:'number',exclusiveMinimum:0},c:{type:'number',exclusiveMinimum:0},alpha:{type:'number',exclusiveMinimum:0,exclusiveMaximum:180},beta:{type:'number',exclusiveMinimum:0,exclusiveMaximum:180},gamma:{type:'number',exclusiveMinimum:0,exclusiveMaximum:180},centering:{type:'string',enum:['P','I','F','C','R']}},required:['a','b','c','alpha','beta','gamma','centering'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:i=>{const p=[i?.a,i?.b,i?.c,i?.alpha,i?.beta,i?.gamma];if(!validateParams(p))fail('无效晶胞参数');setInputs(p,i.centering);if(!updateCustom(false))fail('无法构成三维晶胞');return snapshot();}});
      mc.registerTool({name:'get_lattice_analysis',title:'读取晶格分析',description:'读取当前晶格的分类、体积、最近邻距离与堆积率。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>snapshot()});
    }catch(error){console.warn('WebMCP registration unavailable',error);}
  }

  populateUI(); resize(); loadPreset('cP'); registerWebMCP(); requestAnimationFrame(render);
})();

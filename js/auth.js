window.LunaAuth = (() => {
  const key='lunacycle_users', session='lunacycle_session';
  const fb=window.lunaFirebase, firebaseMode=!window.LUNACYCLE_DEMO_MODE && !!fb;
  let firebaseUser=null, profile=null, ready=!firebaseMode;
  const hash = value => { let h=2166136261; for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);} return (h>>>0).toString(16); };
  const users=()=>JSON.parse(localStorage.getItem(key)||'[]');
  const saveUsers=u=>localStorage.setItem(key,JSON.stringify(u));
  const syntheticEmail=username=>`${String(username).trim().toLowerCase()}@accounts.lunacycle.app`;
  const notify=()=>window.dispatchEvent(new Event('luna-auth-ready'));
  if(firebaseMode){
    fb.auth.onAuthStateChanged(async currentUser=>{
      firebaseUser=currentUser; profile=null;
      if(currentUser){
        const snap=await fb.db.collection('users').doc(currentUser.uid).get();
        profile={uid:currentUser.uid,email:currentUser.email,...(snap.exists?snap.data():{})};
      }
      ready=true; notify();
    });
  }
  function current(){if(firebaseMode)return profile;const id=localStorage.getItem(session);return users().find(u=>u.uid===id)||null;}
  function isFirebase(){return firebaseMode;}
  function isReady(){return ready;}
  function demoRegister(data){const username=data.username.trim().toLowerCase();if(users().some(u=>u.username===username))throw Error('That username is already taken. Try another.');const u={uid:LunaUtils.uid(),firstName:data.firstName.trim(),lastName:data.lastName.trim(),age:Number(data.age),username,passwordHash:hash(data.password),email:syntheticEmail(username),preferences:{theme:'light',periodReminders:false,upcomingReminders:false,defaultCycle:28},createdAt:new Date().toISOString()};const next=users();next.push(u);saveUsers(next);localStorage.setItem(session,u.uid);return u;}
  async function register(data){if(!firebaseMode)return demoRegister(data);const call=fb.functions.httpsCallable('registerWithUsername');await call({firstName:data.firstName.trim(),lastName:data.lastName.trim(),age:Number(data.age),username:data.username.trim(),password:data.password});await fb.auth.signInWithEmailAndPassword(syntheticEmail(data.username),data.password);return current();}
  async function login(username,password){if(!firebaseMode){const u=users().find(x=>x.username===username.trim().toLowerCase());if(!u||u.passwordHash!==hash(password))throw Error('We could not match that username and password.');localStorage.setItem(session,u.uid);return u;}await fb.auth.signInWithEmailAndPassword(syntheticEmail(username),password);return current();}
  async function logout(){if(firebaseMode)await fb.auth.signOut();else localStorage.removeItem(session);}
  async function update(patch){if(firebaseMode&&firebaseUser){const next={...profile,...patch,preferences:{...(profile?.preferences||{}),...(patch.preferences||{})}};await fb.db.collection('users').doc(firebaseUser.uid).set(next,{merge:true});profile=next;notify();return profile;}const u=current();if(!u)return null;const all=users(),i=all.findIndex(x=>x.uid===u.uid);all[i]={...u,...patch,preferences:{...u.preferences,...(patch.preferences||{})}};saveUsers(all);return all[i];}
  return {users,current,register,login,logout,update,isFirebase,isReady};
})();

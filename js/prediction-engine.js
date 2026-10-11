window.PredictionEngine = (() => {
  const valid = records => records.filter(r => r && r.startDate).sort((a,b)=>a.startDate.localeCompare(b.startDate));
  function duration(r){ return r.endDate ? Math.max(1, LunaUtils.diffDays(r.startDate,r.endDate)+1) : null; }
  function calculate(records, defaultLength=28){
    const sorted=valid(records), cycles=[];
    for(let i=1;i<sorted.length;i++){const n=LunaUtils.diffDays(sorted[i-1].startDate,sorted[i].startDate);if(n>=15&&n<=100)cycles.push(n);}
    const completed=sorted.map(duration).filter(Boolean), avgCycle=cycles.length ? Math.round(cycles.reduce((a,b)=>a+b,0)/cycles.length) : defaultLength;
    const avgDuration=completed.length ? Math.round((completed.reduce((a,b)=>a+b,0)/completed.length)*10)/10 : null;
    const last=sorted.at(-1), next=last ? new Date(`${last.startDate}T12:00:00`) : null;
    if(next) next.setDate(next.getDate()+avgCycle);
    const nextDate=next ? LunaUtils.iso(next) : null, variability=cycles.length>1 ? Math.round(Math.sqrt(cycles.reduce((a,b)=>a+(b-avgCycle)**2,0)/cycles.length)*10)/10 : null;
    let phase='Add a period to begin', cycleDay=null;
    if(last){ cycleDay=Math.max(1,LunaUtils.diffDays(last.startDate,LunaUtils.today())+1); if(avgDuration&&cycleDay<=avgDuration)phase='Menstrual phase'; else if(cycleDay<Math.round(avgCycle*.45))phase='Follicular phase'; else if(cycleDay<Math.round(avgCycle*.65))phase='Estimated ovulation window'; else phase='Luteal phase'; }
    const range=variability&&nextDate ? {from:shift(nextDate,-Math.round(variability)),to:shift(nextDate,Math.round(variability))}:null;
    return {sorted,cycles,completed,avgCycle,avgDuration,lastStart:last?.startDate||null,nextDate,range,variability,cycleDay,phase,hasEnough:cycles.length>=2};
  }
  function shift(value,days){const d=LunaUtils.parseDate(value);d.setDate(d.getDate()+days);return LunaUtils.iso(d);}
  return {calculate,duration,shift};
})();

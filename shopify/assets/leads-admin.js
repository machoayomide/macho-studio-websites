(()=>{'use strict';let rows=[];
const $=s=>document.querySelector(s),status=$('#admin-status');
$('#leads-login').addEventListener('submit',async e=>{
 e.preventDefault();let key=$('#admin-key').value;$('#admin-key').value='';rows=[];$('#lead-list').replaceChildren();$('#export-newsletter').hidden=true;$('#export-reviews').hidden=true;status.textContent='Loading…';
 try{let cursor='';do{
  const res=await fetch('/api/leads/report'+(cursor?'?cursor='+encodeURIComponent(cursor):''),{headers:{Authorization:'Bearer '+key},cache:'no-store'});
  const data=await res.json();if(!res.ok)throw Error(res.status===401?'Access denied. Set ADMIN_DASHBOARD_KEY in Cloudflare, redeploy, then use that key here.':data.error||'Could not load contacts.');
  rows.push(...data.leads);cursor=data.cursor||'';
 }while(cursor);
 const table=document.createElement('table'),head=document.createElement('tr');
 for(const text of ['Email','Permission','Saved','Report']){const th=document.createElement('th');th.textContent=text;head.append(th)}table.append(head);
 for(const row of rows){const tr=document.createElement('tr');for(const text of [row.email,row.kind==='newsletter'?(row.newsletter?'Newsletter — active':'Newsletter — unsubscribed'):'Store follow-up only',row.updatedAt,row.report||'—']){const td=document.createElement('td');td.textContent=text;tr.append(td)}table.append(tr)}
 $('#lead-list').append(table);status.textContent=rows.length+' saved records.';$('#export-newsletter').hidden=false;$('#export-reviews').hidden=false;
 }catch(error){rows=[];status.textContent=error.message}finally{key='';}
});
function csvCell(value){let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
function download(kind){const newsletter=kind==='newsletter',selected=rows.filter(r=>newsletter?r.kind==='newsletter'&&r.newsletter===true:r.kind==='store-check');
 const columns=newsletter?['email','newsletterConsentAt','source','consentVersion','newsletterConsent','unsubscribeUrl']:['email','updatedAt','source','consentVersion','followupConsent','report'];
 const lines=[columns,...selected.map(row=>columns.map(k=>k==='unsubscribeUrl'?location.origin+'/newsletter/unsubscribe/?token='+row.unsubscribeToken:row[k]))];
 const blob=new Blob(['\uFEFF'+lines.map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='macho-'+kind+'-'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(url);
}
$('#export-newsletter').addEventListener('click',()=>download('newsletter'));$('#export-reviews').addEventListener('click',()=>download('store-followups'));
})();

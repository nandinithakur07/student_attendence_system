const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
const initials=n=>(n||'User').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
const pct=(p,t)=>t?Math.round(p/t*100):0;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const toast=m=>{const t=$('toast');t.textContent=m;t.className='toast show';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.className='toast',2600)};
const icon=n=>`<i data-lucide="${n}"></i>`;
const seed={users:[
{id:'s1',username:'student',password:'1234',role:'student',name:'Aarav Sharma',email:'aarav@cu.example',studentId:'CU-BCA-001',department:'BCA',semester:3,section:'A'},
{id:'f1',username:'faculty',password:'1234',role:'faculty',name:'Dr. Neha Verma',email:'neha@cu.example',employeeId:'CU-FAC-101',department:'BCA'},
{id:'h1',username:'hod',password:'1234',role:'hod',name:'Prof. Raj Mehta',email:'hod@cu.example',employeeId:'CU-HOD-001',department:'BCA'},
{id:'a1',username:'admin',password:'1234',role:'admin',name:'System Administrator',email:'admin@cu.example',employeeId:'CU-ADM-001',department:'Administration'}],
subjects:['Programming in C','Database Management','Web Development','Computer Networks','Mathematics'],
students:[
{id:'s1',studentId:'CU-BCA-001',name:'Aarav Sharma',semester:3,section:'A',department:'BCA'},
{id:'s2',studentId:'CU-BCA-002',name:'Diya Kapoor',semester:3,section:'A',department:'BCA'},
{id:'s3',studentId:'CU-BCA-003',name:'Kabir Singh',semester:3,section:'A',department:'BCA'},
{id:'s4',studentId:'CU-BCA-004',name:'Mehak Arora',semester:3,section:'A',department:'BCA'},
{id:'s5',studentId:'CU-BCA-005',name:'Arjun Malhotra',semester:3,section:'A',department:'BCA'}],
attendance:[],leaves:[]};
let db=JSON.parse(localStorage.getItem('cu_nexus_db')||'null')||seed;
let current=null,chart=null,authRole='student';
function save(){localStorage.setItem('cu_nexus_db',JSON.stringify(db))}
function me(){return db.users.find(u=>u.id===current?.id)||current}
function isStaff(){return ['faculty','hod','admin'].includes(current.role)}
function attendanceFor(id){return db.attendance.filter(a=>a.studentId===id)}
function overall(id){const r=attendanceFor(id);return pct(r.filter(x=>x.status==='present').length,r.length)}
function roleLabel(){return current.role==='hod'?'HOD':current.role[0].toUpperCase()+current.role.slice(1)}
function recordsForRole(){return isStaff()?db.attendance:attendanceFor(current.id)}
function subjectStats(records){return db.subjects.map(s=>{const r=records.filter(x=>x.subject===s),p=r.filter(x=>x.status==='present').length;return{s,p,total:r.length,percent:pct(p,r.length)}})}
function badge(status){let c=status==='approved'||status==='present'?'good':status==='rejected'||status==='absent'?'bad':status==='pending'?'warn':'neutral';return `<span class="badge ${c}">${esc(status)}</span>`}
function pageHead(title,sub='',action=''){return `<div class="page-head"><div><div class="eyebrow-dark">CU NEXUS / ${esc(roleLabel())}</div><h1>${title}</h1><p class="muted">${sub}</p></div>${action}</div>`}
function renderNav(active){
 const groups=[['OVERVIEW',[['dashboard','layout-dashboard','Dashboard']]],['ACADEMICS',[['attendance','calendar-check','Attendance'],['qr','qr-code','QR Attendance'],['leave','file-clock','Leave Management'],['reports','file-bar-chart','PDF Reports']]],['IDENTITY',[['profile','contact-round','Digital Student ID']]]];
 if(isStaff())groups.push(['ADMINISTRATION',[['manage','users-round','Manage Users']]]);
 $('sidebar').innerHTML=groups.map(([g,items])=>`<div class="side-section">${g}</div>`+items.map(([id,ic,label])=>`<button class="nav-item ${active===id?'active':''}" data-page="${id}">${icon(ic)}<span>${label}</span></button>`).join('')).join('')+
 `<div class="side-profile"><span class="avatar-sm">${initials(current.name)}</span><div><b>${esc(current.name)}</b><small>${roleLabel()} • ${esc(current.department||'BCA')}</small></div></div>`;
 $('sidebar').querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>{show(b.dataset.page);closeMobile()});
 if(window.lucide)lucide.createIcons();
}
function show(name){renderNav(name);({dashboard,attendance,qr,leave,reports,profile,manage}[name]||dashboard)();closePanels()}
function statCard(label,value,trend,ic,kind=''){return `<div class="card stat-card"><div class="icon-box">${icon(ic)}</div><div class="label">${label}</div><div class="stat ${kind}">${value}</div><div class="trend ${kind||'muted'}">${trend}</div></div>`}
function dashboard(){
 if(current.role==='student')return studentDashboard();
 if(current.role==='faculty')return facultyDashboard();
 if(current.role==='hod')return hodDashboard();
 return adminDashboard();
}
function studentDashboard(){
 const r=attendanceFor(current.id), p=r.filter(x=>x.status==='present').length, percent=pct(p,r.length), stats=subjectStats(r);
 $('main').innerHTML=pageHead(`Good morning, ${esc(current.name.split(' ')[0])} 👋`,'Here is your attendance snapshot and academic activity.',`<button class="btn" onclick="show('qr')">${icon('scan-line')} Mark via QR</button>`)+
 (percent<75?`<div class="alert">${icon('triangle-alert')} Your attendance is ${percent}%. The recommended minimum is 75%. Review low-attendance subjects and apply for leave if needed.</div>`:'')+
 `<div class="grid">${statCard('Overall Attendance',percent+'%',percent>=75?'Above 75% target':'Below 75% target','activity',percent>=75?'good':'bad')}${statCard('Classes Present',p,'Across all recorded classes','calendar-check')}${statCard('Classes Missed',r.length-p,'Keep an eye on low subjects','calendar-x',r.length-p>0?'warn':'good')}${statCard('Leave Requests',db.leaves.filter(l=>l.studentId===current.id).length,'Total submitted requests','file-clock')}</div>
 <div class="dashboard-grid"><div class="card"><div class="card-title"><div><h3>Attendance trend</h3><p class="muted">Weekly performance overview</p></div><span class="badge neutral">Live data</span></div><canvas id="trendChart" height="120"></canvas></div>
 <div class="card"><div class="card-title"><div><h3>Subject performance</h3><p class="muted">Your attendance by subject</p></div></div>${stats.map(s=>`<div class="progress-row"><span>${esc(s.s)}</span><div class="progress"><div style="width:${s.percent}%"></div></div><b class="${s.percent<75?'bad':'good'}">${s.percent}%</b></div>`).join('')}</div></div>
 <div class="card"><div class="card-title"><div><h3>Quick actions</h3><p class="muted">Common student tasks</p></div></div><div class="quick-actions">
 <button class="quick-action" onclick="show('attendance')">${icon('calendar-days')}<b>View attendance</b><small>Full history</small></button>
 <button class="quick-action" onclick="show('leave')">${icon('file-plus-2')}<b>Apply leave</b><small>Submit request</small></button>
 <button class="quick-action" onclick="show('reports')">${icon('download')}<b>Get report</b><small>PDF export</small></button>
 <button class="quick-action" onclick="show('profile')">${icon('contact')}<b>Digital ID</b><small>Student card</small></button></div></div>`;
 drawTrend(percent);
}
function staffStats(){
 const r=db.attendance,p=r.filter(x=>x.status==='present').length;
 return {r,p,percent:pct(p,r.length),students:db.students.length,pending:db.leaves.filter(l=>l.status==='pending').length}
}
function facultyDashboard(){
 const s=staffStats(), recent=db.attendance.slice(-6).reverse();
 $('main').innerHTML=pageHead('Faculty command center','Track today’s classes, attendance and student engagement.',`<button class="btn" onclick="show('attendance')">${icon('plus')} Mark attendance</button>`)+
 `<div class="grid">${statCard('Attendance Rate',s.percent+'%','Across recorded classes','activity',s.percent>=75?'good':'warn')}${statCard('Students',s.students,'Active BCA students','users-round')}${statCard('Pending Leaves',s.pending,s.pending?'Needs review':'All clear','file-clock',s.pending?'warn':'good')}${statCard('Subjects',db.subjects.length,'Teaching catalogue','book-open')}</div>
 <div class="dashboard-grid"><div class="card"><div class="card-title"><div><h3>Department attendance</h3><p class="muted">Overall recorded attendance</p></div></div><canvas id="trendChart" height="125"></canvas></div>
 <div class="card"><div class="card-title"><div><h3>Subject health</h3><p class="muted">Attendance coverage</p></div></div>${subjectStats(s.r).map(x=>`<div class="progress-row"><span>${esc(x.s)}</span><div class="progress"><div style="width:${x.percent||0}%"></div></div><b>${x.percent}%</b></div>`).join('')}</div></div>
 <div class="card"><div class="card-title"><div><h3>Recent attendance activity</h3><p class="muted">Latest records</p></div><button class="btn secondary sm" onclick="show('attendance')">Open register</button></div>${recentTable(recent)}</div>`;
 drawTrend(s.percent);
}
function hodDashboard(){
 const s=staffStats(), low=subjectStats(s.r).filter(x=>x.percent<75);
 $('main').innerHTML=pageHead('HOD overview','Department-level attendance, compliance and workflow health.',`<button class="btn" onclick="show('reports')">${icon('file-down')} Department report</button>`)+
 `<div class="grid">${statCard('Department Rate',s.percent+'%','BCA overall','activity',s.percent>=75?'good':'warn')}${statCard('Students',s.students,'Across active records','graduation-cap')}${statCard('Low Subjects',low.length,low.length?'Intervention recommended':'Healthy performance','triangle-alert',low.length?'bad':'good')}${statCard('Pending Leaves',s.pending,'Requests awaiting action','file-clock',s.pending?'warn':'good')}</div>
 <div class="dashboard-grid"><div class="card"><div class="card-title"><div><h3>Department analytics</h3><p class="muted">Attendance trend by reporting period</p></div></div><canvas id="trendChart" height="125"></canvas></div>
 <div class="card"><div class="card-title"><div><h3>Attention required</h3><p class="muted">Subjects below target</p></div></div>${low.length?low.map(x=>`<div style="padding:12px 0;border-bottom:1px solid var(--line)"><b style="font-size:11px">${esc(x.s)}</b><span style="float:right" class="badge bad">${x.percent}%</span></div>`).join(''):'<div class="empty">All tracked subjects are at or above 75%.</div>'}</div></div>
 <div class="card"><div class="card-title"><div><h3>Recent student records</h3><p class="muted">Department activity feed</p></div></div>${recentTable(db.attendance.slice(-8).reverse())}</div>`;
 drawTrend(s.percent);
}
function adminDashboard(){
 const s=staffStats();
 $('main').innerHTML=pageHead('Admin control center','Monitor the CU Nexus attendance environment and operational activity.',`<button class="btn" onclick="show('manage')">${icon('settings-2')} Manage users</button>`)+
 `<div class="grid">${statCard('System Attendance',s.percent+'%','All recorded classes','activity',s.percent>=75?'good':'warn')}${statCard('Registered Users',db.users.length,'Staff + students','users-round')}${statCard('Attendance Records',db.attendance.length,'Stored locally in demo','database')}${statCard('Open Workflows',s.pending,'Pending leave requests','inbox',s.pending?'warn':'good')}</div>
 <div class="dashboard-grid"><div class="card"><div class="card-title"><div><h3>System analytics</h3><p class="muted">High-level attendance performance</p></div></div><canvas id="trendChart" height="125"></canvas></div>
 <div class="card"><div class="card-title"><div><h3>Platform modules</h3><p class="muted">Current feature status</p></div></div>${[['Attendance','Fully active'],['QR sessions','Demo mode'],['Leave workflow','Active'],['PDF reports','Active'],['Digital ID','Active']].map(x=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:11px"><span>${x[0]}</span>${badge(x[1])}</div>`).join('')}</div></div>`;
 drawTrend(s.percent);
}
function recentTable(rows){
 if(!rows.length)return '<div class="empty">No attendance activity yet.</div>';
 return `<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Student</th><th>Subject</th><th>Method</th><th>Status</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.date}</td><td>${esc(db.students.find(s=>s.id===r.studentId)?.name||r.studentId)}</td><td>${esc(r.subject)}</td><td>${badge(r.method||'manual')}</td><td>${badge(r.status)}</td></tr>`).join('')}</tbody></table></div>`
}
function drawTrend(last){
 if(!window.Chart||!$('trendChart'))return;
 if(chart)chart.destroy();
 chart=new Chart($('trendChart'),{type:'line',data:{labels:['Week 1','Week 2','Week 3','Week 4','Current'],datasets:[{label:'Attendance %',data:[72,76,74,79,last],tension:.38,fill:true,borderWidth:2,backgroundColor:'rgba(91,92,240,.08)',borderColor:'#5b5cf0',pointRadius:3}]},options:{plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'}},x:{grid:{display:false}}}}});
}
function attendance(){
 if(!isStaff()){const rows=attendanceFor(current.id);$('main').innerHTML=pageHead('My Attendance','Your complete attendance history and subject performance.',`<button class="btn" onclick="show('reports')">${icon('download')} PDF report</button>`)+
 `<div class="grid">${statCard('Overall',overall(current.id)+'%','Attendance percentage','activity',overall(current.id)>=75?'good':'bad')}${statCard('Present',rows.filter(x=>x.status==='present').length,'Classes attended','check-circle-2')}${statCard('Absent',rows.filter(x=>x.status==='absent').length,'Classes missed','x-circle')}${statCard('Total',rows.length,'Recorded classes','calendar-days')}</div>
 <div class="card"><div class="card-title"><div><h3>Attendance history</h3><p class="muted">Most recent records first</p></div><input id="attendanceFilter" style="max-width:190px;margin:0" placeholder="Search subject..."></div><div id="attendanceTable">${studentAttendanceTable(rows)}</div></div>`;
 $('attendanceFilter').oninput=e=>{$('attendanceTable').innerHTML=studentAttendanceTable(rows.filter(r=>r.subject.toLowerCase().includes(e.target.value.toLowerCase())))};
 return}
 $('main').innerHTML=pageHead('Attendance register','Record student attendance quickly and accurately.')+
 `<div class="card"><div class="two"><label>Date<input id="attDate" type="date" value="${today()}"></label><label>Subject<select id="attSubject">${db.subjects.map(s=>`<option>${esc(s)}</option>`).join('')}</select></label></div><label>Student<select id="attStudent">${db.students.map(s=>`<option value="${s.id}">${esc(s.studentId)} — ${esc(s.name)}</option>`).join('')}</select></label><div class="actions"><button class="btn success" onclick="markAttendance('present')">${icon('check')} Present</button><button class="btn danger" onclick="markAttendance('absent')">${icon('x')} Absent</button></div></div>
 <div class="card"><div class="card-title"><div><h3>Recent register</h3><p class="muted">Last 12 attendance events</p></div></div>${recentTable(db.attendance.slice(-12).reverse())}</div>`;
}
function studentAttendanceTable(rows){return `<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Subject</th><th>Status</th><th>Method</th></tr></thead><tbody>${rows.slice().reverse().map(r=>`<tr><td>${r.date}</td><td>${esc(r.subject)}</td><td>${badge(r.status)}</td><td>${badge(r.method||'manual')}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">No records yet.</td></tr>'}</tbody></table></div>`}
function markAttendance(status){
 const date=$('attDate').value,subject=$('attSubject').value,studentId=$('attStudent').value;
 if(!date)return toast('Select a date');
 db.attendance=db.attendance.filter(r=>!(r.date===date&&r.subject===subject&&r.studentId===studentId));
 db.attendance.push({date,subject,studentId,status,markedBy:current.id,method:'manual'});save();toast(`Attendance marked ${status}`);attendance();
}
function qr(){
 if(!isStaff()){$('main').innerHTML=pageHead('QR Attendance','Join a live classroom session using a secure session code.')+
 `<div class="two"><div class="card"><div class="card-title"><div><h3>Join class</h3><p class="muted">Paste the session code provided by faculty.</p></div></div><label>Session code<textarea id="scanCode" rows="5" placeholder='Paste QR session data here'></textarea></label><button class="btn" onclick="useQR()">${icon('scan')} Submit session</button></div><div class="card"><div class="empty">${icon('smartphone')}<h3>How it works</h3><p>1. Ask your faculty to display the class QR.<br>2. Scan or paste the session code.<br>3. Your attendance is recorded instantly.</p></div></div></div>`;return}
 $('main').innerHTML=pageHead('QR Attendance','Create a short-lived digital classroom check-in.',`<span class="badge neutral">Demo session engine</span>`)+
 `<div class="two"><div class="card"><div class="card-title"><div><h3>Create session</h3><p class="muted">Generate a unique QR for the current class.</p></div></div><label>Subject<select id="qrSubject">${db.subjects.map(s=>`<option>${esc(s)}</option>`).join('')}</select></label><label>Expiry<input id="qrMinutes" type="number" value="5" min="1" max="15"></label><button class="btn" onclick="generateQR()">${icon('qr-code')} Generate QR</button><div id="sessionCode" class="code-box hidden" style="margin-top:14px"></div></div><div class="card qrbox"><div id="qrcode"><span class="muted">QR code appears here</span></div><p class="muted">Session expires automatically.</p></div></div>`;
}
function generateQR(){
 const payload=JSON.stringify({subject:$('qrSubject').value,expires:Date.now()+Number($('qrMinutes').value)*60000,nonce:crypto.randomUUID()});
 $('qrcode').innerHTML='';new QRCode($('qrcode'),{text:payload,width:230,height:230});$('sessionCode').textContent=payload;$('sessionCode').classList.remove('hidden');toast('QR session generated');
}
function useQR(){
 try{const p=JSON.parse($('scanCode').value);if(!p.subject||!p.expires)return toast('Invalid session');if(Date.now()>p.expires)return toast('QR session expired');
 const exists=db.attendance.find(a=>a.date===today()&&a.subject===p.subject&&a.studentId===current.id&&a.method==='qr');if(exists)return toast('You are already marked present');
 db.attendance.push({date:today(),subject:p.subject,studentId:current.id,status:'present',markedBy:current.id,method:'qr'});save();toast('Attendance recorded successfully');show('dashboard');
 }catch(e){toast('Invalid QR session code')}
}
function leave(){
 if(isStaff()){$('main').innerHTML=pageHead('Leave management','Review and process student leave requests.')+
 `<div class="card"><div class="card-title"><div><h3>Requests</h3><p class="muted">${db.leaves.filter(l=>l.status==='pending').length} pending approval</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Dates</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>${db.leaves.map(l=>`<tr><td>${esc(db.students.find(s=>s.id===l.studentId)?.name||l.studentId)}</td><td>${l.from} → ${l.to}</td><td style="max-width:260px;white-space:normal">${esc(l.reason)}</td><td>${badge(l.status)}</td><td>${l.status==='pending'?`<button class="btn success sm" onclick="reviewLeave('${l.id}','approved')">Approve</button> <button class="btn danger sm" onclick="reviewLeave('${l.id}','rejected')">Reject</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">No leave requests.</td></tr>'}</tbody></table></div></div>`;return}
 const mine=db.leaves.filter(l=>l.studentId===current.id);
 $('main').innerHTML=pageHead('Leave management','Submit a request and track its approval status.')+
 `<div class="two"><div class="card"><div class="card-title"><div><h3>New application</h3><p class="muted">Provide the dates and a clear reason.</p></div></div><div class="two"><label>From<input id="leaveFrom" type="date"></label><label>To<input id="leaveTo" type="date"></label></div><label>Reason<textarea id="leaveReason" rows="5" placeholder="Explain why you need leave..."></textarea></label><button class="btn" onclick="submitLeave()">${icon('send')} Submit request</button></div>
 <div class="card"><div class="card-title"><div><h3>My requests</h3><p class="muted">Application history</p></div></div>${mine.length?mine.slice().reverse().map(l=>`<div style="padding:13px 0;border-bottom:1px solid var(--line)"><div style="display:flex;justify-content:space-between"><b style="font-size:11px">${l.from} → ${l.to}</b>${badge(l.status)}</div><p class="muted">${esc(l.reason)}</p></div>`).join(''):'<div class="empty">No applications yet.</div>'}</div></div>`;
}
function submitLeave(){
 const from=$('leaveFrom').value,to=$('leaveTo').value,reason=$('leaveReason').value.trim();
 if(!from||!to||!reason)return toast('Complete all fields');if(to<from)return toast('End date must be after start date');
 db.leaves.push({id:crypto.randomUUID(),studentId:current.id,from,to,reason,status:'pending'});save();toast('Leave request submitted');leave();
}
function reviewLeave(id,status){const l=db.leaves.find(x=>x.id===id);if(l){l.status=status;l.reviewedBy=current.id;save();toast(`Leave ${status}`);leave()}}
function reports(){
 const rows=isStaff()?db.attendance:attendanceFor(current.id), percent=pct(rows.filter(x=>x.status==='present').length,rows.length);
 $('main').innerHTML=pageHead('PDF reports','Preview and export a clean attendance report.',`<button class="btn" onclick="makePDF()">${icon('download')} Download PDF</button>`)+
 `<div class="two"><div class="card"><div class="card-title"><div><h3>Report settings</h3><p class="muted">Current report scope</p></div></div><label>Report type<select id="reportType"><option>Attendance summary</option><option>Detailed attendance log</option><option>Department overview</option></select></label><div class="grid" style="grid-template-columns:1fr 1fr;margin-top:10px">${statCard('Records',rows.length,'Included in report','database')}${statCard('Rate',percent+'%','Present / total','activity',percent>=75?'good':'warn')}</div><button class="btn" onclick="makePDF()">${icon('file-down')} Generate PDF</button></div><div class="report-preview" id="reportPreview"><div style="font-size:9px;color:#666;letter-spacing:1px">CHANDIGARH UNIVERSITY • CU NEXUS</div><h2>Attendance Report</h2><div style="font-size:10px;color:#666">${esc(current.name)} • ${esc(current.studentId||current.employeeId||'Department')}</div><hr><table><tr><th>Date</th><th>Subject</th><th>Status</th></tr>${rows.slice(-12).reverse().map(r=>`<tr><td>${r.date}</td><td>${esc(r.subject)}</td><td>${r.status}</td></tr>`).join('')||'<tr><td colspan="3">No records</td></tr>'}</table></div></div>`;
}
function makePDF(){
 const rows=isStaff()?db.attendance:attendanceFor(current.id);if(!window.jspdf)return toast('PDF library unavailable');
 const {jsPDF}=window.jspdf,doc=new jsPDF();doc.setFontSize(16);doc.text('Chandigarh University - CU Nexus',14,18);doc.setFontSize(12);doc.text('Attendance Report',14,27);doc.setFontSize(9);doc.text(`User: ${current.name} | ID: ${current.studentId||current.employeeId||'N/A'}`,14,35);doc.text(`Generated: ${new Date().toLocaleString()}`,14,42);
 let y=55;doc.setFont(undefined,'bold');doc.text('Date',14,y);doc.text('Subject',45,y);doc.text('Status',145,y);doc.setFont(undefined,'normal');y+=7;
 rows.forEach(r=>{if(y>280){doc.addPage();y=18}doc.text(r.date,14,y);doc.text(String(r.subject).slice(0,42),45,y);doc.text(r.status,145,y);y+=6});doc.save(`${current.studentId||current.username||'cu-nexus'}-attendance.pdf`);toast('PDF report downloaded');
}
function profile(){
 const u=me();
 if(current.role!=='student'){$('main').innerHTML=pageHead('My profile','Account and role information.')+`<div class="card" style="max-width:650px"><div class="id-info"><div class="avatar-xl">${initials(u.name)}</div><div><h2>${esc(u.name)}</h2><div class="muted">${roleLabel()} • ${esc(u.department||'')}</div></div></div><div class="two"><div><b>Email</b><p class="muted">${esc(u.email)}</p></div><div><b>Employee ID</b><p class="muted">${esc(u.employeeId||'-')}</p></div></div></div>`;return}
 $('main').innerHTML=pageHead('Digital Student ID','Your official-looking CU Nexus identity card.')+
 `<div class="two"><div><div class="id-card"><div class="id-top"><div><b>CHANDIGARH UNIVERSITY</b><div style="font-size:8px;color:#d6d6e8;margin-top:3px">BCA • DIGITAL STUDENT ID</div></div><b>CU</b></div><div class="id-info"><div class="avatar-xl">${initials(u.name)}</div><div><h2>${esc(u.name)}</h2><div>${esc(u.studentId)}</div><div>${esc(u.department)} • Semester ${u.semester} • Section ${esc(u.section)}</div></div></div><div class="id-bottom"><div><span style="opacity:.65">EMAIL</span><br>${esc(u.email)}</div><div><span style="opacity:.65">VALIDITY</span><br>Academic Year 2026–27</div></div></div></div><div class="card"><h3>Identity details</h3><div class="two"><div><span class="muted">Student ID</span><p>${esc(u.studentId)}</p></div><div><span class="muted">Department</span><p>${esc(u.department)}</p></div><div><span class="muted">Semester</span><p>${u.semester}</p></div><div><span class="muted">Section</span><p>${esc(u.section)}</p></div></div></div></div>`;
}
function manage(){
 if(!isStaff())return;
 $('main').innerHTML=pageHead('Manage users','Register students and review campus accounts.',`<button class="btn" onclick="document.getElementById('newSid').focus()">${icon('user-plus')} Add student</button>`)+
 `<div class="card"><div class="card-title"><div><h3>Add student</h3><p class="muted">Create a student profile for attendance tracking.</p></div></div><div class="two"><label>Student ID<input id="newSid" placeholder="CU-BCA-006"></label><label>Full name<input id="newName" placeholder="Student name"></label><label>Semester<input id="newSem" type="number" value="3"></label><label>Section<input id="newSec" value="A"></label></div><button class="btn" onclick="addStudent()">${icon('user-plus')} Register student</button></div>
 <div class="card"><div class="card-title"><div><h3>Registered accounts</h3><p class="muted">${db.users.length} users in this demo environment</p></div><input id="userFilter" style="max-width:190px;margin:0" placeholder="Search users..."></div><div id="userTable">${userTable(db.users)}</div></div>`;
 $('userFilter').oninput=e=>{$('userTable').innerHTML=userTable(db.users.filter(u=>(u.name+u.role+(u.studentId||u.employeeId||'')).toLowerCase().includes(e.target.value.toLowerCase())))};
}
function userTable(users){return `<div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Role</th><th>ID</th><th>Department</th></tr></thead><tbody>${users.map(u=>`<tr><td>${esc(u.name)}</td><td>${badge(u.role)}</td><td>${esc(u.studentId||u.employeeId||'-')}</td><td>${esc(u.department||'-')}</td></tr>`).join('')}</tbody></table></div>`}
function addStudent(){
 const studentId=$('newSid').value.trim(),name=$('newName').value.trim();if(!studentId||!name)return toast('Student ID and name are required');
 const id='s'+Date.now(),sem=Number($('newSem').value)||3,sec=$('newSec').value.trim()||'A';
 db.students.push({id,studentId,name,semester:sem,section:sec,department:'BCA'});
 db.users.push({id,username:studentId.toLowerCase(),password:'1234',role:'student',name,email:studentId.toLowerCase()+'@cu.example',studentId,department:'BCA',semester:sem,section:sec});
 save();toast('Student registered');manage();
}
function setupTop(){
 $('logoutBtn').onclick=logout;$('profileQuick').onclick=()=>{show('profile');$('userDropdown').classList.add('hidden')};
 $('userMenuBtn').onclick=()=>{$('userDropdown').classList.toggle('hidden')};
 $('themeToggle').onclick=toggleTheme;$('mobileMenu').onclick=toggleMobile;$('mobileOverlay').onclick=closeMobile;
 $('notifBtn').onclick=()=>{$('notificationPanel')?.remove();const p=document.createElement('div');p.id='notificationPanel';p.className='notification-panel';p.innerHTML=`<h3>Notifications</h3><div class="notification-item"><b>Attendance reminder</b><br><span class="muted">Keep your attendance above 75%.</span></div><div class="notification-item"><b>CU Nexus updated</b><br><span class="muted">New dashboard experience is active.</span></div>`;document.body.appendChild(p)};
 $('globalSearch').addEventListener('input',globalSearch);document.addEventListener('click',e=>{if(!e.target.closest('.user-menu'))$('userDropdown').classList.add('hidden');if(!e.target.closest('#notifBtn')&&!e.target.closest('.notification-panel'))$('notificationPanel')?.remove()});
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('globalSearch').focus()}});
}
function globalSearch(e){
 const q=e.target.value.trim().toLowerCase();document.querySelector('.search-results')?.remove();if(!q)return;
 const pages=[['dashboard','Dashboard'],['attendance','Attendance'],['qr','QR Attendance'],['leave','Leave Management'],['reports','PDF Reports'],['profile','Digital Student ID'],...(isStaff()?[['manage','Manage Users']]:[])];
 const matches=pages.filter(x=>x[1].toLowerCase().includes(q));if(isStaff())db.students.filter(s=>s.name.toLowerCase().includes(q)).slice(0,3).forEach(s=>matches.push(['attendance',s.name]));
 const box=document.createElement('div');box.className='search-results';box.innerHTML=matches.length?matches.slice(0,7).map(x=>`<button data-go="${x[0]}">${icon(x[0]==='dashboard'?'layout-dashboard':x[0]==='attendance'?'calendar-check':'arrow-up-right')} ${esc(x[1])}</button>`).join(''):'<div class="empty">No results found.</div>';
 $('globalSearch').parentElement.appendChild(box);box.querySelectorAll('button').forEach(b=>b.onclick=()=>{show(b.dataset.go);$('globalSearch').value='';box.remove()});
}
function toggleTheme(){const root=document.documentElement, dark=root.dataset.theme==='dark';root.dataset.theme=dark?'light':'dark';localStorage.setItem('cu_theme',root.dataset.theme);$('themeToggle').innerHTML=icon(dark?'moon':'sun');lucide.createIcons()}
function toggleMobile(){document.body.classList.toggle('sidebar-open')}
function closeMobile(){document.body.classList.remove('sidebar-open')}
function closePanels(){document.querySelector('.search-results')?.remove();document.getElementById('notificationPanel')?.remove()}
function logout(){current=null;$('appView').hidden=true;$('authView').hidden=false;toast('Signed out safely')}
function login(id,pw){
 const u=db.users.find(x=>x.username.toLowerCase()===id.toLowerCase()||x.studentId?.toLowerCase()===id.toLowerCase());if(!u||u.password!==pw)return toast('Invalid login details. Try demo password 1234.');
 current=u;$('authView').hidden=true;$('appView').hidden=false;$('currentUser').textContent=u.name;$('currentRole').textContent=roleLabel();$('avatarTop').textContent=initials(u.name);renderNav('dashboard');show('dashboard');toast(`Welcome to CU Nexus, ${u.name.split(' ')[0]}`);
}
document.querySelectorAll('.role-pill').forEach(b=>b.onclick=()=>{document.querySelectorAll('.role-pill').forEach(x=>x.classList.remove('active'));b.classList.add('active');authRole=b.dataset.role;$('loginId').value=authRole;$('loginPassword').value='1234'});
$('loginForm').onsubmit=e=>{e.preventDefault();login($('loginId').value.trim(),$('loginPassword').value)};
$('togglePass').onclick=()=>{$('loginPassword').type=$('loginPassword').type==='password'?'text':'password'};
$('forgotBtn').onclick=()=>toast('Demo: contact your campus administrator to reset credentials.');
const savedTheme=localStorage.getItem('cu_theme')||'light';document.documentElement.dataset.theme=savedTheme;
setupTop();if(window.lucide)lucide.createIcons();

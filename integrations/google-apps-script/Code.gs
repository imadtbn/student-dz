const SPREADSHEET_ID='16_WMIL0CE5-Azhc78Ql7pqmqLzKksTYd8xd4DRNa4Dk';
const HEADERS=['receivedAt','timestamp','pageKey','pagePath','pageUrl','pageTitle','type','name','email','subject','description','userAgent','submissionId'];
function doGet(){return out({ok:true,service:'student-dz-feedback',version:2})}
function doPost(e){try{const r=JSON.parse(e?.postData?.contents||'{}'),k=cell(r.pageKey||'unknown'),s=getSheet(sheetName(k)),l=LockService.getScriptLock();l.waitLock(10000);try{if(!s.getLastRow()){s.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);s.setFrozenRows(1)}s.appendRow([new Date(),cell(r.timestamp),k,cell(r.pagePath),cell(r.pageUrl),cell(r.pageTitle),cell(r.type),cell(r.name),cell(r.email),cell(r.subject),cell(r.description),cell(r.userAgent),cell(r.submissionId)])}finally{l.releaseLock()}return out({ok:true,pageKey:k})}catch(x){console.error(x);return out({ok:false,error:String(x)})}}
function getSheet(n){const b=SpreadsheetApp.openById(SPREADSHEET_ID);return b.getSheetByName(n)||b.insertSheet(n)}
function sheetName(k){return String(k).replace(/[\\/?*\[\]:]/g,'-').slice(0,90)||'unknown'}
function cell(v){const x=v==null?'':String(v).trim();return '=+-@'.indexOf(x.charAt(0))>=0?"'"+x:x}
function out(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON)}

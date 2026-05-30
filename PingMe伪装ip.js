// PingMe_Task.js (Surge/Loon/QX 通用版 - 账号全自动适配 + 精致排版)
const scriptName = 'PingMe签到';
const storeKey = 'pingme_accounts_v1';
const statsKey = 'pingme_daily_stats_v1'; 
const SECRET = '0fOiukQq7jXZV2GRi9LGlO';
const API_HOST = 'api.pingmeapp.net';

const MAX_VIDEO = 5;

// Surge/Loon 支持通过面板或配置传入 argument
const targetEmail = typeof $argument !== "undefined" && $argument ? $argument.trim() : null;

const IOS_VERSIONS = ['17.5.1','17.6.1','17.4.1','17.2.1','16.7.8','17.6','17.3.1','18.0.1','17.1.2','16.6.1'];
const IOS_SCALES = ['2.00','3.00','3.00','2.00','3.00'];
const IPHONE_MODELS = ['iPhone14,3','iPhone13,3','iPhone15,3','iPhone16,1','iPhone14,7','iPhone13,2','iPhone15,2','iPhone12,1'];
const CFN_VERS = ['1410.0.3','1494.0.7','1568.100.1','1209.1','1474.0.4','1568.200.2'];
const DARWIN_VERS = ['22.6.0','23.5.0','23.6.0','24.0.0','22.4.0'];

// 环境检测优化：只要存在 $httpClient 就能兼容 Surge/Loon/Stash/Shadowrocket
const hasHttpClient = typeof $httpClient !== "undefined";
const hasTask = typeof $task !== "undefined"; // 兼容 Quantumult X

function readVal(key) {
    if (hasHttpClient) return $persistentStore.read(key);
    if (hasTask) return $prefs.valueForKey(key);
    return null;
}

function writeVal(val, key) {
    if (hasHttpClient) return $persistentStore.write(String(val), key);
    if (hasTask) return $prefs.setValueForKey(String(val), key);
    return false;
}

function notify(title, subtitle, body) {
    if (hasHttpClient) $notification.post(String(title), String(subtitle), String(body));
    if (hasTask) $notify(String(title), String(subtitle), String(body));
}

function getRandomIP() {
    const range = () => Math.floor(Math.random() * 254) + 1;
    return `${range()}.${range()}.${range()}.${range()}`;
}

function getAccName(acc) {
    if (acc.capture && acc.capture.paramsRaw && acc.capture.paramsRaw.email) {
        return decodeURIComponent(acc.capture.paramsRaw.email); 
    }
    return acc.alias || acc.id;
}

function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function getDailyStats() {
    const today = getTodayStr();
    let stats = { date: today, counts: {} };
    const raw = readVal(statsKey);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed.date === today) {
                stats = parsed; 
            }
        } catch (e) {}
    }
    return stats;
}

function saveDailyStats(stats) {
    writeVal(JSON.stringify(stats), statsKey);
}

function loadStore() {
  const raw = readVal(storeKey);
  if (!raw) return { version: 1, accounts: {}, order: [] };
  try {
    const obj = JSON.parse(raw);
    if (!obj.accounts) obj.accounts = {};
    if (!Array.isArray(obj.order)) obj.order = Object.keys(obj.accounts);
    return obj;
  } catch (e) {
    return { version: 1, accounts: {}, order: [] };
  }
}

function saveStore(store) {
  writeVal(JSON.stringify(store), storeKey);
}

function autoCleanDuplicates(store) {
    const uniqueMap = {};
    let hasDuplicate = false;
    const newOrder = [];

    for (let i = store.order.length - 1; i >= 0; i--) {
        const id = store.order[i];
        const acc = store.accounts[id];
        if (!acc) continue;

        const email = getAccName(acc);
        if (!uniqueMap[email]) {
            uniqueMap[email] = id;
            newOrder.unshift(id); 
        } else {
            hasDuplicate = true;
            delete store.accounts[id];
        }
    }

    if (hasDuplicate) {
        store.order = newOrder;
        saveStore(store); 
    }
    return store;
}

function MD5(string) {
  function RotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); }
  function AddUnsigned(lX, lY) { const lX4=lX&0x40000000,lY4=lY&0x40000000,lX8=lX&0x80000000,lY8=lY&0x80000000;const lResult=(lX&0x3FFFFFFF)+(lY&0x3FFFFFFF);if(lX4&lY4)return lResult^0x80000000^lX8^lY[...]
  function F(x, y, z) { return (x & y) | ((~x) & z); } function G(x, y, z) { return (x & z) | (y & (~z)); } function H(x, y, z) { return x ^ y ^ z; } function I(x, y, z) { return y ^ (x | (~z)); }
  function FF(a,b,c,d,x,s,ac){a=AddUnsigned(a,AddUnsigned(AddUnsigned(F(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b);} function GG(a,b,c,d,x,s,ac){a=AddUnsigned(a,AddUnsigned(AddUnsigned(G(b,c[...]
  function ConvertToWordArray(str){const lMessageLength=str.length;const lNumberOfWords_temp1=lMessageLength+8;const lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1%64))/64;const lNum[...]
  function WordToHex(lValue){let WordToHexValue='';for(let lCount=0;lCount<=3;lCount++){const lByte=(lValue>>>(lCount*8))&255;const WordToHexValue_temp='0'+lByte.toString(16);WordToHexValue+=WordToHex[...]
  const x=ConvertToWordArray(string);let a=0x67452301,b=0xEFCDAB89,c=0x98BADCFE,d=0x10325476;const S11=7,S12=12,S13=17,S14=22,S21=5,S22=9,S23=14,S24=20;const S31=4,S32=11,S33=16,S34=23,S41=6,S42=10,S4[...]
  for(let k=0;k<x.length;k+=16){const AA=a,BB=b,CC=c,DD=d;a=FF(a,b,c,d,x[k+0],S11,0xD76AA478);d=FF(d,a,b,c,x[k+1],S12,0xE8C7B756);c=FF(c,d,a,b,x[k+2],S13,0x242070DB);b=FF(b,c,d,a,x[k+3],S14,0xC1BDCEEE[...]
  return(WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d)).toLowerCase();
}

function getUTCSignDate() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}

function pickItem(arr, seed) { return arr[seed % arr.length]; }

function buildUA(baseUA, seed) {
  const iosVer = pickItem(IOS_VERSIONS, seed);
  const scale = pickItem(IOS_SCALES, seed + 1);
  const model = pickItem(IPHONE_MODELS, seed + 2);
  const cfn = pickItem(CFN_VERS, seed + 3);
  const darwin = pickItem(DARWIN_VERS, seed + 4);
  
  if (baseUA && typeof baseUA === 'string') {
    let ua = baseUA;
    let changed = false;
    if (/iOS \d+(\.\d+){0,2}/.test(ua)) { ua = ua.replace(/iOS \d+(\.\d+){0,2}/, `iOS ${iosVer}`); changed = true; }
    if (/Scale\/\d+(\.\d+)?/.test(ua)) { ua = ua.replace(/Scale\/\d+(\.\d+)?/, `Scale/${scale}`); changed = true; }
    if (/iPhone\d+,\d+/.test(ua)) { ua = ua.replace(/iPhone\d+,\d+/, model); changed = true; }
    if (/CFNetwork\/[\d.]+/.test(ua)) { ua = ua.replace(/CFNetwork\/[\d.]+/, `CFNetwork/${cfn}`); changed = true; }
    if (/Darwin\/[\d.]+/.test(ua)) { ua = ua.replace(/Darwin\/[\d.]+/, `Darwin/${darwin}`); changed = true; }
    if (changed) return ua;
  }
  return `PingMe/1.0.0 (${model}; iOS ${iosVer}; Scale/${scale}) CFNetwork/${cfn} Darwin/${darwin}`;
}

function buildSignedParamsRaw(capture) {
  const params = {};
  Object.keys(capture.paramsRaw || {}).forEach(k => {
    if (k !== 'sign' && k !== 'signDate') params[k] = capture.paramsRaw[k];
  });
  params.signDate = getUTCSignDate();
  const signBase = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  params.sign = MD5(signBase + SECRET);
  return params;
}

function buildUrl(path, capture) {
  const params = buildSignedParamsRaw(capture);
  const qs = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
  return `https://${API_HOST}/app/${path}?${qs}`;
}

function cloneHeaders(headers) {
  const out = {};
  Object.keys(headers || {}).forEach(k => out[k] = headers[k]);
  return out;
}

function buildHeaders(capture, ua, fakeIp) {
  const headers = cloneHeaders(capture.headers || {});
  delete headers['Content-Length']; delete headers['content-length'];
  delete headers[':authority']; delete headers[':method']; delete headers[':path']; delete headers[':scheme'];
  headers['Host'] = API_HOST;
  headers['Accept'] = headers['Accept'] || 'application/json';
  Object.keys(headers).forEach(k => { if (k.toLowerCase() === 'user-agent') delete headers[k]; });
  headers['User-Agent'] = ua;

  headers['X-Forwarded-For'] = fakeIp;
  headers['X-Real-IP'] = fakeIp;
  headers['Client-IP'] = fakeIp;
  headers['True-Client-IP'] = fakeIp;

  return headers;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function requestWithTimeout(options, timeout = 12000) {
  return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
          reject("请求超时(网络无响应)");
      }, timeout);

      if (hasHttpClient) {
          $httpClient.get(options, (error, response, body) => {
              clearTimeout(timer);
              if (error) reject(error);
              else resolve({body, status: response.status});
          });
      } else if (hasTask) {
          options.method = 'GET';
          $task.fetch(options).then(res => {
              clearTimeout(timer);
              resolve({body: res.body, status: res.statusCode});
          }).catch(err => {
              clearTimeout(timer);
              reject(err.error || err);
          });
      }
  });
}

// ================= 核心执行逻辑 =================
async function runAccount(acc, currentRunCount) {
  const accountName = getAccName(acc);
  const tag = `[${accountName}]`;
  const ua = buildUA(acc.baseUA, acc.uaSeed);
  const fakeIp = getRandomIP(); 
  const headers = buildHeaders(acc.capture, ua, fakeIp);
  
  const msgs = [];
  
  let initialBal = "?";
  let finalBal = "?";
  let checkInStr = "签×"; 
  let videoCount = 0;    

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🟢 >>> 🚀 ${tag} 开始执行 [今日第${currentRunCount}次] <<< 🟢`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━���━━━\n`);

  function logMsg(text) {
      console.log(`${tag} ${text}`); 
      msgs.push(text);               
  }

  logMsg(`▶️ 开始执行... (伪装IP: ${fakeIp})`);

  async function fetchApi(path, retries = 3) {
      const url = buildUrl(path, acc.capture);
      for (let i = 0; i < retries; i++) {
          try {
              return await requestWithTimeout({ url, headers });
          } catch (err) {
              if (i === retries - 1) throw err;
              logMsg(`⚠️ ${path} 网络不佳，正在重试 (${i + 1}/${retries})...`);
              await sleep(3000); 
          }
      }
  }

  try {
      try {
          const res = await fetchApi('queryBalanceAndBonus');
          const d = JSON.parse(res.body);
          if (d.retcode === 0) {
              initialBal = d.result.balance;
              logMsg(`💰 初始余额：${initialBal} Coins`);
          } else {
              logMsg(`⚠️ 查询失败：${d.retmsg}`);
          }
      } catch (e) {
          logMsg(`❌ 查询异常：${e}`);
      }
      
      await sleep(2000 + Math.random() * 1500);

      // --- 签到 ---
      try {
          const res = await fetchApi('checkIn');
          const d = JSON.parse(res.body);
          if (d.retcode === 0) {
              logMsg(`✅ 签到：${(d.result?.bonusHint || d.retmsg || '').replace(/\n/g, ' ')}`);
              checkInStr = "签✓"; 
          } else {
              logMsg(`⚠️ 签到返回：${d.retmsg}`);
              if (d.retmsg.includes('已經簽過') || d.retmsg.includes('already')) {
                  checkInStr = "已签"; 
              }
          }
      } catch (e) {
          logMsg(`❌ 签到异常：${e}`);
      }
      
      // --- 看视频 ---
      for (let i = 1; i <= MAX_VIDEO; i++) {
          const randomDelay = Math.floor(Math.random() * 8000) + 35000; 
          await sleep(i === 1 ? (2000 + Math.random() * 2000) : randomDelay); 

          try {
              const res = await fetchApi('videoBonus');
              const d = JSON.parse(res.body);
              if (d.retcode === 0) {
                  logMsg(`🎬 视频${i}：+${d.result?.bonus || '?'} Coins`);
                  videoCount++; 
              } else {
                  if (d.retmsg.includes('圖形驗證碼') || d.retmsg.includes('验证码')) {
                      logMsg(`⏸ 视频${i}：触发验证码风控！本轮战略性收手，等待下次重试...`);
                  } else {
                      logMsg(`⏸ 视频${i}：${d.retmsg} (可能已达上限)`);
                  }
                  break; 
              }
          } catch (e) {
              logMsg(`❌ 视频${i}异常 (已跳过)`);
          }
      }

      try {
          const res = await fetchApi('queryBalanceAndBonus');
          const d = JSON.parse(res.body);
          if (d.retcode === 0) {
              finalBal = d.result.balance;
              logMsg(`💰 最终余额：${finalBal} Coins`);
          }
      } catch (e) {}
      
      return { accountName, detail: msgs.join('\n'), initialBal, finalBal, checkInStr, videoCount, currentRunCount };

  } catch (globalErr) {
      logMsg(`❌ 发生致命错误停止：${globalErr}`);
      return { accountName, detail: msgs.join('\n'), initialBal, finalBal: "错误", checkInStr: "签×", videoCount: 0, currentRunCount };
  }
}

// ================= 启动逻辑 =================
(async () => {
  let store = loadStore();
  store = autoCleanDuplicates(store);
  
  const allIds = store.order.filter(id => store.accounts[id]);

  if (!allIds.length) {
      notify(scriptName, '⚠️ 账号库为空', '请先打开 PingMe 触发抓包获取 Cookie');
      return $done();
  } 

  let executeIds = [];

  // 🚀 全自动适配逻辑：
  // 1. 如果 Surge/Loon 面板传递了 argument，按 argument 执行对应账号
  // 2. 如果没有传递 argument，自动扫描执行本地持久化存下来的所有账号！
  if (targetEmail) {
      const customEmails = targetEmail.split(/[,，|]+/).map(e => e.trim()).filter(e => e);
      executeIds = allIds.filter(id => customEmails.includes(getAccName(store.accounts[id])));
      
      if (executeIds.length === 0) {
          console.log(`❌ 找不到填写的参数邮箱：${targetEmail}`);
          return $done();
      }
  } else {
      executeIds = allIds; // 没有写死参数，自动提取所有存在本地的账号
  }

  const dailyStats = getDailyStats();
  const tasks = [];
  
  for (let idx = 0; idx < executeIds.length; idx++) {
      const id = executeIds[idx];
      const accAlias = getAccName(store.accounts[id]);
      
      dailyStats.counts[accAlias] = (dailyStats.counts[accAlias] || 0) + 1;
      const currentRunCount = dailyStats.counts[accAlias];

      tasks.push((async () => {
          await sleep(Math.floor(Math.random() * 1500) + 100); 
          return await runAccount(store.accounts[id], currentRunCount);
      })());
  }

  const results = await Promise.all(tasks);
  saveDailyStats(dailyStats);

  const consoleDetails = [];
  const notifyLines = [];

  for (let i = 0; i < results.length; i++) {
      const res = results[i];
      consoleDetails.push(`【${res.accountName}】\n${res.detail}`);
      
      const solidCount = res.videoCount;
      const hollowCount = MAX_VIDEO - solidCount;
      const progressBar = '■'.repeat(solidCount) + '□'.repeat(hollowCount);
      
      const shortName = res.accountName.split('@')[0];

      const checkMark = res.checkInStr.includes('×') ? '×' : '✓';
      
      const videoTotal = parseFloat((res.videoCount * 0.004).toFixed(3));
      let vtStr = String(videoTotal);
      if (vtStr.startsWith('0.')) {
          vtStr = vtStr.substring(1); 
      }
      vtStr = '+' + vtStr;

      notifyLines.push(`㋡ ${shortName}｜${res.initialBal}▸${res.finalBal} 〔${checkMark}${res.currentRunCount}次 | ${progressBar} ${vtStr}〕`);
  }

  const notifySubtitle = `✓${executeIds.length}个账号已完成`;
  
  notify(scriptName, notifySubtitle, notifyLines.join('\n'));
  console.log(`\n============= 全部任务结束 =============\n${consoleDetails.join('\n\n')}`);

  $done();

})().catch(err => {
  console.log("❌ 脚本全局环境出错: " + err);
  $done();
});// 若不懂用法，请前往「设置」→「文档中心」→「JS API 说明」查看。

const APP_TOKEN = "你的表格app_token";
const TABLE_ID = "你的table_id";
const FIELD_ID = "fldxxxx"; // 存二维码内容的列
const APP_ID = "xxx";       // 飞书应用ID
const APP_SECRET = "yyy";   // 飞书应用secret

let tenantAccessToken = null;

// 获取 tenant_access_token
async function getTenantAccessToken() {
  const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
  });
  const data = await res.json();
  tenantAccessToken = data.tenant_access_token;
}

// 查询表格是否存在
async function checkCodeExist(code) {
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records?filter=CurrentValue.[${FIELD_ID}]="${code}"`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tenantAccessToken}` }
  });
  const data = await res.json();
  return data.data.records.length > 0;
}

// 插入新记录
async function insertRecord(code) {
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records`;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tenantAccessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fields: { [FIELD_ID]: code }
    })
  });
}

// 扫码成功回调
async function onScanSuccess(decodedText) {
  document.getElementById("result").innerText = "正在校验...";
  await getTenantAccessToken();
  const exists = await checkCodeExist(decodedText);
  if (exists) {
    document.getElementById("result").innerText = "⚠️ 已扫过：" + decodedText;
  } else {
    await insertRecord(decodedText);
    document.getElementById("result").innerText = "✅ 扫码成功：" + decodedText;
  }
}

// 初始化扫码
new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 })
  .render(onScanSuccess);

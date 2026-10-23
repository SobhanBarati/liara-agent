import { NextResponse } from 'next/server';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function GET() {
  try {
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "liara-mcp"],
      env: { ...process.env, LIARA_API_TOKEN: process.env.LIARA_API_TOKEN || "", LIARA_TEAM_ID: process.env.LIARA_TEAM_ID || "" },
    });

    const client = new Client({ name: "liara-agent", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    const listResult = await client.callTool({ name: "liara_list_apps", arguments: {} });
    let appsData = [];
    if (listResult && Array.isArray(listResult.content)) {
      try { appsData = JSON.parse(listResult.content.map((c: any) => c.text || "").join("")); } catch (e) {}
    }

    const appsWithMetrics = [];
    for (const app of (Array.isArray(appsData) ? appsData : [])) {
      const appName = app.project_id || app.name || app._id || "بدون نام";
      let cpuUsage = "0%";
      let ramUsage = "0MB";

      try {
        const metricsResult = await client.callTool({ name: "liara_get_metrics", arguments: { appName: appName } });
        
        if (metricsResult && Array.isArray(metricsResult.content)) {
          const metricsText = metricsResult.content.map((c: any) => c.text || "").join("");
          const metrics = JSON.parse(metricsText);
          
          // ✅ پردازش صحیح CPU (مقدار در value[1] هست و به صورت رشته)
          if (metrics.cpuUsage && metrics.cpuUsage[0] && metrics.cpuUsage[0].value) {
            let cpuVal = parseFloat(metrics.cpuUsage[0].value[1]);
            if (!isNaN(cpuVal)) {
              // تبدیل به درصد و گرد کردن
              cpuUsage = `${(cpuVal * 100).toFixed(2)}%`;
            }
          }
          
          // ✅ پردازش صحیح RAM (مقدار در value[1] هست و به صورت رشته بایت)
          if (metrics.memoryUsage && metrics.memoryUsage[0] && metrics.memoryUsage[0].value) {
            let ramVal = parseInt(metrics.memoryUsage[0].value[1], 10);
            if (!isNaN(ramVal)) {
              // تبدیل بایت به مگابایت
              ramUsage = `${Math.round(ramVal / 1024 / 1024)}MB`;
            }
          }
        }
      } catch (e) {}

      appsWithMetrics.push({
        name: appName,
        status: app.status === 'ACTIVE' || app.status === 'running' ? 'running' : 'stopped',
        platform: app.type || 'NodeJS',
        cpu: cpuUsage,
        ram: ramUsage,
      });
    }

    await client.close();
    return NextResponse.json({ success: true, data: appsWithMetrics });
  } catch (error: any) {
    return NextResponse.json({ error: 'خطا در دریافت اپ‌ها', details: error.message }, { status: 500 });
  }
}
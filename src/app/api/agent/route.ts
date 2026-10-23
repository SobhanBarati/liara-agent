import { NextRequest } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import OpenAI from "openai";

const aiClient = new OpenAI({
  baseURL: "https://ai.boxapi.ir/ai/v1", 
  apiKey: process.env.BOXAPI_API_KEY || "",
});

let mcpClient: Client | null = null;

async function getMcpClient() {
  if (mcpClient) return mcpClient;

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "liara-mcp"],
    env: {
      ...process.env,
      LIARA_API_TOKEN: process.env.LIARA_API_TOKEN || "",
    },
  });

  const client = new Client(
    { name: "liara-hackathon-agent", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  mcpClient = client;
  return client;
}

const SENSITIVE_TOOLS = [
  "liara_restart_app",
  "liara_delete_app",
  "liara_resize_app",
  "liara_rollback_release",
  "liara_stop_app",
];

export async function POST(req: NextRequest) {
  try {
    const { message, isConfirmed, appName } = await req.json();
    const targetApp = appName || "test-app"; 

    if (!message) return Response.json({ error: "پیام خالی است" }, { status: 400 });

    const client = await getMcpClient();
    const mcpTools = await client.listTools();

    const tools = mcpTools.tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    let currentMessages: any[] = [
      {
        role: "system",
        content: `تو یک دستیار فنی متخصص در زیرساخت لیارا هستی. 
        کاربر در حال حاضر روی اپلیکیشن "${targetApp}" کار می‌کند.
        
        وظیفه تو کمک به کاربر برای مدیریت اپلیکیشن‌ها، بررسی وضعیت و رفع خطاهاست.
        
        🚨 قوانین بسیار مهم (Human-in-the-Loop):
        ۱. تو باید خودت برای بررسی‌ها (مثل گرفتن لاگ‌ها، چک کردن CPU/RAM، وضعیت اپ) به صورت خودکار ابزارها را صدا بزنی. هرگز از کاربر نپرس "آیا لاگ‌ها را بگیرم؟". فقط انجام بده و نتیجه را گزارش کن!
        ۲. تنها در صورتی که کاربر درخواست یک عملیات حساس (مثل ری‌استارت، حذف، تغییر پلن) را داد، سیستم ما خودش از کاربر تأیید می‌گیرد. تو مستقیماً ابزار مربوطه را صدا بزن.
        ۳. تو فقط یک بار در هر پیام می‌توانی از کاربر سوال بپرسی (در بخش suggestions) و آن هم فقط برای قدم بعدیِ عیب‌یابی باشد، نه اجازه گرفتن.
        ۴. 🟢 در مورد دیپلوی و ساخت منابع: اگر کاربر درخواست ساخت دیتابیس یا دیپلوی کرد، ابتدا لیست ابزارهای خود را بررسی کن. اگر ابزاری با کلمات کلیدی "create" در نام آن وجود دارد، حتماً از آن استفاده کن. اگر ابزار وجود نداشت، به کاربر بگو که در حال حاضر به API ساخت دسترسی نداری و فقط می‌توانی راهنمایی کنی.
        ۵. 💰 قانون بسیار مهم در مورد هزینه‌ها و پلن‌ها: اگر قرار است پلنی انتخاب شود یا هزینه‌ای برای کاربر ایجاد شود، تو موظفی قبل از هر اقدامی، قیمت تقریبی، نقاط قوت و ضعف پلن را به کاربر بگویی. سپس در بخش suggestions، دکمه‌های تایید پلن‌ها را قرار بده. هرگز بدون اجازه کاربر پلنی را انتخاب نکن.
        ۶. 🚨 قانون SRE (پایش خودکار): اگر پیامی با تگ [SRE_ALERT] دریافت کردی، یعنی سیستم به صورت خودکار متوجه افزایش مصرف منابع شده است. در این حالت، تو باید فوراً ابزار دریافت لاگ‌ها را صدا بزنی، علت را تحلیل کنی و یک کارت هشدار به کاربر بدهی. از کاربر نپرس که "آیا لاگ‌ها را بررسی کنم؟"، این کار را خودت انجام بده.
        ۷. 🚨 در موارد بحرانی: اگر در حالت [SRE_ALERT] تشخیص دادی که اپ به طور کامل از کار افتاده (مثلاً خطای Out Of Memory) و ری‌استارت تنها راه نجات است، تو مجازی خودت ابزار liara_restart_app را صدا بزنی و بعد به کاربر بگویی "برای جلوگیری از قطعی کامل، اپ را ری‌استارت کردم". اما برای مواردی مثل مصرف بالای CPU که خطر فوری ندارد، حتماً از کاربر تأیید بگیر. هرگز از ابزار Stop استفاده نکن مگر اینکه کاربر صریحاً درخواست کند.
        
        🚨 قانون بسیار مهم برای خروجی (UI):
        شما باید پاسخ خود را با استفاده از تگ‌های خاص فرمت کنید تا رابط کاربری زیبا شود. هرگز از markdown ساده (مثل ** یا -) برای لیست‌ها استفاده نکنید.
        
        ساختار خروجی شما باید دقیقا به این شکل باشد:
        <summary>یک خلاصه کوتاه و جذاب از وضعیت</summary>
        <card title="عنوان کارت">
          <item label="نام فیلد" value="مقدار فیلد" />
          <item label="نام فیلد" value="<span class='text-emerald-400'>ACTIVE</span>" />
        </card>
        <suggestions>
          <suggestion>تایید پلن small-g2 (اقتصادی)</suggestion>
        </suggestions>
        (نکته: در بخش suggestions، دقیقاً متنی را بنویس که کاربر با کلیک روی آن، آن متن به عنوان پیام جدید برای تو ارسال می‌شود).`,
      },
      { role: "user", content: message },
    ];

    let loops = 0;
    const maxLoops = 4;
    let finalResponse = null;
    let toolExecuted = false;

    while (loops < maxLoops) {
      const completion = await aiClient.chat.completions.create({
        model: "gpt-5.4-mini",
        messages: currentMessages,
        tools: tools,
        tool_choice: "auto",
      });

      const responseMessage = completion.choices[0].message;
      currentMessages.push(responseMessage);

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.type === "function") {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);

            const isSensitive = SENSITIVE_TOOLS.some((t) => toolName.includes(t));
            const userHasConfirmed = isConfirmed || /بله|تأیید|اوکی|yes|confirm/i.test(message);

            // استثنا: اگر ابزار ری‌استارت باشد و پیام SRE باشد، اجازه خودکار بده
            const isSreAutoRestart = message.includes("[SRE_ALERT]") && toolName.includes("liara_restart_app");

            if (isSensitive && !userHasConfirmed && !isSreAutoRestart) {
              return Response.json({
                status: "needs_confirmation",
                message: `برای انجام عملیات «${toolName}» روی اپ ${targetApp} نیاز به تأیید شما دارم. آیا مطمئن هستید؟`,
                pending_tool: { name: toolName, args: toolArgs },
              });
            }

            const toolResult = await client.callTool({ name: toolName, arguments: toolArgs });
            let rawText = Array.isArray(toolResult.content) 
              ? toolResult.content.map((c: any) => c.text || "").join(" ") 
              : String(toolResult.content);

            currentMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: rawText,
            });
            toolExecuted = true;
          }
        }
        loops++;
        continue;
      }

      finalResponse = responseMessage.content;
      break;
    }

    if (!toolExecuted) {
       return Response.json({
          status: "success",
          reply: finalResponse || "من درخواست شما را بررسی کردم، اما ابزار مستقیمی برای اجرای این دستور در اختیار ندارم. لطفاً دستور دقیق‌تری بدهید یا از پنل لیارا اقدام کنید.",
       });
    }

    return Response.json({
      status: "success",
      reply: finalResponse || "عملیات با موفقیت انجام شد.",
    });

  } catch (error: any) {
    console.error("Agent Error:", error);
    return Response.json(
      { status: "error", reply: "متأسفانه در پردازش درخواست خطایی رخ داد.", details: error.message },
      { status: 500 }
    );
  }
}
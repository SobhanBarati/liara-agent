require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

async function testBoxAPI() {
  console.log('🔄 در حال تست اتصال به BoxAPI...');
  
  const aiClient = new OpenAI({
    baseURL: "https://ai.boxapi.ir/ai/v1", // ✅ آدرس صحیح از تصویر
    apiKey: process.env.BOXAPI_API_KEY || "",
  });

  try {
    const response = await aiClient.chat.completions.create({
      model: "gpt-5.4-mini", // ✅ مدل مجاز هکاتون
      messages: [{ role: "user", content: "فقط بگو: اتصال برقرار است" }],
    });
    
    console.log('✅ BoxAPI متصل شد!');
    console.log('📝 پاسخ مدل:', response.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ خطا در اتصال به BoxAPI:', error.message);
    if (error.status) console.error('   کد خطا:', error.status);
    return false;
  }
}

async function testLiaraAPI() {
  console.log('\n🔄 در حال تست اتصال به API لیارا...');
  
  try {
    const res = await fetch('https://api.liara.ir/v1/projects', {
      headers: {
        'Authorization': `Bearer ${process.env.LIARA_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      console.log('✅ API لیارا متصل شد!');
      return true;
    } else {
      console.error('❌ خطا در اتصال به لیارا. کد وضعیت:', res.status);
      return false;
    }
  } catch (error) {
    console.error('❌ خطا در اتصال به لیارا:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 شروع تست‌های اولیه...\n');
  console.log('🔑 توکن BoxAPI:', process.env.BOXAPI_API_KEY ? 'موجود ✅' : 'ناموجود ❌');
  console.log('🔑 توکن لیارا:', process.env.LIARA_API_TOKEN ? 'موجود ✅' : 'ناموجود ❌');
  console.log('---');

  const boxOk = await testBoxAPI();
  const liaraOk = await testLiaraAPI();

  console.log('\n📊 نتیجه نهایی:');
  console.log('BoxAPI:', boxOk ? '✅' : '❌');
  console.log('Liara API:', liaraOk ? '✅' : '❌');
  
  if (boxOk && liaraOk) {
    console.log('\n🎉 همه چیز آماده است! می‌توانی سرور Next.js را اجرا کنی.');
  }
}

main();
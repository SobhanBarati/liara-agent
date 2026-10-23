"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  needsConfirmation?: boolean;
  toolName?: string;
  rawToolOutput?: any;
};

type AppData = {
  name: string;
  status: string;
  platform: string;
  cpu: string;
  ram: string;
};

type Plan = {
  id: string;
  name: string;
  tier: "پایه" | "نقره‌ای" | "طلایی";
  price: number;
  cpu: string;
  ram: string;
  disk: string;
  pros: string[];
  cons: string[];
  recommended?: boolean;
};

const APP_PLANS: Plan[] = [
  // 🟢 سطح پایه (Basic)
  { id: "basic-small", name: "زمین", tier: "پایه", price: 750000, cpu: "0.5 Core", ram: "512MB", disk: "5GB", pros: ["مناسب پروژه‌های شخصی", "هزینه بسیار کم"], cons: ["محدودیت ترافیک بالا"], recommended: false },
  { id: "basic-medium", name: "مریخ", tier: "پایه", price: 1300000, cpu: "1 Core", ram: "1GB", disk: "10GB", pros: ["مناسب استارتاپ‌های کوچک", "تعادل قیمت و منابع"], cons: [], recommended: true },
  
  // 🥈 سطح نقره‌ای (Silver)
  { id: "silver-small", name: "زمین", tier: "نقره‌ای", price: 950000, cpu: "0.5 Core", ram: "512MB", disk: "5GB", pros: ["مناسب پروژه‌های شخصی", "هزینه بسیار کم"], cons: ["محدودیت ترافیک بالا"], recommended: false },
  { id: "silver-medium", name: "مریخ", tier: "نقره‌ای", price: 1650000, cpu: "1 Core", ram: "1GB", disk: "10GB", pros: ["مناسب استارتاپ‌های کوچک", "تعادل قیمت و منابع"], cons: [], recommended: false },
  { id: "silver-large", name: "مشتری", tier: "نقره‌ای", price: 2950000, cpu: "2 Core", ram: "2GB", disk: "20GB", pros: ["منابع پایدار", "مناسب ترافیک متوسط"], cons: ["هزینه متوسط"], recommended: false },
  { id: "silver-xlarge", name: "زحل", tier: "نقره‌ای", price: 5300000, cpu: "2 Core", ram: "4GB", disk: "40GB", pros: ["منابع نامحدود", "مناسب سازمان‌ها"], cons: ["هزینه بالا"], recommended: false },

  // 🥇 سطح طلایی (Gold)
  { id: "gold-small", name: "زمین", tier: "طلایی", price: 1300000, cpu: "0.5 Core", ram: "512MB", disk: "5GB", pros: ["مناسب پروژه‌های شخصی", "هزینه بسیار کم"], cons: ["محدودیت ترافیک بالا"], recommended: false },
  { id: "gold-medium", name: "مریخ", tier: "طلایی", price: 2300000, cpu: "1 Core", ram: "1GB", disk: "10GB", pros: ["مناسب استارتاپ‌های کوچک", "تعادل قیمت و منابع"], cons: [], recommended: true },
  { id: "gold-large", name: "مشتری", tier: "طلایی", price: 4125000, cpu: "2 Core", ram: "2GB", disk: "20GB", pros: ["منابع پایدار", "مناسب ترافیک متوسط"], cons: ["هزینه متوسط"], recommended: false },
  { id: "gold-xlarge", name: "زحل", tier: "طلایی", price: 7250000, cpu: "2 Core", ram: "4GB", disk: "40GB", pros: ["منابع نامحدود", "مناسب سازمان‌ها"], cons: ["هزینه بالا"], recommended: false },
  { id: "gold-xxlarge", name: "اورانوس", tier: "طلایی", price: 12600000, cpu: "4 Core", ram: "8GB", disk: "80GB", pros: ["حداکثر قدرت پردازش", "مناسب سازمان‌ها"], cons: ["گران‌ترین پلن"], recommended: false },
  { id: "gold-xxxlarge", name: "نپتون", tier: "طلایی", price: 22000000, cpu: "8 Core", ram: "16GB", disk: "160GB", pros: ["حداکثر قدرت پردازش", "مناسب سازمان‌ها"], cons: ["گران‌ترین پلن"], recommended: false },
  { id: "gold-max", name: "پلوتون", tier: "طلایی", price: 38500000, cpu: "16 Core", ram: "32GB", disk: "320GB", pros: ["حداکثر قدرت پردازش", "مناسب سازمان‌ها"], cons: ["گران‌ترین پلن"], recommended: false },
];

const DB_PLANS: Plan[] = [
  // 🟢 سطح پایه (Basic)
  { id: "basic-small", name: "زمین", tier: "پایه", price: 750000, cpu: "0.5 Core", ram: "512MB", disk: "5GB", pros: ["مناسب دیتابیس‌های کم‌مصرف", "هزینه بسیار کم"], cons: ["محدودیت داده‌های زیاد"], recommended: false },
  { id: "basic-medium", name: "مریخ", tier: "پایه", price: 1300000, cpu: "1 Core", ram: "1GB", disk: "10GB", pros: ["مناسب بیشتر پروژه‌ها", "تعادل قیمت و منابع"], cons: [], recommended: true },

  // 🥈 سطح نقره‌ای (Silver)
  { id: "silver-small", name: "زمین", tier: "نقره‌ای", price: 950000, cpu: "0.5 Core", ram: "512MB", disk: "5GB", pros: ["مناسب دیتابیس‌های کم‌مصرف", "هزینه بسیار کم"], cons: ["محدودیت داده‌های زیاد"], recommended: false },
  { id: "silver-medium", name: "مریخ", tier: "نقره‌ای", price: 1650000, cpu: "1 Core", ram: "1GB", disk: "10GB", pros: ["مناسب بیشتر پروژه‌ها", "تعادل قیمت و منابع"], cons: [], recommended: false },
  { id: "silver-large", name: "مشتری", tier: "نقره‌ای", price: 2950000, cpu: "2 Core", ram: "2GB", disk: "20GB", pros: ["منابع پایدار", "مناسب ترافیک متوسط"], cons: ["هزینه متوسط"], recommended: false },
  { id: "silver-xlarge", name: "زحل", tier: "نقره‌ای", price: 5300000, cpu: "2 Core", ram: "4GB", disk: "40GB", pros: ["منابع نامحدود", "مناسب سازمان‌ها"], cons: ["هزینه بالا"], recommended: false },

  // 🥇 سطح طلایی (Gold)
  { id: "gold-small", name: "زمین", tier: "طلایی", price: 1300000, cpu: "0.5 Core", ram: "512MB", disk: "5GB", pros: ["مناسب دیتابیس‌های کم‌مصرف", "هزینه بسیار کم"], cons: ["محدودیت داده‌های زیاد"], recommended: false },
  { id: "gold-medium", name: "مریخ", tier: "طلایی", price: 2300000, cpu: "1 Core", ram: "1GB", disk: "10GB", pros: ["مناسب بیشتر پروژه‌ها", "تعادل قیمت و منابع"], cons: [], recommended: true },
  { id: "gold-large", name: "مشتری", tier: "طلایی", price: 4125000, cpu: "2 Core", ram: "2GB", disk: "20GB", pros: ["منابع پایدار", "مناسب ترافیک متوسط"], cons: ["هزینه متوسط"], recommended: false },
  { id: "gold-xlarge", name: "زحل", tier: "طلایی", price: 7250000, cpu: "2 Core", ram: "4GB", disk: "40GB", pros: ["منابع نامحدود", "مناسب سازمان‌ها"], cons: ["هزینه بالا"], recommended: false },
  { id: "gold-xxlarge", name: "اورانوس", tier: "طلایی", price: 12600000, cpu: "4 Core", ram: "8GB", disk: "80GB", pros: ["حداکثر قدرت پردازش", "مناسب سازمان‌ها"], cons: ["گران‌ترین پلن"], recommended: false },
  { id: "gold-xxxlarge", name: "نپتون", tier: "طلایی", price: 22000000, cpu: "8 Core", ram: "16GB", disk: "160GB", pros: ["حداکثر قدرت پردازش", "مناسب سازمان‌ها"], cons: ["گران‌ترین پلن"], recommended: false },
  { id: "gold-max", name: "پلوتون", tier: "طلایی", price: 38500000, cpu: "16 Core", ram: "32GB", disk: "320GB", pros: ["حداکثر قدرت پردازش", "مناسب سازمان‌ها"], cons: ["گران‌ترین پلن"], recommended: false },
];

export default function ChatPage() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [activeApp, setActiveApp] = useState<AppData | null>(null);
  const [isAppsLoading, setIsAppsLoading] = useState(true);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSreMode, setIsSreMode] = useState(true);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardType, setWizardType] = useState<"app" | "db" | null>(null);
  const [wizardFramework, setWizardFramework] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: `سلام! من دستیار هوشمند لیارا هستم. \nدر حال اتصال به لیست اپ‌های شما هستم...` 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchApps = async () => {
    setIsAppsLoading(true);
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setApps(data.data);
        if (!activeApp) {
          setActiveApp(data.data[0]);
          setMessages([{
            role: "assistant",
            content: `سلام! من دستیار هوشمند لیارا هستم. \nدر حال حاضر روی اپلیکیشن **${data.data[0].name}** متمرکز هستم. چطور می‌تونم کمکت کنم؟`
          }]);
        }
      } else {
        setMessages([{
          role: "assistant",
          content: `سلام! من دستیار هوشمند لیارا هستم. \nمتأسفانه هیچ اپلیکیشنی در حساب لیارای شما پیدا نکردم.`
        }]);
      }
    } catch (error) {
      console.error("خطا در دریافت اپ‌ها:", error);
    } finally {
      setIsAppsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 🟢 سیستم پایش خودکار SRE
  useEffect(() => {
    if (!isSreMode || !activeApp) return;

    let alertSent = false;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch('/api/apps');
        const data = await res.json();
        if (data.success && data.data) {
          const currentApp = data.data.find((a: any) => a.name === activeApp.name);
          if (currentApp) {
            const cpuPercent = parseFloat(currentApp.cpu) || 0;
            const ramMb = parseInt(currentApp.ram) || 0;
            
            // 🟢 برای تست در دمو آستانه 0 است (برای حالت نهایی 80 و 900)
            const isHighLoad = cpuPercent > 80 || ramMb > 900;

            if (isHighLoad && !alertSent) {
              alertSent = true;
              sendMessage(`[SRE_ALERT] مصرف منابع اپلیکیشن ${activeApp.name} به طور غیرعادی بالا رفته است (CPU: ${currentApp.cpu}، RAM: ${currentApp.ram}). به عنوان یک SRE، لاگ‌ها را بررسی کن و علت را پیدا کن.`);
            } 
            else if (!isHighLoad) {
              alertSent = false;
            }
          }
        }
      } catch (error) {
        console.error("SRE Monitor Error:", error);
      }
    }, 60000); // 🟢 برای تست در دمو 10 ثانیه (برای حالت نهایی 60000)

    return () => clearInterval(intervalId);
  }, [isSreMode, activeApp]);

  const openWizard = () => {
    setIsWizardOpen(true);
    setWizardStep(0);
    setWizardType(null);
    setWizardFramework(null);
    setSelectedPlan(null);
    setSelectedTier(null);
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
    setWizardStep(0);
    setWizardType(null);
    setWizardFramework(null);
    setSelectedPlan(null);
    setSelectedTier(null);
  };

  const handleTypeSelect = (type: "app" | "db") => {
    setWizardType(type);
    setWizardStep(1);
  };

  const handleFrameworkSelect = (framework: string) => {
    setWizardFramework(framework);
    setWizardStep(2);
  };

  const handleTierSelect = (tier: string) => {
    setSelectedTier(tier);
    const plans = wizardType === "app" ? APP_PLANS : DB_PLANS;
    const plan = plans.find((p) => p.tier === tier);
    if (plan) setSelectedPlan(plan);
  };

  const handlePlanChange = (planId: string) => {
    const plans = wizardType === "app" ? APP_PLANS : DB_PLANS;
    const plan = plans.find((p) => p.id === planId);
    if (plan) setSelectedPlan(plan);
  };

  const handleFinalConfirm = () => {
    if (!wizardType || !wizardFramework || !selectedPlan) return;
    
    const typeLabel = wizardType === "app" ? "اپلیکیشن" : "دیتابیس";
    const frameworkLabel = wizardFramework;
    const planLabel = selectedPlan.id;
    
    closeWizard();
    
    sendMessage(
      `من دیپلوی ${typeLabel} ${frameworkLabel} با پلن ${planLabel} (${selectedPlan.name} - ${selectedPlan.tier} - ${selectedPlan.price.toLocaleString()} تومان در ماه) را تایید کردم. لطفاً ابزار ساخت را با این پلن اجرا کن.`
    );
  };

  const renderToolOutput = (output: any) => {
    if (!output) return null;
    
    let textOutput = "";
    if (Array.isArray(output)) {
      textOutput = output.map((item: any) => (item.type === "text" ? item.text : "")).join("\n");
    } else if (typeof output === "string") {
      textOutput = output;
    } else if (output.content && Array.isArray(output.content)) {
      textOutput = output.content.map((item: any) => (item.type === "text" ? item.text : "")).join("\n");
    }

    if (!textOutput || textOutput === "[]" || textOutput.trim() === "") return null;

    const hasSensitiveData = textOutput.includes("DATABASE_URL") || textOutput.includes("BOXAPI_KEY") || textOutput.includes("postgresql://");

    if (hasSensitiveData) {
      return (
        <div className="mt-3 bg-[#0B1120] border border-green-500/20 rounded-xl p-3 md:p-4 w-full shadow-inner">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-white">اطلاعات با موفقیت دریافت شد</h4>
              <p className="text-[10px] md:text-xs text-gray-400">به دلایل امنیتی، اطلاعات حساس (مانند رمز دیتابیس و توکن‌ها) نمایش داده نمی‌شوند.</p>
            </div>
          </div>
          <div className="text-[10px] md:text-xs text-cyan-200 font-mono bg-cyan-950/30 p-2 md:p-3 rounded-lg overflow-x-auto text-right">
            <div className="text-emerald-400">وضعیت اپ: ACTIVE (در حال اجرا)</div>
            <div className="text-gray-400 mt-1">سایر اطلاعات به صورت امن در سرور نگه‌داری می‌شود.</div>
          </div>
        </div>
      );
    }

    if (textOutput.includes('"success": false') || textOutput.includes("APP_NOT_FOUND") || textOutput.includes('"error"')) {
      return (
        <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-xl p-3 md:p-4 w-full shadow-inner">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-red-400">خطا در اجرا</h4>
              <p className="text-[10px] md:text-xs text-red-400/70">لیارا با این درخواست موافقت نکرد</p>
            </div>
          </div>
          <div className="text-[10px] md:text-xs text-red-200 font-mono bg-red-950/30 p-2 md:p-3 rounded-lg overflow-x-auto text-right max-h-40 md:max-h-60 custom-scrollbar">
            {textOutput}
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-2 md:mt-3 text-[10px] md:text-xs text-gray-300 font-mono bg-[#0B1120] border border-white/5 p-2 md:p-3 rounded-lg overflow-x-auto text-right max-h-40 md:max-h-60 custom-scrollbar">
        {textOutput}
      </div>
    );
  };

  const renderRichContent = (content: string) => {
    if (!content) return null;

    if (!content.includes("<summary>") && !content.includes("<card>")) {
      return <div className="whitespace-pre-wrap leading-relaxed">{content.replace(/\*\*/g, "")}</div>;
    }

    const summaryMatch = content.match(/<summary>([\s\S]*?)<\/summary>/);
    const cardsMatch = content.match(/<card[^>]*>([\s\S]*?)<\/card>/g);
    const suggestionsMatch = content.match(/<suggestions>([\s\S]*?)<\/suggestions>/);

    return (
      <div className="space-y-4 w-full">
        {summaryMatch && (
          <p className="text-sm md:text-base font-medium text-gray-100 leading-relaxed">
            {summaryMatch[1].trim()}
          </p>
        )}

        {cardsMatch && cardsMatch.map((cardHtml, i) => {
          const titleMatch = cardHtml.match(/title="(.*?)"/);
          const title = titleMatch ? titleMatch[1] : "اطلاعات";
          const items = [...cardHtml.matchAll(/<item label="(.*?)" value="(.*?)" \/>/g)];

          return (
            <div key={i} className="bg-[#0B1120] border border-cyan-500/20 rounded-2xl p-4 md:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden group w-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all"></div>
              
              <h4 className="text-xs md:text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {title}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {items.map((item, j) => (
                  <div key={j} className="flex flex-col gap-1.5 bg-[#070B14]/50 p-3 rounded-xl border border-white/5 w-full overflow-hidden">
                    <span className="text-[10px] text-gray-500 font-bold">{item[1]}</span>
                    <span 
                      className={`text-xs text-gray-200 break-all w-full text-right ${
                        /^[A-Za-z0-9\s\-\_\.\:\/]+$/.test(item[2].replace(/<[^>]*>/g, '')) 
                          ? 'font-mono dir-ltr' 
                          : 'font-sans'
                      }`}
                      dangerouslySetInnerHTML={{ 
                        __html: item[2]
                          .replace(/ACTIVE|NO CRITICAL ERRORS FOUND/g, '<span class="text-emerald-400 font-bold">$&</span>')
                          .replace(/INACTIVE|ERROR|FAILED/g, '<span class="text-red-400 font-bold">$&</span>')
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {suggestionsMatch && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2">
            {[...suggestionsMatch[1].matchAll(/<suggestion>([\s\S]*?)<\/suggestion>/g)].map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s[1])}
                className="text-[11px] md:text-xs bg-linear-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-300 border border-cyan-500/30 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-right w-full sm:w-auto"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {s[1]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sendMessage = async (text: string, isConfirmed = false) => {
    if (!text.trim() && !isConfirmed) return;
    if (!isConfirmed) setMessages((prev) => [...prev, { role: "user", content: text }]);
    
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, isConfirmed, appName: activeApp?.name || "test-app" }), 
      });
      const data = await res.json();

      if (data.status === "needs_confirmation") {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message, needsConfirmation: true, toolName: data.pending_tool?.name }]);
      } else if (data.status === "success") {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "پاسخی دریافت نشد.", rawToolOutput: data.tool_output }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ " + (data.reply || "خطایی رخ داد.") }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ خطا در ارتباط با سرور." }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleConfirm = () => {
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    sendMessage(lastUserMessage, true);
    setMessages(prev => prev.filter(m => !m.needsConfirmation));
  };

  const handleReject = () => {
    setMessages(prev => [...prev.filter(m => !m.needsConfirmation), { role: "assistant", content: "باشه، عملیات لغو شد." }]);
  };

  return (
    <div className="flex h-dvh bg-[#070B14] text-gray-200 font-sans selection:bg-cyan-500/30" dir="rtl">
      
      {/* 🟢 سایدبار (دسکتاپ) */}
      <aside className={`bg-[#0B1120] border-l border-white/5 flex-col relative z-20 shadow-2xl transition-all duration-300 ${isSidebarOpen ? 'w-70 flex' : 'w-0 hidden lg:flex overflow-hidden border-none'}`}>
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">کنسول مدیریت</h2>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={fetchApps} 
              className={`text-gray-400 hover:text-cyan-400 transition-all p-1.5 rounded-lg hover:bg-white/5 ${isAppsLoading ? 'animate-spin' : ''}`} 
              title="بروزرسانی لیست"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors" 
              title="جمع کردن سایدبار"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col">
          <div className="flex items-center justify-between mb-3 pr-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">اپلیکیشن‌ها</p>
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-mono">{apps.length}</span>
          </div>
          
          {isAppsLoading ? (
            <p className="text-xs text-gray-500 text-center py-4 animate-pulse">در حال دریافت اپ‌ها...</p>
          ) : apps.length === 0 ? (
            <div className="text-center py-6 bg-[#0F172A] rounded-xl border border-dashed border-gray-700">
              <p className="text-xs text-red-400">اپی پیدا نشد</p>
            </div>
          ) : (
            apps.map((app) => (
              <button
                key={app.name}
                onClick={() => setActiveApp(app)}
                className={`w-full text-right p-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden mb-2 ${
                  activeApp?.name === app.name 
                    ? "bg-linear-to-l from-[#0F172A] to-[#0B1120] border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                {activeApp?.name === app.name && <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-r-xl shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>}
                
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      app.status === "running" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                      "bg-gray-500"
                    }`}></span>
                    <span className={`text-sm font-bold ${activeApp?.name === app.name ? "text-cyan-400" : "text-gray-300 group-hover:text-white"}`} dir="ltr">{app.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono" dir="ltr">{app.platform}</span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">Running</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono dir-ltr gap-2 mb-3">
                  <div className="flex items-center justify-between bg-[#070B14]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-white/5 flex-1 shadow-inner">
                    <span className="text-[9px] text-gray-500 font-sans font-bold">RAM</span>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4zm0 5c0 2.21 3.582 4 8 4s8-1.79 8-4"></path></svg>
                      <span className="truncate">{app.ram}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-[#070B14]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-white/5 flex-1 shadow-inner">
                    <span className="text-[9px] text-gray-500 font-sans font-bold">CPU</span>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                      <span className="truncate">{app.cpu}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[9px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Iran</span>
                  </div>
                  <span className="text-gray-700">•</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span>Earth Plan</span>
                  </div>
                </div>
              </button>
            ))
          )}
          
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[10px] text-gray-500 text-center mb-2">اپ جدیدی می‌خواهی بسازی؟</p>
            <button 
              onClick={openWizard}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-700 rounded-xl text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-xs font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              اپلیکیشن جدید
            </button>
          </div>

          <div className="mt-auto pt-6">
            <div className="bg-[#070B14] rounded-xl p-4 border border-white/5 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-400">وضعیت کلی</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">سالم</span>
              </div>
              <div className="flex items-center gap-2 text-white font-bold">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
                <span className="text-sm">{apps.length} اپلیکیشن فعال</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 m-4 mt-0 bg-[#070B14] rounded-xl border border-white/5 shadow-inner">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            <span className="text-xs font-bold text-white">اتصال امن برقرار است</span>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">متصل به API لیارا با توکن معتبر</p>
        </div>
      </aside>

      {/* 🟢 سایدبار (موبایل - Overlay) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)}></div>
          <aside className="w-[85vw] max-w-[320px] bg-[#0B1120] h-full relative z-10 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h2 className="text-sm font-bold text-white tracking-wide">کنسول مدیریت</h2>
              </div>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="text-gray-400 hover:text-white p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col">
              <div className="flex items-center justify-between mb-3 pr-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">اپلیکیشن‌ها</p>
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-mono">{apps.length}</span>
              </div>

              {isAppsLoading ? (
                <p className="text-xs text-gray-500 text-center py-4 animate-pulse">در حال دریافت اپ‌ها...</p>
              ) : apps.length === 0 ? (
                <div className="text-center py-6 bg-[#0F172A] rounded-xl border border-dashed border-gray-700">
                  <p className="text-xs text-red-400">اپی پیدا نشد</p>
                </div>
              ) : (
                apps.map((app) => (
                  <button
                    key={app.name}
                    onClick={() => { setActiveApp(app); setIsMobileSidebarOpen(false); }}
                    className={`w-full text-right p-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden mb-2 ${
                      activeApp?.name === app.name 
                        ? "bg-linear-to-l from-[#0F172A] to-[#0B1120] border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {activeApp?.name === app.name && <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-r-xl shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>}
                    
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          app.status === "running" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                          "bg-gray-500"
                        }`}></span>
                        <span className={`text-sm font-bold ${activeApp?.name === app.name ? "text-cyan-400" : "text-gray-300 group-hover:text-white"}`} dir="ltr">{app.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono" dir="ltr">{app.platform}</span>
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">Running</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono dir-ltr gap-2 mb-3">
                      <div className="flex items-center justify-between bg-[#070B14]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-white/5 flex-1 shadow-inner">
                        <span className="text-[9px] text-gray-500 font-sans font-bold">RAM</span>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4zm0 5c0 2.21 3.582 4 8 4s8-1.79 8-4"></path></svg>
                          <span className="truncate">{app.ram}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-[#070B14]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-white/5 flex-1 shadow-inner">
                        <span className="text-[9px] text-gray-500 font-sans font-bold">CPU</span>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                          <span className="truncate">{app.cpu}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[9px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Iran</span>
                      </div>
                      <span className="text-gray-700">•</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span>Earth Plan</span>
                      </div>
                    </div>
                  </button>
                ))
              )}

              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-gray-500 text-center mb-2">اپ جدیدی می‌خواهی بسازی؟</p>
                <button 
                  onClick={() => { setIsMobileSidebarOpen(false); openWizard(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-700 rounded-xl text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-xs font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  اپلیکیشن جدید
                </button>
              </div>

              <div className="mt-auto pt-6">
                <div className="bg-[#070B14] rounded-xl p-4 border border-white/5 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-400">وضعیت کلی</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">سالم</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
                    <span className="text-sm">{apps.length} اپلیکیشن فعال</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 m-4 mt-0 bg-[#070B14] rounded-xl border border-white/5 shadow-inner">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                <span className="text-xs font-bold text-white">اتصال امن برقرار است</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">متصل به API لیارا با توکن معتبر</p>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative h-full bg-[#070B14]">
        
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <header className="bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 md:px-6 sticky top-0 z-10 w-full shadow-sm">
          <div className="flex items-center justify-between max-w-5xl mx-auto w-full gap-3">
            <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 text-gray-400 hover:text-white bg-[#1E293B] rounded-lg border border-white/10 shrink-0 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>

              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="hidden lg:flex p-1.5 text-gray-400 hover:text-white bg-[#1E293B] rounded-lg border border-white/10 shrink-0 ml-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
              )}

              <div className="relative shrink-0">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-linear-to-br from-[#1E293B] to-[#0B1120] border border-white/10 flex items-center justify-center shadow-lg">
                  <span className="text-xl md:text-2xl drop-shadow-md">🤖</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-green-500 border-2 border-[#0B1120] rounded-full"></div>
              </div>
              <div>
                <h1 className="text-sm md:text-base font-bold text-white">دستیار هوشمند لیارا</h1>
                <p className="text-[10px] md:text-xs text-gray-400 flex flex-wrap items-center gap-1 md:gap-2 mt-0.5">
                  <span>در حال بررسی:</span>
                  <span className="font-mono text-cyan-400 bg-cyan-500/10 px-1.5 md:px-2 py-0.5 rounded-md border border-cyan-500/20 truncate max-w-25" dir="ltr">{activeApp?.name || "..."}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* 🟢 دکمه SRE (در موبایل فقط آیکون، در دسکتاپ با متن) */}
              <button 
                onClick={() => setIsSreMode(!isSreMode)}
                className={`flex items-center justify-center gap-2 p-2 md:px-4 md:py-2 rounded-full transition-all text-[10px] md:text-xs font-bold border ${
                  isSreMode 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]" 
                    : "bg-[#070B14] text-gray-500 border-white/10"
                }`}
                title="حالت SRE"
              >
                <span className={`w-2 h-2 rounded-full ${isSreMode ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`}></span>
                <span className="hidden sm:inline">حالت SRE {isSreMode ? "فعال" : "غیرفعال"}</span>
              </button>

              {/* 🟢 دکمه دیپلوی سریع (در موبایل فقط آیکون، در دسکتاپ با متن) */}
              <button 
                onClick={openWizard}
                className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white p-2 md:px-4 md:py-2 rounded-full shadow-lg shadow-cyan-500/20 transition-all text-[10px] md:text-xs font-bold"
                title="دیپلوی سریع"
              >
                <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span className="hidden sm:inline">دیپلوی سریع</span>
              </button>

              {/* دکمه مدل (فقط در دسکتاپ) */}
              <div className="hidden lg:flex items-center gap-2 bg-[#070B14] px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/5 shadow-inner">
                <span className="text-[10px] md:text-xs text-gray-400">مدل:</span>
                <span className="text-[10px] md:text-xs font-mono text-cyan-400">gpt-5.4-mini</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 md:p-8 space-y-4 md:space-y-8 max-w-5xl w-full mx-auto custom-scrollbar relative z-10">
          {messages.map((msg, idx) => {
            const isFirstAssistantMessage = idx === 0 && msg.role === "assistant";
            
            return (
              <div key={idx} className="w-full">
                <div className={`flex gap-2 md:gap-5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                    msg.role === "user" 
                      ? "bg-linear-to-br from-cyan-600 to-blue-700 text-white" 
                      : "bg-[#0B1120] border border-white/10 text-cyan-400"
                  }`}>
                    {msg.role === "user" ? "👤" : <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                  </div>

                  <div className={`max-w-[85%] md:max-w-[80%] ${msg.role === "user" ? "w-fit" : "w-full"}`}>
                    <div
                      className={`p-4 md:p-6 rounded-xl md:rounded-2xl text-xs md:text-[13px] leading-relaxed shadow-sm transition-all duration-300 ${
                        msg.role === "user"
                          ? "bg-linear-to-br from-cyan-600 to-cyan-700 text-white rounded-tl-none shadow-cyan-900/20" 
                          : isFirstAssistantMessage
                            ? "bg-linear-to-br from-[#0F172A] to-[#0B1120] border border-cyan-500/30 text-gray-200 rounded-tr-none shadow-[0_0_20px_rgba(6,182,212,0.05)] ring-1 ring-white/5"
                            : "bg-[#0F172A] border border-white/5 text-gray-200 rounded-tr-none"
                      }`}
                    >
                      <div className="w-full">{renderRichContent(msg.content)}</div>
                      {msg.rawToolOutput && renderToolOutput(msg.rawToolOutput.content || msg.rawToolOutput)}
                    </div>
                    
                    {msg.needsConfirmation && (
                      <div className="mt-2 md:mt-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 md:p-5 backdrop-blur-sm shadow-lg shadow-amber-900/10">
                        <div className="flex items-start gap-2 md:gap-4">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs md:text-sm text-amber-200 font-bold">تأییدیه امنیتی مورد نیاز است</p>
                            <p className="text-[10px] md:text-xs text-amber-500/70 mt-1 mb-2 md:mb-4">این عملیات زیرساخت اپلیکیشن شما را تغییر می‌دهد.</p>
                            <div className="flex gap-2 md:gap-3">
                              <button onClick={handleConfirm} className="bg-amber-500 hover:bg-amber-400 text-black px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all shadow-lg shadow-amber-500/20">
                                تأیید و اجرا
                              </button>
                              <button onClick={handleReject} className="bg-transparent hover:bg-white/5 text-gray-400 px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-medium transition-all border border-white/10">
                                لغو
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {idx === 0 && messages.length === 1 && (
                  <div className="mt-4 mr-9 md:mr-14 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {[
                      { label: "وضعیت اپ رو چک کن", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", prompt: "لطفاً وضعیت فعلی اپلیکیشن، مصرف CPU و RAM و همچنین لاگ‌های اخیر آن را بررسی کن." },
                      { label: "لاگ‌ها رو بررسی کن", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", prompt: "لطفاً لاگ‌های اپلیکیشن را بررسی کن و اگر خطایی وجود دارد به من بگو." },
                      { label: "اپ رو ری‌استارت کن", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", prompt: "لطفاً اپلیکیشن را ری‌استارت کن." }
                    ].map((action, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(action.prompt)}
                        className="flex items-center gap-2 bg-[#0F172A] hover:bg-white/5 border border-white/5 hover:border-cyan-500/30 p-2.5 pr-3 rounded-xl transition-all text-right group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon}></path></svg>
                        </div>
                        <span className="text-[11px] md:text-xs text-gray-300 group-hover:text-white">{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex gap-2 md:gap-5 flex-row">
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-[#0B1120] border border-white/10 flex items-center justify-center text-cyan-400 shadow-lg shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div className="bg-[#0F172A] border border-white/5 p-3 md:p-5 rounded-xl md:rounded-2xl rounded-tr-none flex items-center gap-1.5 md:gap-2">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="bg-linear-to-t from-[#070B14] via-[#070B14]/95 to-transparent pt-6 pb-4 md:pt-10 md:pb-6 px-3 md:px-4 sticky bottom-0 z-20">
          <div className="max-w-3xl mx-auto relative group">
            
            <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500/20 via-blue-500/10 to-cyan-500/20 rounded-2xl blur-md opacity-40 group-focus-within:opacity-100 transition duration-500"></div>
            
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="relative flex items-end gap-2 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-cyan-500/50 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`دستور برای ${activeApp?.name || "..."}...`}
                className="flex-1 bg-transparent px-3 py-2 md:py-3 focus:outline-none text-base md:text-sm text-white placeholder-gray-500 resize-none h-11 md:h-auto max-h-32 custom-scrollbar"
                disabled={isLoading}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              
              <button type="submit" disabled={isLoading || !input.trim()} className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-cyan-900/30 mb-0.5 group-focus-within:shadow-cyan-500/30">
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                )}
              </button>
            </form>
            
            <p className="hidden md:block text-center text-[10px] text-gray-500/70 mt-3">
              هوش مصنوعی ممکن است اشتباه کند. لطفاً نتایج عملیات را بررسی کنید.
            </p>
          </div>
        </footer>
      </div>

      {/* 🟢 Wizard دیپلوی (سه مرحله‌ای) */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0B1120] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0B1120] z-10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                {wizardStep === 0 && "چه چیزی می‌خواهی بسازی؟"}
                {wizardStep === 1 && (wizardType === "app" ? "فریم‌ورک اپلیکیشن" : "نوع دیتابیس")}
                {wizardStep === 2 && "انتخاب پلن (بر اساس سطح)"}
                {wizardStep === 3 && "تأیید نهایی و پرداخت"}
              </h3>
              <button onClick={closeWizard} className="text-gray-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>

            {wizardStep === 0 && (
              <div className="p-5 space-y-3">
                <button onClick={() => handleTypeSelect("app")} className="w-full flex items-center gap-4 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-4 rounded-xl transition-all text-right group">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">اپلیکیشن</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">دیپلوی یک وب‌سایت یا سرویس جدید</p>
                  </div>
                </button>

                <button onClick={() => handleTypeSelect("db")} className="w-full flex items-center gap-4 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-4 rounded-xl transition-all text-right group">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4zm0 5c0 2.21 3.582 4 8 4s8-1.79 8-4"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">دیتابیس</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">ایجاد یک دیتابیس مدیریت‌شده</p>
                  </div>
                </button>
              </div>
            )}

            {wizardStep === 1 && (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wizardType === "app" ? (
                  <>
                    <button onClick={() => handleFrameworkSelect("Next.js")} className="flex items-center gap-3 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all text-right">
                      <span className="text-2xl">⚛️</span>
                      <div><p className="text-sm font-bold text-white">Next.js</p><p className="text-[10px] text-gray-400">ری‌اکت</p></div>
                    </button>
                    <button onClick={() => handleFrameworkSelect("Node.js")} className="flex items-center gap-3 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all text-right">
                      <span className="text-2xl">🟢</span>
                      <div><p className="text-sm font-bold text-white">Node.js</p><p className="text-[10px] text-gray-400">سرور</p></div>
                    </button>
                    <button onClick={() => handleFrameworkSelect("Laravel")} className="flex items-center gap-3 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all text-right">
                      <span className="text-2xl">🐘</span>
                      <div><p className="text-sm font-bold text-white">Laravel</p><p className="text-[10px] text-gray-400">PHP</p></div>
                    </button>
                    <button onClick={() => handleFrameworkSelect("Django")} className="flex items-center gap-3 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all text-right">
                      <span className="text-2xl">🐍</span>
                      <div><p className="text-sm font-bold text-white">Django</p><p className="text-[10px] text-gray-400">Python</p></div>
                    </button>
                    <button onClick={() => handleFrameworkSelect("React")} className="flex items-center gap-3 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all text-right">
                      <span className="text-2xl">⚛️</span>
                      <div><p className="text-sm font-bold text-white">React</p><p className="text-[10px] text-gray-400">فرانت‌اند</p></div>
                    </button>
                    <button onClick={() => handleFrameworkSelect("Static")} className="flex items-center gap-3 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all text-right">
                      <span className="text-2xl">📄</span>
                      <div><p className="text-sm font-bold text-white">Static</p><p className="text-[10px] text-gray-400">HTML/CSS</p></div>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleFrameworkSelect("PostgreSQL")} className="flex items-center gap-3 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all text-right">
                      <span className="text-2xl">🐘</span>
                      <div><p className="text-sm font-bold text-white">PostgreSQL</p><p className="text-[10px] text-gray-400">رابطه‌ای</p></div>
                    </button>
                    <button onClick={() => handleFrameworkSelect("MySQL")} className="flex items-center gap-3 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all text-right">
                      <span className="text-2xl">🐬</span>
                      <div><p className="text-sm font-bold text-white">MySQL</p><p className="text-[10px] text-gray-400">محبوب</p></div>
                    </button>
                    <button onClick={() => handleFrameworkSelect("MongoDB")} className="flex items-center gap-3 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all text-right">
                      <span className="text-2xl">🍃</span>
                      <div><p className="text-sm font-bold text-white">MongoDB</p><p className="text-[10px] text-gray-400">NoSQL</p></div>
                    </button>
                    <button onClick={() => handleFrameworkSelect("Redis")} className="flex items-center gap-3 bg-[#0F172A] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all text-right">
                      <span className="text-2xl">🔴</span>
                      <div><p className="text-sm font-bold text-white">Redis</p><p className="text-[10px] text-gray-400">کش</p></div>
                    </button>
                  </>
                )}
              </div>
            )}

            {wizardStep === 2 && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {["پایه", "نقره‌ای", "طلایی"].map((tier) => {
                    const isSelected = selectedTier === tier;
                    const plans = wizardType === "app" ? APP_PLANS : DB_PLANS;
                    const samplePlan = plans.find((p) => p.tier === tier);
                    if (!samplePlan) return null;
                    
                    return (
                      <button
                        key={tier}
                        onClick={() => handleTierSelect(tier)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                          isSelected 
                            ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]" 
                            : "bg-[#0F172A] border-white/5 hover:bg-white/5"
                        }`}
                      >
                        <span className="text-2xl mb-2">
                          {tier === "پایه" ? "💠" : tier === "نقره‌ای" ? "🥈" : "🥇"}
                        </span>
                        <span className={`text-sm font-bold ${
                          isSelected ? "text-cyan-400" : "text-white"
                        }`}>
                          {tier}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {samplePlan.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedPlan && (
                  <div className="bg-[#0B1120] border border-cyan-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{selectedPlan.name}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                          selectedPlan.tier === "پایه" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                          selectedPlan.tier === "نقره‌ای" ? "bg-gray-500/20 text-gray-300 border-gray-500/30" :
                          "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}>
                          {selectedPlan.tier === "پایه" ? "💠" : selectedPlan.tier === "نقره‌ای" ? "🥈" : "🥇"} {selectedPlan.tier}
                        </span>
                        {selectedPlan.recommended && <span className="text-[9px] bg-cyan-500 text-black px-2 py-0.5 rounded-full font-bold">پیشنهادی</span>}
                      </div>
                      <span className="text-lg font-bold text-cyan-400">
                        {selectedPlan.price.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">تومان / ماه</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex flex-col items-center bg-[#070B14]/50 p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] text-gray-500 font-bold">CPU</span>
                        <span className="text-xs text-gray-200 font-mono">{selectedPlan.cpu}</span>
                      </div>
                      <div className="flex flex-col items-center bg-[#070B14]/50 p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] text-gray-500 font-bold">RAM</span>
                        <span className="text-xs text-gray-200 font-mono">{selectedPlan.ram}</span>
                      </div>
                      <div className="flex flex-col items-center bg-[#070B14]/50 p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] text-gray-500 font-bold">Disk</span>
                        <span className="text-xs text-gray-200 font-mono">{selectedPlan.disk}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {selectedPlan.pros.map((p, i) => <span key={i} className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">✓ {p}</span>)}
                      {selectedPlan.cons.map((c, i) => <span key={i} className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">⚠ {c}</span>)}
                    </div>

                    <div className="mb-4">
                      <label className="text-[10px] text-gray-400 mb-1 block">تغییر سیاره در این سطح:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(wizardType === "app" ? APP_PLANS : DB_PLANS)
                          .filter(p => p.tier === selectedPlan.tier)
                          .map(p => (
                            <button
                              key={p.id}
                              onClick={() => handlePlanChange(p.id)}
                              className={`text-[10px] px-2.5 py-1 rounded-md border transition-all ${
                                selectedPlan.id === p.id
                                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                                  : "bg-[#070B14] border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200"
                              }`}
                            >
                              {p.name}
                            </button>
                          ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => setWizardStep(3)}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-cyan-500/20"
                    >
                      ادامه و تأیید نهایی
                    </button>
                  </div>
                )}
              </div>
            )}

            {wizardStep === 3 && selectedPlan && (
              <div className="p-5">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <p className="text-sm font-bold text-amber-200">تأیید پرداخت</p>
                  </div>
                  <p className="text-[11px] text-amber-500/70 leading-relaxed">
                    شما در حال انتخاب پلن <strong className="text-amber-300">{selectedPlan.name} ({selectedPlan.tier})</strong> برای {wizardType === "app" ? "اپلیکیشن" : "دیتابیس"} <strong className="text-amber-300">{wizardFramework}</strong> هستید. هزینه ماهانه: <strong className="text-amber-300">{selectedPlan.price.toLocaleString()} تومان</strong>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleFinalConfirm} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm">
                    تأیید و پرداخت
                  </button>
                  <button onClick={() => setWizardStep(2)} className="px-5 py-3 bg-transparent border border-white/10 text-gray-400 rounded-xl hover:bg-white/5 transition-all text-sm">
                    بازگشت
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
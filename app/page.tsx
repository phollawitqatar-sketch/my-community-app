"use client";
import { useState, useEffect } from "react";

// สีและสไตล์ของ Badge สถานะความเร่งด่วน
const PRIORITY_BADGES: any = {
  p1: { label: "เร่งด่วนมาก", color: "text-red-600 bg-red-50 border-red-100" },
  p3: { label: "ปานกลาง", color: "text-blue-600 bg-blue-50 border-blue-100" },
  p4: { label: "ทั่วไป", color: "text-gray-500 bg-gray-50 border-gray-100" },
};

// สีและสไตล์ของหมวดหมู่ข่าวสาร
const NEWS_CATEGORIES: any = {
  news: { label: "ข่าวสารทั่วไป", color: "bg-cyan-50 text-cyan-700 border-cyan-100", icon: "📢" },
  warning: { label: "แจ้งเตือนภัย ด่วน!", color: "bg-red-50 text-red-700 border-red-100", icon: "⚠️" },
  activity: { label: "กิจกรรมชุมชน", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: "📅" },
};

export default function Home() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [detail, setDetail] = useState("");
  const [success, setSuccess] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  // โหลดข้อมูลจาก API
  async function loadAllData() {
    try {
      const [resComplaints, resNews] = await Promise.all([
        fetch("/api/complaints"),
        fetch("/api/news")
      ]);
      const dataComplaints = await resComplaints.json();
      const dataNews = await resNews.json();
      setComplaints(Array.isArray(dataComplaints) ? dataComplaints : []);
      setNews(Array.isArray(dataNews) ? dataNews : []);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  // ฟังก์ชันส่งเรื่องร้องทุกข์
  async function handleSubmit() {
    if (!name || !topic || !detail) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนครับ");
      return;
    }
    try {
      await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, topic, detail }),
      });
      setSuccess(true);
      setName(""); 
      setTopic(""); 
      setDetail("");
      loadAllData();
      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      console.error("ส่งข้อมูลล้มเหลว:", error);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col font-sans">
      
      {/* 🔹 ส่วนหัวแอปดีไซน์พรีเมียม (Premium Navy Navbar) */}
      <nav className="bg-[#1e293b] text-white px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90">
            <div className="bg-cyan-500 p-2 rounded-xl text-white shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Community 67
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-300">
            <span className="text-cyan-400 border-b-2 border-cyan-400 pb-1 cursor-pointer">หน้าหลัก</span>
            <span className="hover:text-white transition-colors cursor-pointer">/</span>
            <span className="hover:text-white transition-colors cursor-pointer">แจ้งเรื่อง</span>
            <button className="text-slate-300 hover:text-white relative transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* บอดี้หลักของเว็บไซต์ */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-10">
        
        {/* 📢 SECTION 1: NEWS FEED (แถบหัวข้อสีน้ำเงินสดตามดีไซน์) */}
        <section className="bg-white border border-slate-200 rounded-[1.8rem] shadow-sm overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
            <h2 className="text-base font-black flex items-center gap-2">
              📢 กระดานข่าวสารและแจ้งเตือนชุมชน
            </h2>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              อัปเดตล่าสุด
            </span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                  📌 ยังไม่มีข่าวประกาศประชาสัมพันธ์ในขณะนี้
                </div>
              ) : (
                news.map((n) => {
                  const cat = NEWS_CATEGORIES[n.category] || NEWS_CATEGORIES.news;
                  
                  return (
                    <div key={n.id} className="bg-slate-50/60 border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between min-h-[200px] group">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-sm ${cat.color}`}>
                            {cat.icon} {cat.label}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">⏱️ {n.date || "ล่าสุด"}</span>
                        </div>
                        
                        {n.image && (
                          <div className="w-full h-32 rounded-xl overflow-hidden mb-3 border border-slate-100">
                            <img src={n.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                          </div>
                        )}

                        <h3 className="text-slate-900 text-base font-black leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {n.title}
                        </h3>
                        {n.detail && (
                          <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                            {n.detail}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-200/40 flex justify-between items-center text-[11px] text-slate-400 font-medium">
                        <span>โดย: เจ้าหน้าที่กลาง</span>
                        <span className="text-blue-500 group-hover:translate-x-1 transition-transform">อ่านต่อ →</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ✍️ SECTION 2: COMPLAINTS FORM & TRACKING */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* ฝั่งซ้าย: ฟอร์มแจ้งเรื่อง (แถบหัวข้อสีเขียวหัวเป็ด Teal) */}
          <section className="md:col-span-2 bg-white rounded-[1.8rem] border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="bg-teal-600 px-5 py-3.5 text-white">
              <h2 className="text-sm font-black flex items-center gap-2">
                ✍️ แจ้งเรื่องร้องทุกข์ใหม่
              </h2>
            </div>

            <div className="p-5 space-y-3.5">
              {success && (
                <div className="bg-emerald-50 text-emerald-700 rounded-xl p-3 text-xs font-semibold border border-emerald-100 animate-pulse">
                  🎉 ส่งเรื่องเข้าระบบสำเร็จแล้ว! เจ้าหน้าที่จะรีบตรวจสอบครับ
                </div>
              )}
              
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">ผู้แจ้งเรื่อง</label>
                <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" placeholder="ชื่อ-นามสกุล ของท่าน" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">ประเภทปัญหา</label>
                <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50 text-slate-700 outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
                  <option value="">-- เลือกประเภทปัญหาที่พบ --</option>
                  <option>ไฟไหม้ / ภัยพิบัติ</option>
                  <option>ความปลอดภัย / อาชญากรรม</option>
                  <option>ถนนชำรุด / ไฟฟ้าดับ / น้ำไม่ไหล</option>
                  <option>ขยะ / กลิ่นเหม็น / สิ่งแวดล้อม</option>
                  <option>ปัญหาอื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">รายละเอียดปัญหา</label>
                <textarea value={detail} onChange={e => setDetail(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs h-28 bg-slate-50/50 resize-none outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" placeholder="พิมพ์อธิบายสถานที่ และรายละเอียดปัญหา..." />
              </div>

              <button onClick={handleSubmit} className="w-full bg-[#1e293b] text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 active:scale-[0.99] transition-all text-center mt-2">
                🚀 ส่งเรื่องร้องทุกข์ให้ชุมชน
              </button>
            </div>
          </section>

          {/* ฝั่งขวา: รายการติดตามสถานะ (แถบหัวข้อสีเขียวมรกต Emerald) */}
          <section className="md:col-span-3 bg-white rounded-[1.8rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-emerald-600 px-5 py-3.5 text-white">
              <h2 className="text-sm font-black flex items-center gap-2">
                🔍 ติดตามสถานะการดำเนินการ
              </h2>
            </div>
            
            <div className="p-5 flex-1">
              {complaints.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs border-dashed border border-slate-200 rounded-2xl">
                  ยังไม่มีประวัติการแจ้งเรื่องร้องทุกข์ในระบบขณะนี้
                </div>
              ) : (
                <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                  {complaints.map((c) => {
                    const p = PRIORITY_BADGES[c.priority] || PRIORITY_BADGES.p4;
                    return (
                      <div key={c.id} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 shadow-sm text-xs flex justify-between items-start gap-4 hover:border-emerald-200 transition-all">
                        <div className="space-y-1.5 min-w-0">
                          <p className="font-black text-slate-800 text-sm flex items-center gap-1.5 truncate">
                            🎯 {c.topic}
                          </p>
                          <p className="text-slate-500 leading-relaxed line-clamp-2">{c.detail}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">ผู้แจ้ง: {c.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${p.color}`}>{p.label}</span>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0 flex flex-col justify-between h-full min-h-[55px]">
                          {c.status === "done" ? (
                            <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">✅ สำเร็จ</span>
                          ) : c.status === "received" ? (
                            <span className="text-blue-600 font-bold bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full text-[11px]">🔄 กำลังแก้</span>
                          ) : (
                            <span className="text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full text-[11px]">⏳ รอรับเรื่อง</span>
                          )}
                          <p className="text-[10px] text-slate-400 font-medium mt-auto">{c.date || "วันนี้"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PRIORITY: any = {
  p1: { label: "เร่งด่วนมาก", color: "bg-red-100 text-red-800", stripe: "bg-red-500" },
  p3: { label: "ปานกลาง", color: "bg-blue-100 text-blue-800", stripe: "bg-blue-500" },
  p4: { label: "ทั่วไป", color: "bg-gray-100 text-gray-600", stripe: "bg-gray-300" },
};

const NEWS_CATEGORIES: any = {
  news: { label: "📣 ข่าวสารทั่วไป", color: "bg-blue-50 text-blue-700 border-blue-100" },
  warning: { label: "⚠️ เตือนภัย ด่วน!", color: "bg-red-50 text-red-700 border-red-100" },
  activity: { label: "📅 กิจกรรมชุมชน", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
};

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "progress", label: "⏳ รอรับเรื่อง" },
  { key: "received", label: "🔄 กำลังแก้ไข" },
  { key: "done", label: "✅ เสร็จสิ้น" },
  { key: "p1", label: "🔴 เร่งด่วนมาก" },
  { key: "p3", label: "🔵 ปานกลาง" },
  { key: "p4", label: "⚪ ทั่วไป" },
];

const PIE_COLORS = ["#F59E0B", "#3B82F6", "#10B981"];
const BAR_COLORS = ["#EF4444", "#3B82F6", "#9CA3AF"];

export default function AdminPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  const [newsTitle, setNewsTitle] = useState("");
  const [newsDetail, setNewsDetail] = useState("");
  const [newsCategory, setNewsCategory] = useState("news");
  
  const [newsImage, setNewsImage] = useState<string | null>(null);
  const [newsImageUrl, setNewsImageUrl] = useState(""); 
  const [imageSourceType, setImageSourceType] = useState<"file" | "url">("url");

  const [newsSuccess, setNewsSuccess] = useState(false);
  const [showChart, setShowChart] = useState(false);

  // 🛠️ State สำหรับระบบขยายรูปภาพขนาดจริง (Image Preview Modal)
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);

  async function loadData() {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function handleNewsImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setNewsImage(reader.result as string); 
        setNewsImageUrl(""); 
      };
      reader.readAsDataURL(file);
    }
  }

  async function handlePostNews() {
    if (!newsTitle) {
      alert("กรุณากรอกหัวข้อข่าวสารด้วยครับ");
      return;
    }

    const finalImage = imageSourceType === "url" ? newsImageUrl : newsImage;

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newsTitle, detail: newsDetail, image: finalImage, category: newsCategory }),
      });
      if (res.ok) {
        setNewsSuccess(true);
        setNewsTitle(""); setNewsDetail(""); setNewsImage(null); setNewsImageUrl(""); setNewsCategory("news");
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        loadData();
        setTimeout(() => setNewsSuccess(false), 3000);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDeleteNews(id: string) {
    if (confirm("คุณแน่ใจใช่ไหมที่จะลบข่าวประกาศรายการนี้?")) {
      try {
        const res = await fetch(`/api/news?id=${id.toString()}`, { method: "DELETE" });
        if (res.ok) { loadData(); }
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function handleUpdate(id: string, updatedFields: { status?: string; priority?: string }) {
    try {
      const res = await fetch("/api/complaints", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedFields }),
      });
      if (res.ok) {
        setComplaints(prev => prev.map(c => (c.id === id ? { ...c, ...updatedFields } : c)));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("คุณแน่ใจใช่ไหมที่จะลบเรื่องร้องทุกข์รายการนี้?")) {
      try {
        const res = await fetch(`/api/complaints?id=${id}`, { method: "DELETE" });
        if (res.ok) { setComplaints(prev => prev.filter(c => c.id !== id)); }
      } catch (error) {
        console.error(error);
      }
    }
  }

  const filtered = complaints.filter(c => {
    if (filter === "all") return true;
    if (["p1","p3","p4"].includes(filter)) return c.priority === filter;
    return c.status === filter;
  });

  const total = complaints.length;
  const p1Count = complaints.filter(c => c.priority === "p1").length;
  const p3Count = complaints.filter(c => c.priority === "p3").length;
  const p4Count = complaints.filter(c => c.priority === "p4").length;
  const progressCount = complaints.filter(c => c.status === "progress").length;
  const receivedCount = complaints.filter(c => c.status === "received").length;
  const doneCount = complaints.filter(c => c.status === "done").length;

  function pct(n: number) { return total === 0 ? 0 : Math.round((n / total) * 100); }

  const pieData = [{ name: "รอรับเรื่อง", value: progressCount }, { name: "กำลังแก้ไข", value: receivedCount }, { name: "เสร็จสิ้น", value: doneCount }].filter(d => d.value > 0);
  const barData = [{ name: "เร่งด่วนมาก", จำนวน: p1Count }, { name: "ปานกลาง", จำนวน: p3Count }, { name: "ทั่วไป", จำนวน: p4Count }];
  const topicData = Object.entries(complaints.reduce((acc: any, c) => { acc[c.topic] = (acc[c.topic] || 0) + 1; return acc; }, {})).map(([name, จำนวน]) => ({ name, จำนวน }));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col font-sans">
      
      {/* ส่วนหัวแอปผู้ดูแลระบบดีไซน์พรีเมียม */}
      <nav className="bg-[#0f172a] text-white px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-500 p-2 rounded-xl text-white shadow-inner shadow-black/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight block bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Community Control
              </span>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block -mt-0.5">🔒 ระบบผู้ดูแลระบบ (Admin)</span>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            {total > 0 && (
              <button onClick={() => setShowChart(true)} className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:from-indigo-500 hover:to-indigo-600 transition-all active:scale-95">
                📊 ดูกราฟสรุปผล
              </button>
            )}
            <a href="/" className="text-xs font-bold text-slate-400 hover:text-white border border-slate-700 rounded-xl px-3 py-2 transition-colors">กลับหน้าแรก</a>
          </div>
        </div>
      </nav>

      {/* Modal กราฟสถิติ */}
      {showChart && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">📊 กราฟสรุปผลเรื่องร้องทุกข์ในระบบ</h2>
              <button onClick={() => setShowChart(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">● สัดส่วนตามสถานะ</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10} fontWeight="bold">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">● จำนวนตามระดับความสำคัญ</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} barSize={32}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: "medium" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="จำนวน" radius={[4,4,0,0]}>
                      {barData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 sm:col-span-2">
                <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">● จำนวนแยกตามประเภทปัญหาที่พบ</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topicData} barSize={36}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: "medium" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="จำนวน" fill="#3B82F6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <button onClick={() => setShowChart(false)} className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-3 rounded-xl transition-colors">ปิดหน้าต่างสถิติ</button>
          </div>
        </div>
      )}

      {/* 🛠️ ป๊อปอัปแสดงรูปขนาดจริง (Image Lightbox Modal) */}
      {activePreviewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-4" onClick={() => setActivePreviewImage(null)}>
          <div className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/40 w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer transition-colors text-lg shadow-md">✕</div>
          <div className="max-w-4xl max-h-[80vh] overflow-auto rounded-xl shadow-2xl bg-slate-900/40 p-2" onClick={(e) => e.stopPropagation()}>
            <img src={activePreviewImage} alt="รูปภาพขนาดจริง" className="max-w-full h-auto max-h-[75vh] object-contain rounded-lg mx-auto" />
          </div>
          <p className="text-white/70 text-xs font-semibold mt-3 bg-black/40 px-4 py-1.5 rounded-full">💡 แสดงรูปภาพตามสัดส่วนจริง (คลิกพื้นที่ว่างเพื่อปิด)</p>
        </div>
      )}

      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-10">
        
        {/* 📢 ส่วนลงประกาศข่าวสารชุมชน */}
        <section className="bg-white border border-slate-200 rounded-[1.8rem] shadow-sm overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
            <h2 className="text-base font-black flex items-center gap-2">
              📢 สร้างประกาศข่าวสารและแจ้งเตือนชุมชนใหม่
            </h2>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">ระบบแอดมิน</span>
          </div>

          <div className="p-6">
            {newsSuccess && (
              <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl text-xs font-semibold mb-4 border border-emerald-100 animate-pulse">
                🎉 ลงข้อมูลประกาศและส่งข่าวสารขึ้นหน้าแรกสําเร็จแล้ว!
              </div>
            )}
            
            <div className="grid gap-4 mb-5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">1. เลือกประเภทการประกาศข่าวสาร :</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button type="button" onClick={() => setNewsCategory("news")} className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${newsCategory === "news" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"}`}>📣 ข่าวสารประชาสัมพันธ์</button>
                  <button type="button" onClick={() => setNewsCategory("warning")} className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${newsCategory === "warning" ? "bg-red-600 text-white border-red-600 shadow-md" : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"}`}>⚠️ แจ้งเตือนภัย ด่วน!</button>
                  <button type="button" onClick={() => setNewsCategory("activity")} className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${newsCategory === "activity" ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"}`}>📅 กิจกรรมชุมชน</button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">2. หัวข้อประกาศ</label>
                <input value={newsTitle} onChange={e => setNewsTitle(e.target.value)} type="text" placeholder="พิมพ์ชื่อหัวข้อประกาศที่ต้องการแสดง..." className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50/50 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">3. เนื้อหาประกาศอย่างละเอียด (ระบุหรือไม่ก็ได้)</label>
                <textarea value={newsDetail} onChange={e => setNewsDetail(e.target.value)} placeholder="พิมพ์คำอธิบายรายละเอียดเพิ่มเติมเพื่อให้ชาวบ้านเข้าใจได้ชัดเจน..." className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs h-20 resize-none outline-none bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>

              {/* ส่วนเลือกใส่ ลิงก์ หรือ อัปโหลดไฟล์ */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-4 border-b pb-2 border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">4. รูปภาพประกอบข่าวสาร :</span>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1 font-semibold text-slate-600 cursor-pointer">
                      <input type="radio" checked={imageSourceType === "url"} onChange={() => setImageSourceType("url")} name="img_src" className="accent-blue-600" /> ใส่ลิงก์รูปภาพ (URL)
                    </label>
                    <label className="flex items-center gap-1 font-semibold text-slate-600 cursor-pointer">
                      <input type="radio" checked={imageSourceType === "file"} onChange={() => { setImageSourceType("file"); setNewsImageUrl(""); }} name="img_src" className="accent-blue-600" /> อัปโหลดไฟล์จากเครื่อง
                    </label>
                  </div>
                </div>

                {imageSourceType === "url" ? (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">วางลิงก์รูปภาพ (URL)</label>
                    <input value={newsImageUrl} onChange={e => { setNewsImageUrl(e.target.value); setNewsImage(null); }} type="text" placeholder="https://example.com/image.jpg" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-blue-500 transition-all" />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">เลือกไฟล์จากอุปกรณ์</label>
                    <input type="file" accept="image/*" onChange={handleNewsImageChange} className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300" />
                  </div>
                )}

                {/* กล่อง Preview รูปภาพที่เลือก/หรือลิงก์ที่วาง */}
                {((imageSourceType === "url" && newsImageUrl) || (imageSourceType === "file" && newsImage)) && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">👁️ ตัวอย่างรูปที่ใส่ (คลิกเพื่อดูขนาดใหญ่) :</p>
                    <div 
                      onClick={() => setActivePreviewImage(imageSourceType === "url" ? newsImageUrl : newsImage)}
                      className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white cursor-zoom-in group/item"
                    >
                      <img src={imageSourceType === "url" ? newsImageUrl : (newsImage || "")} alt="Preview" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" onError={(e)=>{ (e.target as HTMLImageElement).src="https://placehold.co/400x300?text=Invalid+URL"; }} />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/item:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">ขยายรูป 🔍</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button onClick={handlePostNews} className="bg-[#1e293b] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-slate-800 shadow-md transition-all active:scale-99">
              🚀 ยืนยันลงประกาศเรื่องนี้
            </button>

            {/* รายการประกาศข่าวสารปัจจุบัน */}
            {news.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider">📋 ประกาศที่เปิดแสดงอยู่บนหน้าเว็บขณะนี้ ({news.length}) <span className="text-blue-500 font-medium lowercase">(คลิกรูปเพื่อขยายขนาดจริง)</span></p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {news.map(n => {
                    const cat = NEWS_CATEGORIES[n.category] || NEWS_CATEGORIES.news;
                    return (
                      <div key={n.id} className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 aspect-[4/3] flex flex-col justify-between shadow-xs">
                        {n.image ? (
                          <div onClick={() => setActivePreviewImage(n.image)} className="w-full h-full overflow-hidden cursor-zoom-in relative group/img">
                            <img src={n.image} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform" alt="" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">คลิกดูขนาดจริง 🔍</div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-100/70 h-full flex items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-slate-500 line-clamp-2 leading-tight">{n.title}</span>
                          </div>
                        )}
                        <div className="p-2 bg-white border-t border-slate-100 relative z-10">
                          <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border mb-1 scale-90 origin-left ${cat.color}`}>{cat.label}</span>
                          <p className="text-[10px] font-bold text-slate-800 truncate">{n.title}</p>
                        </div>
                        <button onClick={() => handleDeleteNews(n.id)} className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] z-20 shadow-md sm:opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* แผงสถิติเรื่องร้องทุกข์ */}
        <section className="space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">📊 แผงควบคุมจำนวนสถิติเรื่องร้องทุกข์</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { key: "progress", label: "⏳ รอรับเรื่อง", count: progressCount, border: "hover:border-amber-400", active: "ring-2 ring-amber-500" },
              { key: "received", label: "🔄 กำลังแก้ไข", count: receivedCount, border: "hover:border-blue-400", active: "ring-2 ring-blue-500" },
              { key: "done", label: "✅ เสร็จสิ้น", count: doneCount, border: "hover:border-emerald-400", active: "ring-2 ring-emerald-500" },
              { key: "p1", label: "🔴 เร่งด่วนมาก", count: p1Count, border: "hover:border-red-400", active: "ring-2 ring-red-500" },
              { key: "p3", label: "🔵 ปานกลาง", count: p3Count, border: "hover:border-blue-400", active: "ring-2 ring-blue-400" },
              { key: "p4", label: "⚪ ทั่วไป", count: p4Count, border: "hover:border-slate-400", active: "ring-2 ring-slate-400" },
            ].map(s => (
              <div key={s.key} onClick={() => setFilter(s.key)} className={`bg-white border border-slate-200 rounded-xl py-3 px-2 text-center cursor-pointer transition-all select-none shadow-xs ${s.border} ${filter === s.key ? s.active : ""}`}>
                <p className="text-xl font-black text-slate-800">{s.count}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5 whitespace-nowrap">{s.label}</p>
                <p className="text-[9px] font-medium text-slate-400 mt-0.5">{pct(s.count)}% ของทั้งหมด</p>
              </div>
            ))}
          </div>
        </section>

        {/* ตารางจัดการเรื่องร้องทุกข์ */}
        <section className="bg-white border border-slate-200 rounded-[1.8rem] shadow-sm overflow-hidden">
          <div className="bg-emerald-600 px-6 py-4 text-white flex justify-between items-center">
            <h2 className="text-base font-black flex items-center gap-2">
              🔍 ตารางบริหารจัดการและอัปเดตเรื่องร้องทุกข์
            </h2>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm font-semibold">แสดงผล: {filtered.length} เรื่อง</span>
          </div>

          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex gap-2 flex-wrap items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">ตัวเลือกฟิลเตอร์:</span>
            {FILTERS.map(f => {
              const count = f.key === "all" ? total : f.key === "p1" ? p1Count : f.key === "p3" ? p3Count : f.key === "p4" ? p4Count : f.key === "progress" ? progressCount : f.key === "received" ? receivedCount : doneCount;
              return (
                <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${filter === f.key ? "bg-[#1e293b] text-white border-slate-800 shadow-xs" : "bg-white text-slate-600 border-slate-200/70 hover:bg-slate-50"}`}>
                  {f.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-10 text-center text-slate-400 text-xs font-medium animate-pulse">⏳ กำลังเชื่อมต่อข้อมูลระบบหลังบ้าน...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs font-medium">📥 ไม่มีรายการเรื่องร้องทุกข์ในหมวดหมู่ที่เลือกขณะนี้</div>
            ) : (
              filtered.map(c => {
                const p = PRIORITY[c.priority] || PRIORITY.p4;
                return (
                  <div key={c.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start justify-between hover:bg-slate-50/40 transition-colors">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-1 self-stretch rounded-full shrink-0 ${p.stripe}`}></div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-sm text-slate-800 truncate">🎯 {c.topic}</p>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">ผู้แจ้ง: {c.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed bg-white border border-slate-200/60 p-2.5 rounded-xl mt-1">{c.detail}</p>
                        <p className="text-[10px] text-slate-400 font-medium pt-0.5">หมวดหมู่ระบบ: แจ้งเรื่องร้องทุกข์ · วันที่ส่ง: {c.date || "วันนี้"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto justify-end">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase text-center">ระดับปัญญา</span>
                        <select value={c.priority} onChange={e => handleUpdate(c.id, { priority: e.target.value })} className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 outline-none focus:border-emerald-500">
                          <option value="p1">🔴 เร่งด่วนมาก</option>
                          <option value="p3">🔵 ปานกลาง</option>
                          <option value="p4">⚪ ทั่วไป</option>
                        </select>
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase text-center">สถานะงาน</span>
                        <select value={c.status} onChange={e => handleUpdate(c.id, { status: e.target.value })} className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 outline-none focus:border-emerald-500">
                          <option value="progress">⏳ รอรับเรื่อง</option>
                          <option value="received">🔄 กำลังแก้ไข</option>
                          <option value="done">✅ เสร็จสิ้น</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase text-center">จัดการ</span>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-100 text-xs font-bold transition-all active:scale-95 shadow-2xs" title="ลบรายการ">
                          🗑️ ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
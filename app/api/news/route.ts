import { NextRequest, NextResponse } from "next/server";

let newsList: any[] = [];

export async function GET() {
  return NextResponse.json(newsList);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.title) {
      return NextResponse.json({ error: "กรุณาใส่หัวข้อข่าวสาร" }, { status: 400 });
    }

    const newNews = {
      id: Date.now().toString(),
      title: body.title,
      detail: body.detail || "",
      image: body.image || null,
      category: body.category || "news", // 🛠️ เพิ่มฟิลด์ประเภทข่าว (ค่าเริ่มต้นเป็น news)
      date: new Date().toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };

    newsList.unshift(newNews);
    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "กรุณาระบุ ID ข่าวที่ต้องการลบ" }, { status: 400 });
    }

    newsList = newsList.filter(n => n.id !== id.toString());
    return NextResponse.json({ message: "ลบประกาศข่าวสารเรียบร้อยแล้ว" });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
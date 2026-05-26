import { NextRequest, NextResponse } from "next/server";

let eventList: any[] = [];

export async function GET() {
  // ส่งข้อมูลกิจกรรมโดยเรียงตามวันที่จัดงาน (เก่าไปใหม่ หรือกิจกรรมที่ใกล้จะถึงขึ้นก่อน)
  const sortedEvents = [...eventList].sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
  return NextResponse.json(sortedEvents);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.title || !body.date) {
      return NextResponse.json({ error: "กรุณากรอกชื่อกิจกรรมและวันที่ให้ครบถ้วน" }, { status: 400 });
    }

    const newEvent = {
      id: Date.now().toString(),
      title: body.title,
      location: body.location || "ชุมชนของเรา",
      rawDate: body.date, // เอาไว้ใช้สำหรับ Sort วันที่
      time: body.time || "ตลอดทั้งวัน",
      date: new Date(body.date).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };

    eventList.push(newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "กรุณาระบุ ID กิจกรรมที่ต้องการลบ" }, { status: 400 });
    }

    eventList = eventList.filter(e => e.id !== id.toString());
    return NextResponse.json({ message: "ลบกิจกรรมเรียบร้อยแล้ว" });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
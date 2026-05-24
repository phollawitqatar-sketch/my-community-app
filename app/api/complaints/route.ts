import { NextRequest, NextResponse } from "next/server";

// ตัวแปรเก็บข้อมูลเรื่องร้องทุกข์ชั่วคราวบนแรมเซิร์ฟเวอร์
let complaints: any[] = [];

// [GET] ดึงรายการเรื่องร้องทุกข์ทั้งหมดไปแสดงผล
export async function GET() {
  return NextResponse.json(complaints);
}

// [POST] รับเรื่องร้องทุกข์ใหม่ที่ชาวบ้านส่งมาจากหน้าแรก
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // ตรวจสอบความครบถ้วนของข้อมูล
    if (!body.name || !body.topic || !body.detail) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const newComplaint = {
      id: (complaints.length + 1).toString(), 
      name: body.name,
      topic: body.topic,
      detail: body.detail,
      image: body.image || null,
      date: new Date().toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      status: "progress", // สถานะเริ่มต้น: รอรับเรื่อง
      // จัดระดับความสำคัญอัตโนมัติตามประเภทเรื่อง
      priority: body.topic === "ไฟไหม้ / ภัยพิบัติ" || body.topic === "ความปลอดภัย" ? "p1" : "p3",
    };

    complaints.unshift(newComplaint); // เอาเรื่องใหม่ล่าสุดขึ้นก่อน
    return NextResponse.json(newComplaint, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }, { status: 500 });
  }
}

// [PUT] อัปเดตสถานะ หรือ ระดับความสำคัญ (แอดมินสั่งเปลี่ยนจากหน้าหลังบ้าน)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, priority } = body;

    const complaintIndex = complaints.findIndex(c => c.id === id.toString());
    if (complaintIndex === -1) {
      return NextResponse.json({ error: "ไม่พบรายการที่ระบุ" }, { status: 404 });
    }

    // อัปเดตเฉพาะค่าที่ส่งมา
    if (status) complaints[complaintIndex].status = status;
    if (priority) complaints[complaintIndex].priority = priority;

    return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ", data: complaints[complaintIndex] });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

// [DELETE] ลบเรื่องร้องทุกข์ออกจากระบบตาม ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // รับค่า id จาก URL เช่น /api/complaints?id=1

    if (!id) {
      return NextResponse.json({ error: "กรุณาระบุ ID ที่ต้องการลบ" }, { status: 400 });
    }

    // กรองเอาเฉพาะรายการที่ ID ไม่ตรงกับตัวที่ส่งมา (เป็นการลบตัวนั้นทิ้ง)
    complaints = complaints.filter(c => c.id !== id.toString());

    return NextResponse.json({ message: "ลบเรื่องร้องทุกข์เรียบร้อยแล้ว" });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
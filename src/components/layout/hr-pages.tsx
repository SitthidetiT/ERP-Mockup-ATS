"use client";

import { useState } from "react";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
const employees = [
  ["EMP-001", "K. Narin", "Sales", "Sales Executive", "ACTIVE"],
  ["EMP-002", "K. Somchai", "Engineering", "Design Engineer", "ACTIVE"],
  ["EMP-003", "K. Preecha", "Drafting", "CAD Designer", "ACTIVE"],
  ["EMP-004", "K. Anan", "Planning", "Production Planner", "ACTIVE"],
  ["EMP-005", "K. Malee", "Purchasing", "Purchasing Officer", "ACTIVE"],
  ["EMP-006", "K. Chai", "Production", "Production Supervisor", "ACTIVE"],
  ["EMP-007", "K. Woranuch", "Quality", "QC Inspector", "ACTIVE"],
  ["EMP-008", "K. Siriporn", "Human Resources", "HR Officer", "ACTIVE"],
] as const;
const attendance = [
  ["K. Narin", "08:12", "17:35", "ปกติ"],
  ["K. Somchai", "07:58", "17:42", "ปกติ"],
  ["K. Preecha", "08:31", "17:30", "สาย 31 นาที"],
  ["K. Chai", "07:45", "18:10", "OT 1 ชม."],
  ["K. Woranuch", "08:03", "17:40", "ปกติ"],
] as const;
const initialLeaves = [
  {
    id: "LV-2026-0081",
    employee: "K. Preecha",
    type: "ลากิจ",
    range: "28 Sep 2026",
    days: 1,
    status: "PENDING" as LeaveStatus,
  },
  {
    id: "LV-2026-0080",
    employee: "K. Malee",
    type: "ลาพักร้อน",
    range: "1–2 Oct 2026",
    days: 2,
    status: "APPROVED" as LeaveStatus,
  },
  {
    id: "LV-2026-0079",
    employee: "K. Ton",
    type: "ลาป่วย",
    range: "25 Sep 2026",
    days: 1,
    status: "APPROVED" as LeaveStatus,
  },
];

function StatusTag({ status }: { status: string }) {
  const tone =
    status === "APPROVED" || status === "ACTIVE"
      ? "success"
      : status === "REJECTED"
        ? "danger"
        : "warning";
  return <span className={`badge ${tone}`}>{status}</span>;
}

export function HrWorkspace() {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [notice, setNotice] = useState("");
  const updateLeave = (id: string, status: LeaveStatus) => {
    const request = leaves.find((item) => item.id === id);
    setLeaves((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setNotice(
      `${request?.id} · ${request?.employee} เปลี่ยนสถานะเป็น ${status}`,
    );
  };
  return (
    <>
      <div className="page-header">
        <div>
          <h1>ทรัพยากรบุคคล</h1>
          <p>ข้อมูลพนักงาน, Attendance, Leave Request และการอนุมัติ</p>
        </div>
      </div>
      {notice && (
        <div className="hr-notice" role="status">
          ✓ {notice}
          <button onClick={() => setNotice("")}>ปิด</button>
        </div>
      )}
      <section className="kpis">
        <div className="kpi blue">
          <span>พนักงานทั้งหมด</span>
          <strong>{employees.length}</strong>
          <small>Active employees</small>
        </div>
        <div className="kpi green">
          <span>เข้างานวันนี้</span>
          <strong>{attendance.length}</strong>
          <small>บันทึกเวลาแล้ว</small>
        </div>
        <div className="kpi purple">
          <span>คำขอลารออนุมัติ</span>
          <strong>
            {leaves.filter((item) => item.status === "PENDING").length}
          </strong>
          <small>รอ HR ดำเนินการ</small>
        </div>
        <div className="kpi red">
          <span>มาสายวันนี้</span>
          <strong>1</strong>
          <small>K. Preecha · 31 นาที</small>
        </div>
      </section>
      <div className="detail-grid hr-grid">
        <section className="panel table-panel">
          <div className="panel-head">
            <div>
              <h3>ทะเบียนพนักงาน</h3>
              <span>Employee master data</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อ</th>
                <th>แผนก</th>
                <th>ตำแหน่ง</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee[0]}>
                  <td className="table-main">{employee[0]}</td>
                  <td>{employee[1]}</td>
                  <td>{employee[2]}</td>
                  <td>{employee[3]}</td>
                  <td>
                    <StatusTag status={employee[4]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="panel table-panel">
          <div className="panel-head">
            <div>
              <h3>เวลาทำงานวันนี้</h3>
              <span>26 Sep 2026</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>พนักงาน</th>
                <th>เข้า</th>
                <th>ออก</th>
                <th>ผล</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record[0]}>
                  <td>{record[0]}</td>
                  <td>{record[1]}</td>
                  <td>{record[2]}</td>
                  <td>{record[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <section className="panel table-panel hr-leave">
        <div className="panel-head">
          <div>
            <h3>คำขอลา</h3>
            <span>Leave approval queue</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>เลขที่</th>
              <th>พนักงาน</th>
              <th>ประเภท</th>
              <th>วันที่</th>
              <th>จำนวน</th>
              <th>สถานะ</th>
              <th>ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td className="table-main">{leave.id}</td>
                <td>{leave.employee}</td>
                <td>{leave.type}</td>
                <td>{leave.range}</td>
                <td>{leave.days} วัน</td>
                <td>
                  <StatusTag status={leave.status} />
                </td>
                <td>
                  {leave.status === "PENDING" ? (
                    <div className="head-actions">
                      <button onClick={() => updateLeave(leave.id, "REJECTED")}>
                        ไม่อนุมัติ
                      </button>
                      <button
                        className="primary"
                        onClick={() => updateLeave(leave.id, "APPROVED")}
                      >
                        อนุมัติ
                      </button>
                    </div>
                  ) : (
                    <span className="muted">ดำเนินการแล้ว</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

import { TeacherShell } from "@/components/layout/teacher-shell";
import { Badge } from "@/components/ui/badge";
import { students } from "@/lib/mock-data";

export default function TeacherProgressPage() {
  return (
    <TeacherShell>
      <div className="space-y-5">
        <div>
          <Badge tone="neutral">阶段进度</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ivory">进度记录</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            第一版使用 1-5 级维度记录，避免过早引入复杂算法。
          </p>
        </div>

        <div className="liuxiang-panel overflow-x-auto rounded-lg">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-muted">
              <tr className="border-b border-ivory/10">
                <th className="px-4 py-3 font-medium">学生</th>
                <th className="px-4 py-3 font-medium">视唱音准</th>
                <th className="px-4 py-3 font-medium">练耳单音</th>
                <th className="px-4 py-3 font-medium">练耳音程</th>
                <th className="px-4 py-3 font-medium">练耳和弦</th>
                <th className="px-4 py-3 font-medium">乐理</th>
                <th className="px-4 py-3 font-medium">当前重点</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-ivory/10">
                  <td className="px-4 py-4 font-medium text-ivory">{student.name}</td>
                  <td className="px-4 py-4 text-muted">{student.sightLevel}</td>
                  <td className="px-4 py-4 text-muted">{student.earLevel}</td>
                  <td className="px-4 py-4 text-muted">{student.earLevel}</td>
                  <td className="px-4 py-4 text-muted">{Math.max(1, student.earLevel - 1)}</td>
                  <td className="px-4 py-4 text-muted">{student.theoryLevel}，预留</td>
                  <td className="px-4 py-4 text-muted">{student.currentFocus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TeacherShell>
  );
}

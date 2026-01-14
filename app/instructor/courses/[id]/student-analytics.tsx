'use client'

import { format } from 'date-fns'

interface Student {
    id: string
    name: string
    email: string
    enrolledAt: string
    lastActive: string | null
    progress: number
}

export default function StudentAnalytics({ students }: { students: Student[] }) {
    return (
        <div className="rounded-2xl glass border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-white">Student Progress</h2>
                <p className="text-sm text-slate-400">Track student engagement and performance</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900/50 text-xs uppercase font-medium text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Enrolled</th>
                            <th className="px-6 py-4">Progress</th>
                            <th className="px-6 py-4">Last Active</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{student.name}</div>
                                        <div className="text-xs text-slate-500">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {format(new Date(student.enrolledAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 w-24 bg-slate-800 rounded-full h-1.5">
                                                <div
                                                    className="bg-indigo-500 h-1.5 rounded-full"
                                                    style={{ width: `${student.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-white">{student.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {student.lastActive
                                            ? format(new Date(student.lastActive), 'MMM d, yyyy')
                                            : <span className="text-slate-600 italic">No activity</span>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    No students enrolled yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

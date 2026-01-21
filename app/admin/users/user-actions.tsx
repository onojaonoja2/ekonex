'use client'

import { useState } from 'react'
import { MoreHorizontal, Shield, Trash2, Ban, CheckCircle, GraduationCap } from 'lucide-react'
import { toggleUserStatus, deleteUser, enrollUserInCourse } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function UserActions({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSuspend = async () => {
        setIsLoading(true)
        const result = await toggleUserStatus(user.id, user.status || 'active')
        setIsLoading(false)
        setIsOpen(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`User ${user.status === 'active' ? 'suspended' : 'activated'} successfully`)
            router.refresh()
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
        setIsLoading(true)
        const result = await deleteUser(user.id)
        setIsLoading(false)
        setIsOpen(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('User deleted successfully')
            router.refresh()
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            >
                <MoreHorizontal size={20} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                        <button
                            onClick={handleSuspend}
                            disabled={isLoading}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                        >
                            {user.status === 'suspended' ? <CheckCircle size={16} className="text-emerald-500" /> : <Ban size={16} className="text-yellow-500" />}
                            {user.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-slate-800"
                        >
                            <Trash2 size={16} />
                            Delete User
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

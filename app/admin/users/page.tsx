import { createClient } from '@/utils/supabase/server'
import { MoreHorizontal, User, Shield, Building } from 'lucide-react'

import CreateUserForm from './create-user-form'
import UserActions from './user-actions'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from('profiles')
        .select(`
            *,
            organizations (name)
        `)
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <CreateUserForm />
            </div>

            <div className="glass rounded-2xl overflow-hidden border border-slate-800">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900/50 text-slate-200 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Organization</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {users?.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                            {user.avatar_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={user.avatar_url} alt={user.full_name || ''} className="h-full w-full object-cover" />
                                            ) : (
                                                <User size={20} className="text-slate-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{user.full_name || 'No Name'}</div>
                                            <div className="text-xs text-slate-500">{user.email || 'No Email'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'system_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        user.role === 'instructor' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            user.role === 'sub_admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                        {user.role === 'system_admin' && <Shield size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status === 'suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        }`}>
                                        {user.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.organizations ? (
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Building size={14} />
                                            {(user.organizations as any).name}
                                        </div>
                                    ) : (
                                        <span className="text-slate-600 italic">None</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <UserActions user={user} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!users?.length && (
                    <div className="p-8 text-center text-slate-500">No users found.</div>
                )}
            </div>
        </div>
    )
}


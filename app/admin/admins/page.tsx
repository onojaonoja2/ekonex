import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Shield, User } from 'lucide-react'
import CreateUserForm from '../users/create-user-form'
import UserActions from '../users/user-actions'

export default async function AdminManagementPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Double check role
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'system_admin') {
        redirect('/admin')
    }

    const { data: admins } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['system_admin', 'sub_admin'])
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Management</h1>
                    <p className="text-slate-400">Manage system administrators and sub-admins</p>
                </div>
                <CreateUserForm />
            </div>

            <div className="glass rounded-2xl overflow-hidden border border-slate-800">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900/50 text-slate-200 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Admin</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {admins?.map((admin) => (
                            <tr key={admin.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                            {admin.avatar_url ? (
                                                <img src={admin.avatar_url} alt={admin.full_name || ''} className="h-full w-full object-cover" />
                                            ) : (
                                                <User size={20} className="text-slate-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{admin.full_name || 'No Name'}</div>
                                            <div className="text-xs text-slate-500">{admin.email || 'No Email'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${admin.role === 'system_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                        <Shield size={12} />
                                        {admin.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${admin.status === 'suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        }`}>
                                        {admin.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {/* Only show actions if target is NOT system admin (safety check, tho backend policies enforce it too) */}
                                    {admin.role !== 'system_admin' && (
                                        <UserActions user={admin} />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

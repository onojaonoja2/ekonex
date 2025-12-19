import { createClient } from '@/utils/supabase/server'
import { MoreHorizontal, Building2, Plus } from 'lucide-react'

export default async function AdminOrganizationsPage() {
    const supabase = await createClient()

    const { data: orgs } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Organizations</h1>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Plus size={18} />
                    New Organization
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orgs?.map((org) => (
                    <div key={org.id} className="glass p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-colors group relative">
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-slate-400 hover:text-white">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4 text-indigo-400">
                            <Building2 size={24} />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{org.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                            <span className="capitalize px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                                {org.subscription_tier} Plan
                            </span>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
                            <span className="text-slate-500">Created {new Date(org.created_at).toLocaleDateString()}</span>
                            <span className="text-indigo-400 font-medium cursor-pointer hover:underline">Manage Members</span>
                        </div>
                    </div>
                ))}
            </div>
            {!orgs?.length && (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed">
                    <h3 className="text-lg font-medium text-slate-300">No organizations yet</h3>
                    <p className="text-slate-500 mt-2">Create your first organization to get started.</p>
                </div>
            )}
        </div>
    )
}

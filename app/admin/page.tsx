export default function AdminDashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Users</h3>
                    <p className="text-4xl font-bold text-white">--</p>
                </div>
                <div className="glass p-6 rounded-2xl">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Organizations</h3>
                    <p className="text-4xl font-bold text-white">--</p>
                </div>
                <div className="glass p-6 rounded-2xl">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Active Courses</h3>
                    <p className="text-4xl font-bold text-white">--</p>
                </div>
            </div>

            <div className="mt-8 p-8 glass rounded-2xl text-center text-slate-500">
                select a menu item to manage resources
            </div>
        </div>
    )
}

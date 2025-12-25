'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CoverImageUpload({
    courseId,
    url
}: {
    courseId: string
    url: string | null
}) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) return

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${courseId}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('course-covers')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('course-covers')
                .getPublicUrl(filePath)

            // Update course record
            const { error: updateError } = await supabase
                .from('courses')
                .update({
                    cover_image: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', courseId)

            if (updateError) throw updateError

            toast.success('Cover image updated!')
            router.refresh()
        } catch (error: any) {
            toast.error('Error: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="relative group w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-dashed border-slate-800 hover:border-indigo-500/50 transition-all">
            {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="Cover" className="w-full h-full object-cover" />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                    <span className="text-sm font-medium">Upload Cover Image</span>
                </div>
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors">
                    {uploading ? 'Uploading...' : 'Change Cover'}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            </div>
        </div>
    )
}

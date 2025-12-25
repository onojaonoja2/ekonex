'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import RichEditor, { ContentBlock } from '@/components/rich-editor'

export default function LessonEditorForm({ lesson }: { lesson: any }) {
    const [title, setTitle] = useState(lesson.title)
    const [blocks, setBlocks] = useState<ContentBlock[]>(lesson.content_blocks || [])
    const [saving, setSaving] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSave = async () => {
        try {
            setSaving(true)
            const { error } = await supabase
                .from('lessons')
                .update({
                    title,
                    content_blocks: blocks,
                    updated_at: new Date().toISOString()
                })
                .eq('id', lesson.id)

            if (error) throw error
            toast.success('Lesson saved!')
            router.refresh()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-400">Lesson Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-200 outline-none focus:border-indigo-500"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Content</label>
                <RichEditor initialBlocks={blocks} onChange={setBlocks} />
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}

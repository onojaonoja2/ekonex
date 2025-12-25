'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export type ContentBlock = {
    id: string
    type: 'text' | 'image' | 'code' | 'pdf' | 'slides'
    content: string
    meta?: any
}

export default function RichEditor({
    initialBlocks = [],
    onChange
}: {
    initialBlocks?: ContentBlock[]
    onChange: (blocks: ContentBlock[]) => void
}) {
    const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks)
    const supabase = createClient()

    const addBlock = (type: ContentBlock['type']) => {
        const newBlock: ContentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: '',
            meta: type === 'code' ? { language: 'javascript' } : undefined
        }
        const newBlocks = [...blocks, newBlock]
        setBlocks(newBlocks)
        onChange(newBlocks)
    }

    const updateBlock = (id: string, content: string, meta?: any) => {
        const newBlocks = blocks.map(b =>
            b.id === id ? { ...b, content, meta: { ...b.meta, ...meta } } : b
        )
        setBlocks(newBlocks)
        onChange(newBlocks)
    }

    const removeBlock = (id: string) => {
        const newBlocks = blocks.filter(b => b.id !== id)
        setBlocks(newBlocks)
        onChange(newBlocks)
    }

    const handleFileUpload = async (file: File, blockId: string) => {
        try {
            const fileExt = file.name.split('.').pop()
            const filePath = `${blockId}-${Math.random()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('course-content')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('course-content')
                .getPublicUrl(filePath)

            updateBlock(blockId, publicUrl)
            toast.success('File uploaded!')
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {blocks.map((block, index) => (
                    <div key={block.id} className="relative group p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => removeBlock(block.id)} className="text-red-400 hover:bg-red-500/10 p-1 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </button>
                        </div>

                        <div className="mb-2 uppercase text-xs font-bold text-slate-500 tracking-wider">
                            {block.type} Block
                        </div>

                        {block.type === 'text' && (
                            <textarea
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 min-h-[100px] focus:outline-none focus:border-indigo-500"
                                placeholder="Write markdown text here..."
                            />
                        )}

                        {block.type === 'code' && (
                            <div className="space-y-2">
                                <select
                                    value={block.meta?.language || 'javascript'}
                                    onChange={(e) => updateBlock(block.id, block.content, { language: e.target.value })}
                                    className="bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs text-slate-400"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="sql">SQL</option>
                                </select>
                                <textarea
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono text-sm min-h-[150px] focus:outline-none focus:border-indigo-500"
                                    placeholder="Paste code here..."
                                />
                            </div>
                        )}

                        {(block.type === 'image' || block.type === 'pdf') && (
                            <div className="space-y-2">
                                {block.content ? (
                                    <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                                        {block.type === 'image' ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={block.content} alt="Preview" className="max-h-64 object-contain mx-auto" />
                                        ) : (
                                            <div className="p-4 flex items-center justify-center gap-2 text-slate-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                                PDF Uploaded
                                            </div>
                                        )}
                                        <button
                                            onClick={() => updateBlock(block.id, '')}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded hover:bg-black/70"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
                                        <input
                                            type="file"
                                            accept={block.type === 'image' ? "image/*" : "application/pdf"}
                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], block.id)}
                                            className="hidden"
                                            id={`upload-${block.id}`}
                                        />
                                        <label htmlFor={`upload-${block.id}`} className="cursor-pointer flex flex-col items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                            <span className="text-sm font-medium text-slate-400">Upload {block.type === 'image' ? 'Image' : 'PDF'}</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}

                        {block.type === 'slides' && (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-400">Upload multiple images for a slide deck. (Separated by newlines in content for simplicity in this MVP)</p>
                                <textarea
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                    placeholder="Image URL 1&#10;Image URL 2&#10;Image URL 3"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono text-sm leading-relaxed"
                                />
                                {/* Could add multi-file uploader here but keeping it simple for now */}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
                <button onClick={() => addBlock('text')} className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700 transition-colors">+ Text</button>
                <button onClick={() => addBlock('image')} className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700 transition-colors">+ Image</button>
                <button onClick={() => addBlock('code')} className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700 transition-colors">+ Code</button>
                <button onClick={() => addBlock('pdf')} className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700 transition-colors">+ PDF</button>
                <button onClick={() => addBlock('slides')} className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700 transition-colors">+ Slides</button>
            </div>
        </div>
    )
}

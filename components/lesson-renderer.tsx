'use client'

import { ContentBlock } from '@/components/rich-editor'
import ReactMarkdown from 'react-markdown'
// Note: For syntax highlighting in code blocks, we might need a library like 'prismjs' or 'shiki'.
// For now, simple pre/code tags. 
import { useState } from 'react'

export default function LessonRenderer({ blocks }: { blocks: ContentBlock[] }) {
    if (!blocks || blocks.length === 0) {
        return <div className="text-slate-500 italic p-8 text-center">No content added yet.</div>
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 w-full">
            {blocks.map((block) => (
                <div key={block.id}>
                    {block.type === 'text' && (
                        <div className="prose prose-invert prose-lg max-w-none">
                            <ReactMarkdown>{block.content}</ReactMarkdown>
                        </div>
                    )}

                    {block.type === 'image' && block.content && (
                        <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={block.content} alt="Course Content" className="w-full h-auto max-h-[600px] object-contain" />
                        </div>
                    )}

                    {block.type === 'code' && (
                        <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#1e1e1e]">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                                <span className="text-xs font-mono text-slate-400">{block.meta?.language || 'Code'}</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(block.content)}
                                    className="text-xs text-slate-400 hover:text-white transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-200">
                                <code>{block.content}</code>
                            </pre>
                        </div>
                    )}

                    {block.type === 'pdf' && block.content && (
                        <div className="h-[600px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                            <iframe src={block.content} className="w-full h-full" />
                        </div>
                    )}

                    {block.type === 'slides' && block.content && (
                        <SlideViewer content={block.content} />
                    )}

                    {block.type === 'video' && block.content && (
                        <div className="rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video relative">
                            {/* Check if it's a raw file URL (upload) or an embeddable URL */}
                            {block.content.includes('supabase.co') || block.meta?.sourceType === 'upload' ? (
                                <video src={block.content} controls className="w-full h-full" />
                            ) : (
                                <iframe
                                    src={getEmbedUrl(block.content)}
                                    className="w-full h-full absolute inset-0"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

function SlideViewer({ content }: { content: string }) {
    // Assuming content is list of URLs separated by newlines
    const slides = content.split('\n').filter(url => url.trim().length > 0)
    const [currentSlide, setCurrentSlide] = useState(0)

    if (slides.length === 0) return null

    return (
        <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slides[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="w-full h-full object-contain" />

                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                        disabled={currentSlide === 0}
                        className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        &larr;
                    </button>
                    <button
                        onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                        disabled={currentSlide === slides.length - 1}
                        className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        &rarr;
                    </button>
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">{currentSlide + 1} / {slides.length}</span>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {slides.map((slide, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-16 w-24 flex-shrink-0 rounded-md overflow-hidden border-2 ${currentSlide === idx ? 'border-indigo-500' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slide} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    )
}

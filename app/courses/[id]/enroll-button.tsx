'use client'

import { useState } from 'react'
import AuthModal from '@/components/auth-modal'
import { enrollInCourse } from '@/app/courses/actions' // We need to verify if this action exists or needs to be passed

interface EnrollButtonProps {
    courseId: string
    isLoggedIn: boolean
    price: number
    enrollAction: (formData: FormData) => Promise<void> // Passing server action as prop
}

export default function EnrollButton({ courseId, isLoggedIn, price, enrollAction }: EnrollButtonProps) {
    const [showAuth, setShowAuth] = useState(false)

    const handleEnroll = async () => {
        if (!isLoggedIn) {
            setShowAuth(true)
            return
        }

        // If logged in, submit the form programmatically or just let the form wrap handle it.
        // But since we are inside a client component replacing the form logic, we might need to be careful.
        // Actually, best pattern is: Wrapper client component that conditionally prevents default form submission.
    }

    if (!isLoggedIn) {
        return (
            <>
                <button
                    onClick={() => setShowAuth(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02]"
                >
                    {price > 0 ? 'Buy Now' : 'Enroll for Free'}
                </button>
                <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} courseId={courseId} />
            </>
        )
    }

    // If logged in, standard form submission works, but we can wrap it for consistency or keep it simple.
    // The parent can render the form if logged in, or pass the action.
    // Let's use a form here for the logged in state.
    return (
        <form action={enrollAction}>
            <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02]"
            >
                {price > 0 ? 'Buy Now' : 'Enroll for Free'}
            </button>
        </form>
    )
}

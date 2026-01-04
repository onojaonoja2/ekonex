import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ClientPrintButton from './print-button'
import PrintStyles from './print-styles'
import { CertificateQRCode } from '@/components/certificate-qr'

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export default async function CertificatePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const supabase = await createClient()

    const { data: certificate } = await supabase
        .from('certificates')
        .select('*, courses(title, instructor_id), profiles(full_name)')
        .eq('id', id)
        .single()

    if (!certificate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
                <h1 className="text-2xl font-bold mb-4">Certificate Not Found</h1>
                <Link href="/student/dashboard" className="text-indigo-400 hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        )
    }

    // Fetch instructor name separately if needed or if relations are set up
    // Assuming course has instructor_id, we can fetch public profile of instructor
    const { data: instructor } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', certificate.courses.instructor_id)
        .single()

    // Determine Base URL (hardcoded or env)
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://ekonex.com' // Fallback
    const verificationUrl = `${origin}/certificates/${certificate.id}`

    return (
        <>
            <PrintStyles />
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 print:p-0 print:bg-white print:block print:overflow-hidden">
                <div className="w-full max-w-4xl bg-white text-slate-900 p-12 rounded-xl shadow-2xl border-8 border-double border-slate-200 aspect-[1.414/1] flex flex-col items-center text-center relative overflow-hidden print:shadow-none print:border-0 print:w-[297mm] print:h-[210mm] print:max-w-none print:rounded-none print:aspect-auto print:flex print:justify-between print:p-8 print:m-0 print:fixed print:top-0 print:left-0">

                    {/* Background decorative elements - Adjusted for print safety */}
                    <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-slate-300 rounded-tl-xl m-4 print:m-4"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-slate-300 rounded-tr-xl m-4 print:m-4"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-slate-300 rounded-bl-xl m-4 print:m-4"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-slate-300 rounded-br-xl m-4 print:m-4"></div>

                    <div className="mt-8 mb-6 z-10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Ekonex" className="h-14 w-auto opacity-80 grayscale mix-blend-multiply" />
                    </div>

                    <div className="z-10 flex-1 flex flex-col items-center justify-center w-full">
                        <h1 className="text-5xl font-serif font-bold text-slate-800 mb-2 uppercase tracking-widest print:text-5xl">Certificate</h1>
                        <h2 className="text-xl font-light text-slate-500 uppercase tracking-widest mb-10 print:mb-8">of Completion</h2>

                        <p className="text-lg text-slate-600 mb-2">This is to certify that</p>

                        <h3 className="text-4xl font-bold text-indigo-900 mb-8 font-serif italic border-b-2 border-slate-200 pb-2 px-12 inline-block min-w-[300px] print:text-4xl">
                            {certificate.profiles.full_name}
                        </h3>

                        <p className="text-lg text-slate-600 mb-4">Has successfully completed the course</p>

                        <h4 className="text-3xl font-bold text-slate-800 mb-8 max-w-2xl print:text-3xl">
                            {certificate.courses.title}
                        </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-8 w-full max-w-3xl mt-auto items-end z-10 px-8">
                        {/* QR Code Section */}
                        <div className="flex flex-col items-center justify-center">
                            <CertificateQRCode url={verificationUrl} />
                            <p className="text-[10px] text-slate-400 mt-2 text-center uppercase tracking-wider">Scan to Verify</p>
                        </div>

                        {/* Signatures */}
                        <div className="flex flex-col items-center col-span-2 flex-row justify-around gap-12">
                            <div className="flex flex-col items-center">
                                <div className="w-40 border-b border-slate-400 mb-2">
                                    <div className="h-10 w-full flex items-end justify-center pb-1">
                                        <span className="font-script text-xl text-slate-600">Ekonex Platform</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Platform</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-40 border-b border-slate-400 mb-2">
                                    <div className="h-10 w-full flex items-end justify-center pb-1">
                                        <span className="font-script text-xl text-slate-600">{instructor?.full_name || 'Instructor'}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Instructor</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono mt-8 w-full flex justify-between items-center px-8 z-10 print:mt-6">
                        <span>ID: {certificate.certificate_code}</span>
                        <span>{verificationUrl}</span>
                        <span>Issued: {formatDate(certificate.issued_at)}</span>
                    </div>

                </div>

                <div className="mt-8 flex gap-4 print:hidden">
                    <Link
                        href="/student/dashboard"
                        className="px-6 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                    <ClientPrintButton />
                </div>
            </div>
        </>
    )
}



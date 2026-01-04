'use client'

export default function PrintStyles() {
    return (
        <style jsx global>{`
            @media print {
                @page {
                    size: landscape;
                    margin: 0;
                }
                body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
            }
        `}</style>
    )
}

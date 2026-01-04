'use client'

import QRCode from 'react-qr-code'

interface CertificateQRCodeProps {
    url: string
}

export function CertificateQRCode({ url }: CertificateQRCodeProps) {
    return (
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 inline-block">
            <QRCode
                size={80}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={url}
                viewBox={`0 0 256 256`}
            />
        </div>
    )
}

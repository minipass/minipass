'use client'

import { CheckCircle, Volume2, VolumeX, XCircle } from 'lucide-react'
import QrScanner from 'qr-scanner'
import { useEffect, useRef, useState } from 'react'

import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface QRCodeReaderProps {
    validTicketIds: Set<string>
    onTicketScanned: (ticketId: string, isValid: boolean) => void
    onConsumeTicket: (ticketId: string) => Promise<void>
    eventName?: string
}

export default function QRCodeReader({
    validTicketIds,
    onTicketScanned,
    onConsumeTicket,
    eventName,
}: QRCodeReaderProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [lastScannedId, setLastScannedId] = useState<string | null>(null)
    const [scanResult, setScanResult] = useState<'valid' | 'invalid' | 'already-used' | null>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const qrScannerRef = useRef<QrScanner | null>(null)

    // Initialize the QR code reader
    useEffect(() => {
        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.destroy()
            }
        }
    }, [])

    const startScanning = async () => {
        if (!videoRef.current) return

        try {
            setError(null)
            setIsScanning(true)

            // Create new QR scanner instance
            qrScannerRef.current = new QrScanner(
                videoRef.current,
                result => {
                    handleQRCodeScanned(result.data)
                },
                {
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                },
            )

            await qrScannerRef.current.start()
        } catch (err) {
            console.error('Error starting camera:', err)
            setError('Erro ao acessar a câmera. Verifique as permissões.')
            setIsScanning(false)
        }
    }

    const stopScanning = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.destroy()
            qrScannerRef.current = null
        }
        setIsScanning(false)
    }

    const handleQRCodeScanned = async (scannedText: string) => {
        // Prevent duplicate scans of the same ticket
        if (lastScannedId === scannedText) return

        setLastScannedId(scannedText)

        // Check if it's a valid ticket ID
        const isValid = validTicketIds.has(scannedText)

        if (isValid) {
            setScanResult('valid')
            playSound('success')
            vibrate([200, 100, 200]) // Success pattern

            // Mark ticket as consumed
            try {
                await onConsumeTicket(scannedText)
                onTicketScanned(scannedText, true)
            } catch (error) {
                console.error('Error consuming ticket:', error)
                setScanResult('already-used')
                playSound('error')
                vibrate([100, 50, 100, 50, 100]) // Error pattern
            }
        } else {
            setScanResult('invalid')
            playSound('error')
            vibrate([100, 50, 100, 50, 100]) // Error pattern
            onTicketScanned(scannedText, false)
        }

        // Clear result after 3 seconds
        setTimeout(() => {
            setScanResult(null)
            setLastScannedId(null)
        }, 3000)
    }

    const playSound = (type: 'success' | 'error') => {
        if (isMuted) return

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        if (type === 'success') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        } else {
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1)
        }

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
    }

    const vibrate = (pattern: number[]) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">{eventName ? `Scanner - ${eventName}` : 'Scanner de Ingressos'}</h2>

                {/* Camera View */}
                <div className="relative">
                    <video ref={videoRef} className="w-full h-64 bg-black rounded-lg object-cover" playsInline muted />
                    {!isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                            <p className="text-white text-lg">Câmera não iniciada</p>
                        </div>
                    )}
                </div>

                {/* Scan Result */}
                {scanResult && (
                    <div className="flex items-center justify-center space-x-2">
                        {scanResult === 'valid' && (
                            <>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                <span className="text-green-500 font-semibold text-lg">Ingresso Válido!</span>
                            </>
                        )}
                        {scanResult === 'invalid' && (
                            <>
                                <XCircle className="h-8 w-8 text-red-500" />
                                <span className="text-red-500 font-semibold text-lg">Ingresso Inválido</span>
                            </>
                        )}
                        {scanResult === 'already-used' && (
                            <>
                                <XCircle className="h-8 w-8 text-orange-500" />
                                <span className="text-orange-500 font-semibold text-lg">Ingresso Já Utilizado</span>
                            </>
                        )}
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                        <Button
                            onClick={isScanning ? stopScanning : startScanning}
                            variant={isScanning ? 'destructive' : 'default'}
                            className="flex-1"
                        >
                            {isScanning ? 'Parar Scanner' : 'Iniciar Scanner'}
                        </Button>

                        <Button onClick={() => setIsMuted(!isMuted)} variant="outline" size="icon">
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center space-x-2">
                        <Badge variant={isScanning ? 'default' : 'secondary'}>
                            {isScanning ? 'Escaneando...' : 'Parado'}
                        </Badge>
                        {isMuted && <Badge variant="outline">Som Desabilitado</Badge>}
                    </div>
                </div>

                {/* Error Message */}
                {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                {/* Instructions */}
                <div className="text-sm text-gray-600 space-y-1">
                    <p>• Aponte a câmera para o QR code do ingresso</p>
                    <p>• O scanner detectará automaticamente</p>
                    <p>• Som e vibração indicarão o resultado</p>
                </div>
            </div>
        </div>
    )
}

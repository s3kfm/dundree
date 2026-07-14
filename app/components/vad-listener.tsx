import { forwardRef, useImperativeHandle } from 'react'
import { useMicVAD } from "@ricky0123/vad-react"

export type VadListenerHandle = {
    start: () => void
    pause: () => void
}


const VadListener = forwardRef<VadListenerHandle, {
    onSpeechEnd: (segment: Float32Array) => void
    autoStart?: boolean
    positiveSpeechThreshold?: number
    onSpeechStart?: () => void
    negativeSpeechThreshold?: number
}>(({ onSpeechEnd, autoStart = false, onSpeechStart, positiveSpeechThreshold = 0.5, negativeSpeechThreshold = 0.5 }, ref) => {
    const { pause, start } = useMicVAD({
        onSpeechEnd: async (segment) => {
            onSpeechEnd(segment)
        },
        
      onnxWASMBasePath:
        "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
      baseAssetPath:
        "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/",
        onSpeechStart: onSpeechStart,
        positiveSpeechThreshold,
        negativeSpeechThreshold,
        startOnLoad: autoStart,
        redemptionMs: 150,


    })

    useImperativeHandle(ref, () => ({
        start,
        pause,
    }))

    return null
})

VadListener.displayName = "VadListener"
export default VadListener


import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createPcmBlob, decodeAudioData, outputSampleRate } from "./audioUtils";
import { TranscriptItem } from "../types";

// Initialize Gemini Client
// IMPORTANT: In a real app, API_KEY should be secure. Here we use process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Chat Service ---
export const sendChatMessage = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  try {
    const model = 'gemini-2.5-flash';
    const chat = ai.chats.create({
      model,
      history: history,
      config: {
        systemInstruction: "You are Aura, an AI receptionist for 'TechSpace India'. You help book appointments, answer queries in English and Hinglish. Be professional, warm, and concise. Format times clearly.",
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

// --- Live Voice Service Class ---
export class LiveVoiceManager {
  private session: any = null;
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private onStatusChange: (status: string) => void;
  private onAudioActivity: (isActive: boolean) => void;
  private onTranscript: (item: TranscriptItem) => void;

  constructor(
    statusCallback: (status: string) => void, 
    activityCallback: (active: boolean) => void,
    transcriptCallback: (item: TranscriptItem) => void
  ) {
    this.onStatusChange = statusCallback;
    this.onAudioActivity = activityCallback;
    this.onTranscript = transcriptCallback;
  }

  async connect() {
    try {
      this.onStatusChange('CONNECTING');
      
      // Setup Audio Contexts
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: outputSampleRate });
      
      // Get User Media
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are Aura, a helpful Indian business assistant. Speak naturally, use Indian English nuances occasionally. Keep responses short and conversational. You are helping a user book an appointment. Ask for their preferred date and time.",
        },
        callbacks: {
          onopen: () => {
            this.onStatusChange('CONNECTED');
            this.startAudioStreaming(sessionPromise);
          },
          onmessage: async (msg: LiveServerMessage) => {
            this.handleServerMessage(msg);
          },
          onclose: () => {
            this.onStatusChange('DISCONNECTED');
            this.cleanup();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            this.onStatusChange('ERROR');
            this.cleanup();
          }
        }
      });
      
      this.session = sessionPromise;

    } catch (error) {
      console.error("Connection failed", error);
      this.onStatusChange('ERROR');
    }
  }

  private startAudioStreaming(sessionPromise: Promise<any>) {
    if (!this.inputContext || !this.stream) return;

    this.inputSource = this.inputContext.createMediaStreamSource(this.stream);
    this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      // Visual feedback trigger (simple volume check)
      const volume = inputData.reduce((acc, val) => acc + Math.abs(val), 0) / inputData.length;
      if (volume > 0.01) this.onAudioActivity(true);
      else this.onAudioActivity(false);

      const pcmBlob = createPcmBlob(inputData);
      
      sessionPromise.then(session => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputContext.destination);
  }

  private async handleServerMessage(message: LiveServerMessage) {
    // Handle Audio Output
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputContext) {
      this.onAudioActivity(true); // Model is speaking
      
      // Sync playback time
      this.nextStartTime = Math.max(this.nextStartTime, this.outputContext.currentTime);

      const audioBuffer = await decodeAudioData(
        this.base64ToUint8Array(base64Audio),
        this.outputContext
      );

      const source = this.outputContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputContext.destination);
      source.start(this.nextStartTime);
      
      this.nextStartTime += audioBuffer.duration;
      
      source.onended = () => {
         this.onAudioActivity(false); 
      };
    }

    // Handle Interruption
    if (message.serverContent?.interrupted) {
      this.nextStartTime = 0; // Reset timeline on interruption
    }

    // Handle Transcriptions
    const anyMsg = message as any;
    
    // User Input Transcription
    if (anyMsg.serverContent?.inputTranscription) {
        const text = anyMsg.serverContent.inputTranscription.text;
        if (text) {
             this.onTranscript({ id: Date.now().toString(), role: 'user', text, isFinal: true });
        }
    }

    // Model Output Transcription
    if (anyMsg.serverContent?.outputTranscription) {
         const text = anyMsg.serverContent.outputTranscription.text;
         if (text) {
             this.onTranscript({ id: Date.now().toString(), role: 'model', text, isFinal: true });
         }
    }
  }

  private base64ToUint8Array(base64: string): Uint8Array {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  }

  disconnect() {
    this.cleanup();
    this.onStatusChange('DISCONNECTED');
  }

  private cleanup() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.processor?.disconnect();
    this.inputSource?.disconnect();
    this.inputContext?.close();
    this.outputContext?.close();
    
    this.stream = null;
    this.processor = null;
    this.inputContext = null;
    this.outputContext = null;
  }
}

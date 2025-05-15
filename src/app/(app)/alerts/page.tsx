
"use client";

import { useState, useEffect, useCallback } from 'react';
import { BullyingDetectionForm } from '@/components/alerts/bullying-detection-form';
import { IncidentItem } from '@/components/alerts/incident-item';
import type { BullyingIncident } from '@/types';
import { Accordion } from "@/components/ui/accordion";
import type { DetectBullyingOutput } from "@/ai/flows/detect-bullying";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PLACEHOLDER_USER } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Check for SpeechRecognition API
const SpeechRecognition = (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export default function AlertsPage() {
  const [incidents, setIncidents] = useState<BullyingIncident[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [recognitionInstance, setRecognitionInstance] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedIncidents = localStorage.getItem('bullyingIncidents');
    if (storedIncidents) {
      try {
        const parsedIncidents: BullyingIncident[] = JSON.parse(storedIncidents).map((inc: any) => ({
          ...inc,
          timestamp: new Date(inc.timestamp)
        }));
        setIncidents(parsedIncidents);
      } catch (error) {
        console.error("Failed to parse incidents from localStorage", error);
        localStorage.removeItem('bullyingIncidents');
      }
    }

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => prev.split(' ').slice(0, -1).join(' ') + (prev ? ' ' : '') + finalTranscript + interimTranscript);
         // If final, set the transcript and stop listening for this phrase
        if (finalTranscript.trim()) {
            setTranscript(currentFinal => {
                // This logic attempts to merge final transcripts if recognition fires multiple times quickly.
                // For simple use, `finalTranscript` might be enough if `continuous` is false.
                // However, this example tries to build up a more complete phrase.
                // For a single phrase, we'd likely reset transcript before new final result.
                // Here, we'll just use the latest final transcript.
                return finalTranscript;
            });
        }
      };

      recognition.onerror = (event) => {
        let errorMsg = "Speech recognition error.";
        if (event.error === 'no-speech') {
          errorMsg = "No speech was detected. Please try again.";
        } else if (event.error === 'audio-capture') {
          errorMsg = "Audio capture failed. Ensure microphone is working.";
        } else if (event.error === 'not-allowed') {
          errorMsg = "Microphone access denied. Please allow microphone access in your browser settings.";
        } else if (event.error === 'network') {
          errorMsg = "Network error during speech recognition. Please check your connection.";
        }
        setSpeechError(errorMsg);
        toast({ title: "Speech Error", description: errorMsg, variant: "destructive" });
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognitionInstance(recognition);
    } else {
      setSpeechError("Speech recognition is not supported by your browser.");
    }

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // Only run on client mount and when recognitionInstance is first set up

  const toggleListening = useCallback(() => {
    if (!SpeechRecognition || !recognitionInstance) {
      toast({ title: "Unsupported", description: "Speech recognition not available.", variant: "destructive" });
      return;
    }

    if (isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    } else {
      setTranscript(""); // Clear previous transcript
      setSpeechError(null);
      try {
        recognitionInstance.start();
        setIsListening(true);
      } catch (error) {
        // This catch might be for errors during .start() itself, though .onerror usually handles recognition issues
        console.error("Error starting speech recognition:", error);
        setSpeechError("Could not start speech recognition. Ensure microphone permissions are granted.");
        toast({ title: "Error", description: "Could not start speech recognition.", variant: "destructive" });
        setIsListening(false);
      }
    }
  }, [isListening, recognitionInstance, toast]);

  useEffect(() => {
    if(isClient) {
      localStorage.setItem('bullyingIncidents', JSON.stringify(incidents));
    }
  }, [incidents, isClient]);

  const handleNewDetection = (result: DetectBullyingOutput & { originalText: string }) => {
    const newIncident: BullyingIncident = {
      id: new Date().toISOString() + Math.random().toString(36).substring(2,9),
      timestamp: new Date(),
      text: result.originalText,
      severity: result.severity,
      isBullying: result.isBullying,
      explanation: result.explanation,
    };
    setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
    setTranscript(""); // Clear transcript after successful submission
  };

  if (!isClient) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Bullying Alerts</h1>
        <p className="text-muted-foreground">Loading alerts for {PLACEHOLDER_USER.childName}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bullying Alerts</h1>
        <p className="text-muted-foreground">
          Monitor and analyze potential bullying incidents for {PLACEHOLDER_USER.childName}.
        </p>
      </div>
      
      {speechError && !isListening && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Speech Recognition Error</AlertTitle>
          <AlertDescription>{speechError}</AlertDescription>
        </Alert>
      )}

      {!SpeechRecognition && isClient && (
         <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Browser Incompatibility</AlertTitle>
          <AlertDescription>
            Speech recognition is not supported by your browser. Please try a different browser like Chrome or Edge.
          </AlertDescription>
        </Alert>
      )}

      {SpeechRecognition && (
        <div className="mb-4">
          <Button onClick={toggleListening} variant={isListening ? "destructive" : "outline"} className="gap-2">
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {isListening ? 'Stop Listening' : 'Speak to Analyze'}
          </Button>
          {isListening && <p className="text-sm text-muted-foreground mt-2">Listening... Speak clearly.</p>}
        </div>
      )}
      
      <BullyingDetectionForm 
        onNewDetection={handleNewDetection} 
        currentTranscript={transcript}
        onTranscriptConsumed={() => setTranscript("")} // Reset transcript in parent after form consumes it
      />

      <div className="flex-grow flex flex-col min-h-0 mt-8">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Incident History</h2>
        {incidents.length === 0 ? (
          <p className="text-muted-foreground">No incidents recorded yet.</p>
        ) : (
          <ScrollArea className="flex-grow pr-4">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {incidents.map((incident) => (
                <IncidentItem key={incident.id} incident={incident} />
              ))}
            </Accordion>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

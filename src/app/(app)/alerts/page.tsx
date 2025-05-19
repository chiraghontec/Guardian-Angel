
"use client";

import { useState, useEffect, useCallback } from 'react';
import { TextAnalysisForm } from '@/components/alerts/bullying-detection-form'; // Now TextAnalysisForm
import { AlertItem } from '@/components/alerts/alert-item'; // Renamed from IncidentItem
import type { AppAlert } from '@/types'; // Updated type
import { Accordion } from "@/components/ui/accordion";
import type { AnalyzeTextContentOutput } from "@/ai/flows/analyze-text-content"; // Updated import
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';

const SpeechRecognition = (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

// Constants for alert generation (simulated for Fitbit data)
const HIGH_HR_THRESHOLD = 120; // Example threshold for high heart rate (BPM)
const LOW_SPO2_THRESHOLD = 92; // Example threshold for low SpO2 (%)

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [recognitionInstance, setRecognitionInstance] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const { childNameContext } = useAuth();

  const currentChildName = childNameContext || "your child";

  useEffect(() => {
    setIsClient(true);
    const storedAlerts = localStorage.getItem('guardianAngelAlerts'); // Changed key
    if (storedAlerts) {
      try {
        const parsedAlerts: AppAlert[] = JSON.parse(storedAlerts).map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp),
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : undefined,
        }));
        setAlerts(parsedAlerts);
      } catch (error) {
        console.error("Failed to parse alerts from localStorage", error);
        localStorage.removeItem('guardianAngelAlerts');
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
        if (finalTranscript.trim()) {
             setTranscript(finalTranscript);
        } else if (interimTranscript.trim()) {
             setTranscript(prev => interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        let errorMsg = "Speech recognition error.";
        if (event.error === 'no-speech') errorMsg = "No speech was detected.";
        else if (event.error === 'audio-capture') errorMsg = "Audio capture failed. Ensure microphone is working.";
        else if (event.error === 'not-allowed') errorMsg = "Microphone access denied.";
        setSpeechError(errorMsg);
        toast({ title: "Speech Error", description: errorMsg, variant: "destructive" });
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
      setRecognitionInstance(recognition);
    } else if (typeof window !== 'undefined') { // only set error if on client
      setSpeechError("Speech recognition is not supported by your browser.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed isClient from deps as it's set once

  const toggleListening = useCallback(() => {
    if (!SpeechRecognition || !recognitionInstance) {
      toast({ title: "Unsupported", description: "Speech recognition not available.", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionInstance.stop();
    } else {
      setTranscript(""); 
      setSpeechError(null);
      try {
        recognitionInstance.start();
        setIsListening(true);
      } catch (error) {
        setSpeechError("Could not start speech recognition.");
        toast({ title: "Error", description: "Could not start speech recognition.", variant: "destructive" });
        setIsListening(false);
      }
    }
  }, [isListening, recognitionInstance, toast]);

  useEffect(() => {
    if(isClient) {
      // In a real app with Firestore, this effect would be replaced by onSnapshot listeners
      // or specific writes to Firestore. For now, we ensure localStorage is up-to-date.
      localStorage.setItem('guardianAngelAlerts', JSON.stringify(alerts));
    }
  }, [alerts, isClient]);

  const handleNewAIDetection = (result: AnalyzeTextContentOutput & { originalText: string }) => {
    const newAlertsList: AppAlert[] = [];
    const baseId = new Date().toISOString() + Math.random().toString(36).substring(2,9);

    if (result.isBullying) {
      newAlertsList.push({
        id: `${baseId}-bullying`,
        timestamp: new Date(),
        type: 'ai_bullying',
        title: 'Potential Bullying Detected',
        description: result.originalText,
        severity: result.bullyingSeverity,
        status: 'active',
        details: { explanation: result.explanation, originalText: result.originalText },
      });
    }
    if (result.isDepressive) {
       newAlertsList.push({
        id: `${baseId}-depressive`,
        timestamp: new Date(),
        type: 'ai_depressive',
        title: 'Potential Depressive Content Detected',
        description: result.originalText,
        severity: result.depressiveSeverity,
        status: 'active',
        details: { explanation: result.explanation, originalText: result.originalText },
      });
    }

    if (newAlertsList.length > 0) {
       setAlerts(prevAlerts => [...newAlertsList, ...prevAlerts]);
    }
    setTranscript("");
  };
  
  const handleResolveToggle = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId
          ? { 
              ...alert, 
              status: alert.status === 'active' ? 'resolved' : 'active',
              resolvedAt: alert.status === 'active' ? new Date() : undefined
            }
          : alert
      )
    );
     toast({
      title: "Alert Updated",
      description: `Alert status changed.`,
    });
  };


  if (!isClient) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
        <p className="text-muted-foreground">Loading alerts for {currentChildName}...</p>
      </div>
    );
  }
  
  const activeAlerts = alerts.filter(a => a.status === 'active').sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved').sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());


  return (
    <div className="space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
        <p className="text-muted-foreground">
          Monitor and analyze potential incidents and health alerts for {currentChildName}.
          {/* In a real app, data would be from Firestore. Alerts are stored in localStorage for this prototype. */}
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
      
      <TextAnalysisForm 
        onNewDetection={handleNewAIDetection} 
        currentTranscript={transcript}
        onTranscriptConsumed={() => setTranscript("")}
      />

      <div className="flex-grow flex flex-col min-h-0 mt-8">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Active Alerts ({activeAlerts.length})</h2>
        {activeAlerts.length === 0 ? (
          <Alert className="mb-4">
            <Info className="h-4 w-4"/>
            <AlertTitle>No Active Alerts</AlertTitle>
            <AlertDescription>Currently, there are no active alerts for {currentChildName}.</AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="flex-grow pr-4 max-h-[40vh]">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {activeAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} onResolveToggle={handleResolveToggle} />
              ))}
            </Accordion>
          </ScrollArea>
        )}

        <h2 className="text-2xl font-semibold tracking-tight mt-6 mb-2">Resolved Alerts ({resolvedAlerts.length})</h2>
         {resolvedAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts have been resolved yet.</p>
        ) : (
          <ScrollArea className="flex-grow pr-4 max-h-[30vh]">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {resolvedAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} onResolveToggle={handleResolveToggle} />
              ))}
            </Accordion>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

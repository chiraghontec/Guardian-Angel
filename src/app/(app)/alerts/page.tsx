
"use client";

import { useState, useEffect } from 'react';
import { BullyingDetectionForm } from '@/components/alerts/bullying-detection-form';
import { IncidentItem } from '@/components/alerts/incident-item';
import type { BullyingIncident } from '@/types';
import { Accordion } from "@/components/ui/accordion";
import type { DetectBullyingOutput } from "@/ai/flows/detect-bullying";
import { ScrollArea } from '@/components/ui/scroll-area';
import { PLACEHOLDER_USER } from '@/lib/constants';

export default function AlertsPage() {
  const [incidents, setIncidents] = useState<BullyingIncident[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load incidents from local storage or an API in a real app
    const storedIncidents = localStorage.getItem('bullyingIncidents');
    if (storedIncidents) {
      try {
        const parsedIncidents: BullyingIncident[] = JSON.parse(storedIncidents).map((inc: any) => ({
          ...inc,
          timestamp: new Date(inc.timestamp) // Ensure timestamp is a Date object
        }));
        setIncidents(parsedIncidents);
      } catch (error) {
        console.error("Failed to parse incidents from localStorage", error);
        localStorage.removeItem('bullyingIncidents'); // Clear corrupted data
      }
    }
  }, []);

  useEffect(() => {
    if(isClient) {
      localStorage.setItem('bullyingIncidents', JSON.stringify(incidents));
    }
  }, [incidents, isClient]);

  const handleNewDetection = (result: DetectBullyingOutput & { originalText: string }) => {
    const newIncident: BullyingIncident = {
      id: new Date().toISOString() + Math.random().toString(36).substring(2,9), // Simple unique ID
      timestamp: new Date(),
      text: result.originalText,
      severity: result.severity,
      isBullying: result.isBullying,
      explanation: result.explanation,
    };
    setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
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
      
      <BullyingDetectionForm onNewDetection={handleNewDetection} />

      <div className="flex-grow flex flex-col min-h-0">
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

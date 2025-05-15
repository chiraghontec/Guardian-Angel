
import type { BullyingIncident } from "@/types";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface IncidentItemProps {
  incident: BullyingIncident;
}

export function IncidentItem({ incident }: IncidentItemProps) {
  const severityPercentage = (incident.severity * 100).toFixed(0);
  const formattedDate = format(incident.timestamp, "MMM d, yyyy 'at' h:mm a");

  return (
    <AccordionItem value={incident.id} className="border-b-0">
      <Card className="mb-2 shadow-md">
        <AccordionTrigger className="p-0 hover:no-underline">
            <CardHeader className="flex flex-row justify-between items-center w-full p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                   {incident.isBullying ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  <CardTitle className="text-base md:text-lg leading-tight truncate max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg" title={incident.text}>
                    "{incident.text.length > 50 ? `${incident.text.substring(0, 50)}...` : incident.text}"
                  </CardTitle>
                </div>
                <CardDescription className="text-xs mt-1">{formattedDate}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {incident.isBullying && (
                  <Badge variant="destructive" className="text-xs">Severity: {severityPercentage}%</Badge>
                )}
                 {!incident.isBullying && (
                  <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-700 hover:bg-green-500/30">Safe</Badge>
                )}
                {/* Chevron is part of AccordionTrigger */}
              </div>
            </CardHeader>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2 text-sm">
              <p><strong>Full Text:</strong> {incident.text}</p>
              <p><strong>Explanation:</strong> {incident.explanation}</p>
              <p><strong>Timestamp:</strong> {formattedDate}</p>
              <p><strong>Severity Score:</strong> {incident.severity.toFixed(2)}</p>
              <p><strong>Flagged as Bullying:</strong> {incident.isBullying ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}

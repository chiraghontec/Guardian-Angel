
import type { AppAlert } from "@/types";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, HeartCrack, Thermometer, Activity, ShieldAlert, MessageCircleWarning, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils";

interface AlertItemProps {
  alert: AppAlert;
  onResolveToggle: (alertId: string) => void;
}

const getAlertIcon = (type: AppAlert['type']) => {
  switch (type) {
    case 'ai_bullying':
      return <ShieldAlert className="h-5 w-5 text-destructive" />;
    case 'ai_depressive':
      return <MessageCircleWarning className="h-5 w-5 text-orange-500" />;
    case 'fitbit_hr_high':
    case 'fitbit_hr_low':
      return <HeartCrack className="h-5 w-5 text-red-500" />;
    case 'fitbit_spo2_low':
      return <Activity className="h-5 w-5 text-yellow-500" />; 
    case 'fitbit_temp_high':
    case 'fitbit_temp_low':
      return <Thermometer className="h-5 w-5 text-purple-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

export function AlertItem({ alert, onResolveToggle }: AlertItemProps) {
  const severityPercentage = alert.severity ? (alert.severity * 100).toFixed(0) : null;
  const formattedDate = format(alert.timestamp, "MMM d, yyyy 'at' h:mm a");
  const isResolved = alert.status === 'resolved';

  return (
    <AccordionItem value={alert.id} className="border-b-0">
      <Card className={cn("mb-2 shadow-md transition-opacity", isResolved ? "opacity-60 bg-muted/30" : "opacity-100")}>
        <AccordionTrigger className="p-0 hover:no-underline">
            <CardHeader className="flex flex-row justify-between items-center w-full p-4">
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                   {getAlertIcon(alert.type)}
                  <CardTitle className="text-base md:text-lg leading-tight truncate" title={alert.title}>
                    {alert.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs mt-1">{formattedDate}</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {alert.type.startsWith('ai_') && severityPercentage && (
                  <Badge variant={alert.type === 'ai_bullying' ? "destructive" : "default"} className={cn("text-xs", alert.type === 'ai_depressive' && "bg-orange-500 text-white")}>
                    Severity: {severityPercentage}%
                  </Badge>
                )}
                <Badge variant={isResolved ? "secondary" : "outline"} className={cn("text-xs", isResolved ? "bg-green-600 text-white" : "border-yellow-500 text-yellow-600")}>
                  {isResolved ? 'Resolved' : 'Active'}
                </Badge>
              </div>
            </CardHeader>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2 text-sm">
              <p><strong>Description:</strong> {alert.description}</p>
              {alert.details?.explanation && <p><strong>AI Explanation:</strong> {alert.details.explanation}</p>}
              {alert.details?.metricValue && <p><strong>Metric Value:</strong> {alert.details.metricValue}</p>}
              <p><strong>Timestamp:</strong> {formattedDate}</p>
              {alert.severity !== undefined && <p><strong>Severity Score:</strong> {alert.severity.toFixed(2)}</p>}
              <p><strong>Type:</strong> <span className="capitalize">{alert.type.replace(/_/g, ' ')}</span></p>
              <p><strong>Status:</strong> {alert.status}</p>
              {isResolved && alert.resolvedAt && (
                <p><strong>Resolved At:</strong> {format(new Date(alert.resolvedAt), "MMM d, yyyy 'at' h:mm a")}</p>
              )}
            </div>
            <Button 
              onClick={() => onResolveToggle(alert.id)} 
              variant={isResolved ? "outline" : "default"} 
              size="sm" 
              className="mt-4"
            >
              {isResolved ? 'Mark as Active' : 'Mark as Resolved'}
            </Button>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}


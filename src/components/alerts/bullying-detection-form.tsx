
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { detectBullying, type DetectBullyingOutput } from "@/ai/flows/detect-bullying";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

const FormSchema = z.object({
  text: z.string().min(10, {
    message: "Text must be at least 10 characters.",
  }).max(1000, {
    message: "Text must not be longer than 1000 characters.",
  }),
});

interface BullyingDetectionFormProps {
  onNewDetection: (result: DetectBullyingOutput & { originalText: string }) => void;
  currentTranscript?: string;
  onTranscriptConsumed?: () => void;
}

export function BullyingDetectionForm({ 
  onNewDetection, 
  currentTranscript,
  onTranscriptConsumed 
}: BullyingDetectionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DetectBullyingOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: currentTranscript || "",
    },
  });

  useEffect(() => {
    if (currentTranscript !== undefined) {
      form.setValue("text", currentTranscript);
    }
  }, [currentTranscript, form]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await detectBullying({ text: data.text });
      setAnalysisResult(result);
      onNewDetection({ ...result, originalText: data.text });
      toast({
        title: "Analysis Complete",
        description: result.isBullying ? "Potential bullying detected." : "No bullying detected.",
        variant: result.isBullying ? "destructive" : "default",
      });
      form.reset({ text: "" }); // Clear form after submission
      if (onTranscriptConsumed) {
        onTranscriptConsumed(); // Notify parent that transcript has been used
      }
    } catch (error) {
      console.error("Error detecting bullying:", error);
      toast({
        title: "Error",
        description: "Failed to analyze text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Analyze Text for Bullying</CardTitle>
        <CardDescription>
          Enter text from SMS, social media, or other sources to check for potential bullying.
          You can also use the "Speak to Analyze" button to input text via voice.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="text-input">Text to Analyze</FormLabel>
                  <FormControl>
                    <Textarea
                      id="text-input"
                      placeholder="Paste text here, or use the 'Speak to Analyze' button..."
                      className="min-h-[100px] resize-y"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Text"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {analysisResult && !isLoading && (
        <CardContent className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Analysis Result:</h3>
          {analysisResult.isBullying ? (
            <div className="p-4 rounded-md border border-destructive bg-destructive/10">
              <div className="flex items-center text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Potential Bullying Detected</span>
              </div>
              <p className="text-sm mt-1">Severity: {(analysisResult.severity * 100).toFixed(0)}%</p>
              <p className="text-sm mt-1">Explanation: {analysisResult.explanation}</p>
            </div>
          ) : (
            <div className="p-4 rounded-md border border-green-500 bg-green-500/10">
               <div className="flex items-center text-green-600">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span className="font-semibold">No Bullying Detected</span>
              </div>
              <p className="text-sm mt-1">Explanation: {analysisResult.explanation}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

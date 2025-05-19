
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
import { analyzeTextContent, type AnalyzeTextContentOutput } from "@/ai/flows/analyze-text-content"; // Updated import
import { Loader2, AlertTriangle, CheckCircle2, MessageCircleWarning, BrainCircuit } from "lucide-react";

const FormSchema = z.object({
  text: z.string().min(10, {
    message: "Text must be at least 10 characters.",
  }).max(1000, {
    message: "Text must not be longer than 1000 characters.",
  }),
});

interface TextAnalysisFormProps {
  onNewDetection: (result: AnalyzeTextContentOutput & { originalText: string }) => void;
  currentTranscript?: string;
  onTranscriptConsumed?: () => void;
}

export function TextAnalysisForm({ 
  onNewDetection, 
  currentTranscript,
  onTranscriptConsumed 
}: TextAnalysisFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTextContentOutput | null>(null);
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
      const result = await analyzeTextContent({ text: data.text }); // Updated function call
      setAnalysisResult(result);
      onNewDetection({ ...result, originalText: data.text });
      
      let toastTitle = "Analysis Complete";
      let toastDescription = "Content analyzed.";
      let toastVariant: "default" | "destructive" = "default";

      if (result.isBullying && result.isDepressive) {
        toastDescription = "Potential bullying and depressive content detected.";
        toastVariant = "destructive";
      } else if (result.isBullying) {
        toastDescription = "Potential bullying detected.";
        toastVariant = "destructive";
      } else if (result.isDepressive) {
        toastDescription = "Potential depressive content detected.";
        toastVariant = "destructive"; // Or a different variant for depressive content
      } else {
        toastDescription = "No significant concerns detected.";
      }

      toast({
        title: toastTitle,
        description: toastDescription,
        variant: toastVariant,
      });
      form.reset({ text: "" }); 
      if (onTranscriptConsumed) {
        onTranscriptConsumed();
      }
    } catch (error) {
      console.error("Error analyzing text:", error);
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
        <CardTitle>Analyze Text Content</CardTitle>
        <CardDescription>
          Enter text to check for potential bullying or depressive content.
          You can also use the "Speak to Analyze" button.
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
        <CardContent className="mt-4 border-t pt-4 space-y-3">
          <h3 className="text-lg font-semibold mb-2">Analysis Result:</h3>
          {analysisResult.isBullying && (
            <div className="p-3 rounded-md border border-destructive bg-destructive/10">
              <div className="flex items-center text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Potential Bullying Detected</span>
              </div>
              <p className="text-sm mt-1">Severity: {(analysisResult.bullyingSeverity! * 100).toFixed(0)}%</p>
            </div>
          )}
          {analysisResult.isDepressive && (
            <div className="p-3 rounded-md border border-orange-500 bg-orange-500/10">
              <div className="flex items-center text-orange-600">
                <MessageCircleWarning className="h-5 w-5 mr-2" /> 
                <span className="font-semibold">Potential Depressive Content Detected</span>
              </div>
              <p className="text-sm mt-1">Severity: {(analysisResult.depressiveSeverity! * 100).toFixed(0)}%</p>
            </div>
          )}
          {!analysisResult.isBullying && !analysisResult.isDepressive && (
             <div className="p-3 rounded-md border border-green-500 bg-green-500/10">
               <div className="flex items-center text-green-600">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span className="font-semibold">No Major Concerns Detected</span>
              </div>
            </div>
          )}
           <div className="p-3 rounded-md border bg-muted/50">
              <div className="flex items-center text-foreground">
                 <BrainCircuit className="h-5 w-5 mr-2 text-primary"/>
                <span className="font-semibold">AI Explanation:</span>
              </div>
              <p className="text-sm mt-1">{analysisResult.explanation}</p>
            </div>
        </CardContent>
      )}
    </Card>
  );
}


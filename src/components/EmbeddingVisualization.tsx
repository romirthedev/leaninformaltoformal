import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, BarChart3, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFrontendVisualization } from "@/lib/visualization";

interface VisualizationProps {
  informalStatement: string;
  leanCode: string;
  isVisible: boolean;
}

export const EmbeddingVisualization = ({ informalStatement, leanCode, isVisible }: VisualizationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plotSvg, setPlotSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const generateVisualization = async () => {
    if (!informalStatement || !leanCode) {
      toast({
        title: "Missing data",
        description: "Please ensure you have both an informal statement and generated Lean code.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError("");
    setPlotSvg("");

    try {
      // Create multiple variations of the Lean code for analysis
      const variations = [
        leanCode.replace("theorem", "lemma"),
        leanCode.replace(":=", ":\n"),
        leanCode + "\n-- Alternative approach",
        leanCode.replace("by sorry", "by exact?")
      ];
      
      const leanCodes = [leanCode, ...variations.filter(code => code !== leanCode)];

      // Generate frontend visualization
      const frontendResult = generateFrontendVisualization(informalStatement, leanCodes);
      
      // Directly inject SVG markup for full interactivity (hover, CSS inside SVG)
      setPlotSvg(frontendResult.svg);
      toast({
        title: "Visualization Generated! 📊",
        description: frontendResult.message,
      });
      
    } catch (error) {
      console.error("Error generating visualization:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Visualization failed",
        description: "There was an error generating the visualization.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="elegant-shadow vintage-border mt-8">
      <CardHeader>
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Embedding Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate a visualization showing how different Lean formalizations cluster in embedding space.
          This helps understand the semantic relationships between different proof approaches.
        </p>
        
        <Button
          onClick={generateVisualization}
          disabled={isGenerating || !informalStatement || !leanCode}
          variant="outline"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Visualization...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4" />
              Generate Embedding Plot
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {plotSvg && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Visualization Results:</h4>
            <div className="border rounded-md p-2 bg-muted/20 overflow-hidden">
              <div 
                className="w-full flex justify-center"
                style={{ maxWidth: '100%' }}
                dangerouslySetInnerHTML={{ __html: plotSvg }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Hover over points to see the corresponding formal Lean statement. Generated entirely in the browser.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

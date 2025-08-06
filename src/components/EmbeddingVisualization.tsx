import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, BarChart3, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VisualizationProps {
  informalStatement: string;
  leanCode: string;
  isVisible: boolean;
}

export const EmbeddingVisualization = ({ informalStatement, leanCode, isVisible }: VisualizationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plotImage, setPlotImage] = useState<string>("");
  const [plotFormat, setPlotFormat] = useState<'png' | 'svg'>('png');
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
    setPlotImage("");

    try {
      // For demonstration, we'll create multiple variations of the Lean code
      // In a real implementation, you might want to generate these variations
      // or have them provided from the AI model
      const variations = [
        leanCode.replace("theorem", "lemma"),
        leanCode.replace(":=", ":\n"),
        leanCode + "\n-- Alternative approach"
      ];
      
      const leanCodes = [leanCode, ...variations.filter(code => code !== leanCode)];

      // Use appropriate API endpoint
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/visualize' 
        : 'http://localhost:3001/api/visualize'; // Local development server

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          informal_statement: informalStatement,
          lean_codes: leanCodes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.plot) {
        setPlotImage(data.plot);
        setPlotFormat(data.format || 'png');
        toast({
          title: "Visualization generated!",
          description: data.message || "The embedding visualization has been created successfully.",
        });
      } else {
        throw new Error(data.error || "Failed to generate visualization");
      }
    } catch (error) {
      console.error("Error generating visualization:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Visualization failed",
        description: "There was an error generating the visualization. Make sure the backend server is running.",
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

        {plotImage && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Visualization Results:</h4>
            <div className="border rounded-md p-4 bg-muted/20">
              {plotFormat === 'svg' ? (
                <div 
                  className="w-full"
                  dangerouslySetInnerHTML={{ 
                    __html: atob(plotImage) 
                  }}
                />
              ) : (
                <img 
                  src={`data:image/png;base64,${plotImage}`} 
                  alt="Embedding Visualization"
                  className="w-full h-auto rounded-md"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              The visualization shows how different Lean formalizations cluster together based on their 
              semantic similarity. Connected points represent related formalization approaches.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, BarChart3, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFrontendVisualization } from "@/lib/visualization";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

  // Detachable popup controls
  const [detachHover, setDetachHover] = useState(false);
  const [hoverCode, setHoverCode] = useState<string>("");
  const [hoverPos, setHoverPos] = useState<{x:number;y:number}|null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotSvg || !svgContainerRef.current) return;
    const container = svgContainerRef.current;

    const onMouseOver = (e: MouseEvent) => {
      if (!detachHover) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Find enclosing .pt group
      const group = (target.closest && target.closest('g.pt')) as SVGGElement | null;
      if (!group) return;
      const leanAttr = group.getAttribute('data-lean');
      if (!leanAttr) return;
      const decoded = decodeURIComponent(leanAttr);
      setHoverCode(decoded);
      setHoverPos({ x: e.clientX, y: e.clientY });
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!detachHover || !hoverCode) return;
      setHoverPos({ x: e.clientX, y: e.clientY });
    };

    const onMouseLeave = () => {
      if (!detachHover) return;
      setHoverPos(null);
      setHoverCode("");
    };

    container.addEventListener('mouseover', onMouseOver);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    return () => {
      container.removeEventListener('mouseover', onMouseOver);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [plotSvg, detachHover, hoverCode]);

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
      const variations = [
        leanCode.replace("theorem", "lemma"),
        leanCode.replace(":=", ":\n"),
        leanCode + "\n-- Alternative approach",
        leanCode.replace("by sorry", "by exact?")
      ];
      const leanCodes = [leanCode, ...variations.filter(code => code !== leanCode)];

      const frontendResult = generateFrontendVisualization(informalStatement, leanCodes);
      setPlotSvg(frontendResult.svg);
      toast({ title: "Visualization Generated! 📊", description: frontendResult.message });
    } catch (error) {
      console.error("Error generating visualization:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      toast({ title: "Visualization failed", description: "There was an error generating the visualization.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isVisible) return null;

  const floatingStyle: React.CSSProperties = hoverPos ? {
    position: 'fixed',
    left: Math.min(hoverPos.x + 16, window.innerWidth - 360),
    top: Math.min(hoverPos.y + 16, window.innerHeight - 220),
    zIndex: 50,
    maxWidth: 340,
  } : {};

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
        </p>

        <div className="flex items-center justify-between gap-4">
          <Button onClick={generateVisualization} disabled={isGenerating || !informalStatement || !leanCode} variant="outline" className="w-full">
            {isGenerating ? (<><Loader2 className="h-4 w-4 animate-spin" /> Generating Visualization...</>) : (<><BarChart3 className="h-4 w-4" /> Generate Embedding Plot</>)}
          </Button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Switch id="detach-hover" checked={detachHover} onCheckedChange={setDetachHover} />
          <Label htmlFor="detach-hover" className="text-sm">Detach hover into floating popup (prevents off-screen clipping)</Label>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {plotSvg && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Visualization Results:</h4>
            <div className="border rounded-md p-2 bg-muted/20 overflow-hidden relative">
              <div ref={svgContainerRef} className="w-full flex justify-center" style={{ maxWidth: '100%' }} dangerouslySetInnerHTML={{ __html: plotSvg }} />

              {detachHover && hoverCode && hoverPos && (
                <div style={floatingStyle} className="rounded-md border bg-background shadow-md p-3 text-xs leading-snug">
                  <div className="font-semibold mb-1">Formal statement</div>
                  <pre className="whitespace-pre-wrap break-words">{hoverCode}</pre>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Hover over points to see the corresponding formal Lean statement. Enable the toggle to show a floating popup that stays in-view near your cursor.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

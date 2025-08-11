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

  // Detachable popup controls - always enabled now
  const [detachHover, setDetachHover] = useState(true);
  const [hoverCode, setHoverCode] = useState<string>("");
  const [hoverPos, setHoverPos] = useState<{x:number;y:number}|null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Click-to-copy control
  const [clickCopy, setClickCopy] = useState(false);

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

    const copyText = async (text: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        toast({ title: 'Copied to clipboard', description: 'Formal statement copied.' });
      } catch (err) {
        toast({ title: 'Copy failed', description: 'Could not copy to clipboard.', variant: 'destructive' });
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!clickCopy) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const group = (target.closest && target.closest('g.pt')) as SVGGElement | null;
      if (!group) return;
      const leanAttr = group.getAttribute('data-lean');
      if (!leanAttr) return;
      const decoded = decodeURIComponent(leanAttr);
      copyText(decoded);
    };

    container.addEventListener('mouseover', onMouseOver);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('click', onClick);
    return () => {
      container.removeEventListener('mouseover', onMouseOver);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('click', onClick);
    };
  }, [plotSvg, detachHover, hoverCode, clickCopy, toast]);

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
      // Generate 50 variations for richer clustering
      const variations = [];
      const baseCode = leanCode;
      
      // Add systematic variations
      for (let i = 0; i < 49; i++) {
        let variant = baseCode;
        
        // Vary theorem types
        if (i % 5 === 1) variant = variant.replace("theorem", "lemma");
        if (i % 5 === 2) variant = variant.replace("theorem", "def");
        if (i % 5 === 3) variant = variant.replace("lemma", "theorem");
        
        // Vary syntax patterns
        if (i % 7 === 1) variant = variant.replace(":=", " :\n  ");
        if (i % 7 === 2) variant = variant.replace("by", "\n  by");
        if (i % 7 === 3) variant = variant.replace("sorry", "exact?");
        if (i % 7 === 4) variant = variant.replace("sorry", "assumption");
        if (i % 7 === 5) variant = variant.replace("sorry", "simp");
        
        // Add different comments/annotations
        if (i % 11 === 1) variant += "\n-- Alternative approach";
        if (i % 11 === 2) variant += "\n-- Using different tactics";
        if (i % 11 === 3) variant += "\n-- Simplified version";
        if (i % 11 === 4) variant += "\n-- More explicit proof";
        if (i % 11 === 5) variant += "\n-- Direct approach";
        
        // Add whitespace variations
        if (i % 13 === 1) variant = variant.replace(/\n/g, "\n  ");
        if (i % 13 === 2) variant = variant.replace(/  /g, " ");
        
        // Add small semantic variations
        if (i % 17 === 1) variant = variant.replace("(", " (");
        if (i % 17 === 2) variant = variant.replace(")", ") ");
        if (i % 17 === 3) variant = variant.replace(",", ", ");
        
        variations.push(variant + `\n-- Variation ${i}`);
      }
      
      const leanCodes = [baseCode, ...variations];

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
    top: Math.max(20, Math.min(hoverPos.y - 100, window.innerHeight - 220)), // Keep away from top/bottom
    zIndex: 9999, // Higher z-index to avoid occlusion
    maxWidth: 340,
    pointerEvents: 'none', // Don't interfere with mouse events
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
          <Label htmlFor="detach-hover" className="text-sm">Enable hover popup (shows formal statements on hover)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="click-copy" checked={clickCopy} onCheckedChange={setClickCopy} />
          <Label htmlFor="click-copy" className="text-sm">Click on a point to copy the formal statement</Label>
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
                <div style={floatingStyle} className="rounded-md border bg-background shadow-lg p-3 text-xs leading-snug">
                  <div className="font-semibold mb-1 text-primary">Formal Statement</div>
                  <pre className="whitespace-pre-wrap break-words text-foreground">{hoverCode}</pre>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Hover over points to see the corresponding formal Lean statement (without proof). 
              Points are colored by cluster. Use the toggles above to enable hover and click-to-copy features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
      // Generate 50 meaningful variations for richer clustering
      const variations = [];
      const baseCode = leanCode;
      
      // Create truly different variations with different mathematical content
      const mathConcepts = [
        { name: "comm_add", params: "a b : Nat", conclusion: "a + b = b + a" },
        { name: "assoc_add", params: "a b c : Nat", conclusion: "(a + b) + c = a + (b + c)" },
        { name: "zero_add", params: "a : Nat", conclusion: "0 + a = a" },
        { name: "add_zero", params: "a : Nat", conclusion: "a + 0 = a" },
        { name: "comm_mul", params: "a b : Nat", conclusion: "a * b = b * a" },
        { name: "assoc_mul", params: "a b c : Nat", conclusion: "(a * b) * c = a * (b * c)" },
        { name: "one_mul", params: "a : Nat", conclusion: "1 * a = a" },
        { name: "mul_one", params: "a : Nat", conclusion: "a * 1 = a" },
        { name: "distrib", params: "a b c : Nat", conclusion: "a * (b + c) = a * b + a * c" },
        { name: "le_refl", params: "a : Nat", conclusion: "a ≤ a" },
        { name: "le_trans", params: "a b c : Nat", conclusion: "a ≤ b → b ≤ c → a ≤ c" },
        { name: "le_antisymm", params: "a b : Nat", conclusion: "a ≤ b → b ≤ a → a = b" },
        { name: "succ_pos", params: "n : Nat", conclusion: "0 < n.succ" },
        { name: "lt_succ", params: "n : Nat", conclusion: "n < n.succ" },
        { name: "eq_refl", params: "a : α", conclusion: "a = a" },
        { name: "eq_symm", params: "a b : α", conclusion: "a = b → b = a" },
        { name: "eq_trans", params: "a b c : α", conclusion: "a = b → b = c → a = c" },
        { name: "not_not", params: "p : Prop", conclusion: "¬¬p ↔ p" },
        { name: "and_comm", params: "p q : Prop", conclusion: "p ∧ q ↔ q ∧ p" },
        { name: "or_comm", params: "p q : Prop", conclusion: "p ∨ q ↔ q ∨ p" },
        { name: "and_assoc", params: "p q r : Prop", conclusion: "(p ∧ q) ∧ r ↔ p ∧ (q ∧ r)" },
        { name: "or_assoc", params: "p q r : Prop", conclusion: "(p ∨ q) ∨ r ↔ p ∨ (q ∨ r)" },
        { name: "length_nil", params: "α : Type", conclusion: "[].length = 0" },
        { name: "length_cons", params: "a : α, l : List α", conclusion: "(a :: l).length = l.length + 1" },
        { name: "append_nil", params: "l : List α", conclusion: "l ++ [] = l" },
        { name: "nil_append", params: "l : List α", conclusion: "[] ++ l = l" },
        { name: "append_assoc", params: "l₁ l₂ l₃ : List α", conclusion: "(l₁ ++ l₂) ++ l₃ = l₁ ++ (l₂ ++ l₃)" },
        { name: "map_nil", params: "f : α → β", conclusion: "List.map f [] = []" },
        { name: "map_cons", params: "f : α → β, a : α, l : List α", conclusion: "List.map f (a :: l) = f a :: List.map f l" },
        { name: "reverse_reverse", params: "l : List α", conclusion: "l.reverse.reverse = l" },
        { name: "mem_cons", params: "a b : α, l : List α", conclusion: "a ∈ (b :: l) ↔ a = b ∨ a ∈ l" },
        { name: "subset_refl", params: "s : Set α", conclusion: "s ⊆ s" },
        { name: "subset_trans", params: "s t u : Set α", conclusion: "s ⊆ t → t ⊆ u → s ⊆ u" },
        { name: "union_comm", params: "s t : Set α", conclusion: "s ∪ t = t ∪ s" },
        { name: "inter_comm", params: "s t : Set α", conclusion: "s ∩ t = t ∩ s" },
        { name: "union_assoc", params: "s t u : Set α", conclusion: "(s ∪ t) ∪ u = s ∪ (t ∪ u)" },
        { name: "inter_assoc", params: "s t u : Set α", conclusion: "(s ∩ t) ∩ u = s ∩ (t ∩ u)" },
        { name: "union_empty", params: "s : Set α", conclusion: "s ∪ ∅ = s" },
        { name: "inter_empty", params: "s : Set α", conclusion: "s ∩ ∅ = ∅" },
        { name: "union_univ", params: "s : Set α", conclusion: "s ∪ Set.univ = Set.univ" },
        { name: "inter_univ", params: "s : Set α", conclusion: "s ∩ Set.univ = s" },
        { name: "even_zero", params: "", conclusion: "Even 0" },
        { name: "odd_one", params: "", conclusion: "Odd 1" },
        { name: "even_add", params: "m n : Nat", conclusion: "Even m → Even n → Even (m + n)" },
        { name: "odd_add", params: "m n : Nat", conclusion: "Odd m → Odd n → Even (m + n)" },
        { name: "prime_two", params: "", conclusion: "Nat.Prime 2" },
        { name: "dvd_refl", params: "a : Nat", conclusion: "a ∣ a" },
        { name: "dvd_trans", params: "a b c : Nat", conclusion: "a ∣ b → b ∣ c → a ∣ c" },
        { name: "dvd_add", params: "a b c : Nat", conclusion: "a ∣ b → a ∣ c → a ∣ (b + c)" },
        { name: "gcd_comm", params: "a b : Nat", conclusion: "Nat.gcd a b = Nat.gcd b a" },
        { name: "lcm_comm", params: "a b : Nat", conclusion: "Nat.lcm a b = Nat.lcm b a" }
      ];
      
      // Use different concepts for variations (cycling through them)
      for (let i = 0; i < 49; i++) {
        const concept = mathConcepts[i % mathConcepts.length];
        const variant = `theorem ${concept.name} (${concept.params}) : ${concept.conclusion}`;
        variations.push(variant);
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

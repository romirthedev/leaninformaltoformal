import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, BookOpen, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GEMINI_API_KEY = "AIzaSyDJzAJF422SyZ99Z6CGihnJqKIDlQn4CfM";

export const LeanProofConverter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const convertToLeanProof = async () => {
    if (!input.trim()) {
      toast({
        title: "Please enter a statement",
        description: "You need to provide an informal statement to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setOutput("");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Convert this informal mathematical statement into a formal Lean 4 proof. Please provide only the Lean code without explanation:

"${input}"

Format the response as valid Lean 4 syntax with proper theorem statements, definitions, and proofs. Use appropriate Lean 4 tactics and make sure the syntax is correct.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "No result generated";
      
      setOutput(result);
      toast({
        title: "Conversion complete!",
        description: "Your informal statement has been converted to a Lean proof.",
      });
    } catch (error) {
      console.error("Error converting to Lean proof:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen vintage-paper p-6">
      <div className="w-full max-w-4xl mx-auto space-y-8 pt-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Lean Proof Converter</h1>
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your informal mathematical statements into formal Lean 4 proofs with the power of AI
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="elegant-shadow vintage-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Informal Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your informal mathematical statement here...

Example: 'The sum of two even numbers is even'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px] vintage-border resize-none focus:ring-primary/50"
                disabled={isLoading}
              />
              <Button
                onClick={convertToLeanProof}
                disabled={isLoading || !input.trim()}
                variant="elegant"
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Convert to Lean Proof
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="elegant-shadow vintage-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Lean 4 Proof
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[200px] p-4 bg-muted/50 rounded-md vintage-border font-mono text-sm">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : output ? (
                  <pre className="whitespace-pre-wrap text-foreground">{output}</pre>
                ) : (
                  <p className="text-muted-foreground italic">
                    Your Lean proof will appear here after conversion...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by Google Gemini AI • Built for mathematical precision</p>
        </div>
      </div>
    </div>
  );
};
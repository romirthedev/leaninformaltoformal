import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Lightbulb, Code, CheckCircle } from "lucide-react";

const HowToUse = () => {
  return (
    <div className="min-h-screen vintage-paper p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">How to Use</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to convert your informal mathematical statements into formal Lean 4 proofs
          </p>
        </div>

        {/* Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Getting Started */}
          <Card className="warm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Lightbulb className="h-5 w-5 text-primary" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">Enter Your Statement</h4>
                    <p className="text-sm text-muted-foreground">
                      Type your informal mathematical statement in plain English
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">Click Convert</h4>
                    <p className="text-sm text-muted-foreground">
                      Press the "Convert to Lean Proof" button to start the AI conversion
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">Get Your Proof</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive a formal Lean 4 proof that you can use in your projects
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card className="warm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Code className="h-5 w-5 text-primary" />
                Example Statements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-md vintage-border">
                  <p className="text-sm font-medium text-foreground">Input:</p>
                  <p className="text-sm text-muted-foreground italic">
                    "The sum of two even numbers is even"
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-md vintage-border">
                  <p className="text-sm font-medium text-foreground">Input:</p>
                  <p className="text-sm text-muted-foreground italic">
                    "If x equals y and y equals z, then x equals z"
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-md vintage-border">
                  <p className="text-sm font-medium text-foreground">Input:</p>
                  <p className="text-sm text-muted-foreground italic">
                    "The square root of 2 is irrational"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="warm-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="h-5 w-5 text-primary" />
              Tips for Better Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Writing Good Statements</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Be clear and specific about mathematical concepts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Use standard mathematical terminology when possible
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    State your assumptions and conclusions clearly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Keep statements focused on a single mathematical fact
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Understanding Results</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    The output is valid Lean 4 syntax
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    You may need to adjust variable names or types
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Complex proofs might require additional steps
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Always verify the proof in your Lean environment
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Lean Section */}
        <Card className="warm-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              About Lean 4
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Lean 4 is a modern theorem prover and programming language designed for 
                mathematical verification. It allows you to write formal proofs that can 
                be mechanically checked for correctness.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-accent/20 rounded-md vintage-border">
                  <h4 className="font-medium text-foreground mb-2">Precise</h4>
                  <p className="text-sm text-muted-foreground">
                    Every step must be logically valid
                  </p>
                </div>
                <div className="text-center p-4 bg-accent/20 rounded-md vintage-border">
                  <h4 className="font-medium text-foreground mb-2">Verified</h4>
                  <p className="text-sm text-muted-foreground">
                    Computer-checked mathematical proofs
                  </p>
                </div>
                <div className="text-center p-4 bg-accent/20 rounded-md vintage-border">
                  <h4 className="font-medium text-foreground mb-2">Modern</h4>
                  <p className="text-sm text-muted-foreground">
                    State-of-the-art theorem proving technology
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HowToUse;
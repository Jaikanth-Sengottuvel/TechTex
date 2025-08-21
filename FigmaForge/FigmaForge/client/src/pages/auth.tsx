import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Layers, ExternalLink } from "lucide-react";
import { figmaApi } from "@/lib/figma-api";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [authMode, setAuthMode] = useState<"token" | "oauth">("oauth");
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're returning from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      toast({
        title: "Authentication Error",
        description: "OAuth authentication failed. Please try again.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && email) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await figmaApi.handleOAuthCallback(code, email);
      toast({
        title: "Success",
        description: "Successfully authenticated with Figma!",
      });
      setLocation("/dashboard");
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Failed to complete OAuth flow",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleOAuthLogin = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const authUrl = await figmaApi.getAuthUrl();
      // Store email for callback
      localStorage.setItem('figma_auth_email', email);
      window.location.href = authUrl;
    } catch (error) {
      console.error('OAuth login error:', error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Failed to start OAuth flow",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleTokenLogin = async () => {
    if (!email || !accessToken) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and access token.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await figmaApi.login(email, accessToken);
      toast({
        title: "Success",
        description: "Successfully authenticated with Figma!",
      });
      setLocation("/dashboard");
    } catch (error) {
      console.error('Token login error:', error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load email from localStorage if available
  useEffect(() => {
    const storedEmail = localStorage.getItem('figma_auth_email');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary via-purple-500 to-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">TECHTEX</h1>
          <p className="text-muted-foreground mt-2">
            Connect your Figma account to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connect to Figma</CardTitle>
            <CardDescription>
              Choose your preferred authentication method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Authentication Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={authMode === "oauth" ? "default" : "outline"}
                onClick={() => setAuthMode("oauth")}
                className="flex-1"
              >
                OAuth (Recommended)
              </Button>
              <Button
                variant={authMode === "token" ? "default" : "outline"}
                onClick={() => setAuthMode("token")}
                className="flex-1"
              >
                Personal Token
              </Button>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {authMode === "oauth" ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    You'll be redirected to Figma to authorize TECHTEX to access your files and teams.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleOAuthLogin} 
                  disabled={loading || !email}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Connect with Figma
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Personal Access Token</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="figd_..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Alert>
                  <AlertDescription>
                    You can create a personal access token in your Figma account settings.
                    <a 
                      href="https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-1"
                    >
                      Learn how
                    </a>
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleTokenLogin} 
                  disabled={loading || !email || !accessToken}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Sign In
                </Button>
              </div>
            )}

            {/* Team ID Helper */}
            <Alert>
              <AlertDescription>
                <strong>Note:</strong> You'll need to provide your Figma team ID. You can find it in your Figma URL: 
                <code className="bg-muted px-1 py-0.5 rounded text-xs ml-1">
                  figma.com/files/team/[TEAM_ID]
                </code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

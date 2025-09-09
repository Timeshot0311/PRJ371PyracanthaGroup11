import { Link } from "@tanstack/react-router";
import { BarChart3, Camera, Users } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";

export function Hero() {
    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">Identify Pyracantha Plants with AI</h2>
                    <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
                        Protect your ecosystem with our AI powered detection system. Upload a plant image and get instant
                        identification of invasive species like Pyracantha, complete with confidence scores and species labels.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/upload">
                            <Button size="lg" className="flex items-center gap-2">
                                <Camera className="h-5 w-5"/>
                                Upload & Identify
                            </Button>
                        </Link>
                        <Link to="/analytics">
                            <Button variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
                                <BarChart3 className="h-5 w-5"/>
                                View Analytics
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary"/>
                                Community Hub
                            </CardTitle>
                            <CardDescription>Connect with fellow botanists and plant enthusiasts</CardDescription>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">
                            Share your pyracantha discoveries, get expert feedback, and learn from the community's collective
                            knowledge.
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary"/>
                                Data Insights
                            </CardTitle>
                            <CardDescription>Explore detection patterns and community statistics</CardDescription>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">
                            Discover trends in pyracantha distribution, seasonal patterns, and community engagement through
                            interactive visualizations.
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

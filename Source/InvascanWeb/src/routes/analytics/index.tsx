import { createFileRoute } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Camera, MapPin, Target, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/analytics/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
                    <p className="text-muted-foreground">Track pyracantha detection patterns across South Africa</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select defaultValue="6months">
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Time period"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1month">Last month</SelectItem>
                            <SelectItem value="3months">Last 3 months</SelectItem>
                            <SelectItem value="6months">Last 6 months</SelectItem>
                            <SelectItem value="1year">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Detections</CardTitle>
                        <Camera className="h-4 w-4 text-primary"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">1,247</div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3"/>
                            +18% from last month
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Confidence</CardTitle>
                        <Target className="h-4 w-4 text-primary"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">9.2/10</div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3"/>
                            +0.3 from last month
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Contributors</CardTitle>
                        <Users className="h-4 w-4 text-primary"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">89</div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3"/>
                            +12 new contributors
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Provinces Covered</CardTitle>
                        <MapPin className="h-4 w-4 text-primary"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">5/9</div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3"/>
                            Active in 5 provinces
                        </div>
                    </CardContent>
                </Card>
            </div>
            
        </div>
    );
}

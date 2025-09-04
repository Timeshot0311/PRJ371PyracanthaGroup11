import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";

export function CommunityComposer() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Share an update</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Input placeholder="What's happening in your area?"/>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Badge variant="outline">#water-hyacinth</Badge>
                        <Badge variant="outline">#id-help</Badge>
                    </div>
                    <Button size="sm" className="flex items-center gap-2">
                        <Plus className="size-4"/>
                        Post
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
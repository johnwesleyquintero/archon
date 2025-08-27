import { GripVertical } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function CustomizationHelpText() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-2">
          <GripVertical className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Customization Mode Active
            </p>
            <p className="text-sm text-blue-600">
              Drag widgets to rearrange them, resize by dragging corners, or use
              the controls in each widget header.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

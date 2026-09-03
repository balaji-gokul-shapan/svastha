import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FramerCard } from "@/util/FramerCard";
import React from "react";
import { Waves } from "lucide-react";



const AudioGramCard = ({ children }) => {
  return (
    <FramerCard>
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Waves className="size-4" />
                </div>

                <div>
                  <CardTitle className="text-base">
                    Pure Tone Audiometry
                  </CardTitle>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Hearing thresholds by frequency
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1.5">
                <span className="size-2 rounded-full bg-primary" />
                Right Ear
              </Badge>

              <Badge variant="outline" className="gap-1.5">
                <span className="size-2 rounded-full bg-warning" />
                Left Ear
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {children}
        </CardContent>
      </Card>
    </FramerCard>
  );
};

export default AudioGramCard;

import React from "react";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip } from "victory";
import { Observation } from "@/lib/api";

interface Props {
  data: Observation[];
  onPointClick: (lng: number, lat: number) => void;
}

const ObservationChart: React.FC<Props> = ({ data, onPointClick }) => {
  return (
    <VictoryChart domainPadding={20}>
      <VictoryAxis
        style={{ tickLabels: { angle: -45, fontSize: 10 } }}
         tickFormat={(t) => (typeof t === "string" ? t.slice(0, 3) : String(t).slice(0, 3))}
      />
      <VictoryBar
        data={data}
        x="month"
        y="count"
        labels={({ datum }) => `Obs: ${datum.count}`}
        labelComponent={<VictoryTooltip />}
        events={[
          {
            target: "data",
            eventHandlers: {
              onClick: (_, props) => {
                const { lng, lat } = props.datum;
                onPointClick(lng, lat);
              },
            },
          },
        ]}
        style={{ data: { fill: "#2563eb", cursor: "pointer" } }}
      />
    </VictoryChart>
  );
};

export default ObservationChart;

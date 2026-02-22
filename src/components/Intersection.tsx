import { TrafficState } from "@/hooks/useTrafficController";
import TrafficLight from "./TrafficLight";

interface IntersectionProps {
  lights: TrafficState;
}

const Intersection = ({ lights }: IntersectionProps) => {
  return (
    <div className="relative w-[340px] h-[340px] mx-auto select-none">
      {/* Grass corners */}
      <div className="absolute top-0 left-0 w-[110px] h-[110px] bg-grass rounded-br-lg" />
      <div className="absolute top-0 right-0 w-[110px] h-[110px] bg-grass rounded-bl-lg" />
      <div className="absolute bottom-0 left-0 w-[110px] h-[110px] bg-grass rounded-tr-lg" />
      <div className="absolute bottom-0 right-0 w-[110px] h-[110px] bg-grass rounded-tl-lg" />

      {/* Roads */}
      {/* Vertical road */}
      <div className="absolute top-0 left-[110px] w-[120px] h-full bg-road" />
      {/* Horizontal road */}
      <div className="absolute top-[110px] left-0 w-full h-[120px] bg-road" />

      {/* Center intersection */}
      <div className="absolute top-[110px] left-[110px] w-[120px] h-[120px] bg-road" />

      {/* Road markings - vertical dashes */}
      <div className="absolute top-[10px] left-[168px] w-[4px] h-[90px] flex flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full h-3 bg-marking rounded-full opacity-60" />
        ))}
      </div>
      <div className="absolute bottom-[10px] left-[168px] w-[4px] h-[90px] flex flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full h-3 bg-marking rounded-full opacity-60" />
        ))}
      </div>

      {/* Road markings - horizontal dashes */}
      <div className="absolute top-[168px] left-[10px] h-[4px] w-[90px] flex flex-row gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-full w-3 bg-marking rounded-full opacity-60" />
        ))}
      </div>
      <div className="absolute top-[168px] right-[10px] h-[4px] w-[90px] flex flex-row gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-full w-3 bg-marking rounded-full opacity-60" />
        ))}
      </div>

      {/* Traffic Lights */}
      <div className="absolute top-[6px] left-1/2 -translate-x-1/2">
        <TrafficLight color={lights.north} direction="North" />
      </div>
      <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2">
        <TrafficLight color={lights.south} direction="South" />
      </div>
      <div className="absolute left-[6px] top-1/2 -translate-y-1/2">
        <TrafficLight color={lights.west} direction="West" orientation="horizontal" />
      </div>
      <div className="absolute right-[6px] top-1/2 -translate-y-1/2">
        <TrafficLight color={lights.east} direction="East" orientation="horizontal" />
      </div>
    </div>
  );
};

export default Intersection;

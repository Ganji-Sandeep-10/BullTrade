import React from 'react';
import GlassButton from "@/components/ui/glass-button";
import { ArrowUpRight } from "lucide-react";

const TradingButton = () => {
  return (
    <div className="trading-button-wrap">
      <img
        className="trading-button-leaf trading-button-leaf-left"
        src="https://framerusercontent.com/images/hBMZlloFmBjtUPD0n9zXkjRlL7g.png?scale-down-to=1024&width=1024&height=1536"
        alt=""
        aria-hidden="true"
      />
      <GlassButton>
        <span className="flex items-center gap-2">
          Start Trading
          <ArrowUpRight className="w-5 h-5" />
        </span>
      </GlassButton>
      <img
        className="trading-button-leaf trading-button-leaf-right"
        src="https://framerusercontent.com/images/MnEKWwyk8gOp2WRXaEYlpVBxQ.png?scale-down-to=1024&width=2048&height=3072"
        alt=""
        aria-hidden="true"
      />
    </div>
  );
};

export default TradingButton;

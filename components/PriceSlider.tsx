"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface PriceSliderProps {
  minPrice: number;
  maxPrice: number;
  maxAllowedPrice: number;
  minAllowedPrice: number;
}

export function PriceSlider({ minPrice, maxPrice, maxAllowedPrice, minAllowedPrice }: PriceSliderProps) {
  const [value, setValue] = useState([minPrice, maxPrice]);

  const handleValueChange = (newValue: number | readonly number[]) => {
    if (Array.isArray(newValue)) {
      setValue([...newValue]);
    }
  };

  // Only send values if they differ from defaults
  const shouldSendMinPrice = value[0] > minAllowedPrice;
  const shouldSendMaxPrice = value[1] < maxAllowedPrice;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">
        نطاق السعر: ${value[0]} - ${value[1]}
      </label>
      <div dir="ltr">
        <Slider
          value={value}
          onValueChange={handleValueChange}
          max={maxAllowedPrice}
          min={minAllowedPrice}
          step={10}
          className="mx-auto w-full py-4"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>${minAllowedPrice}</span>
        <span>${maxAllowedPrice}</span>
      </div>
      {shouldSendMinPrice && <input type="hidden" name="minPrice" value={value[0]} />}
      {shouldSendMaxPrice && <input type="hidden" name="maxPrice" value={value[1]} />}
    </div>
  );
}

"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type AppSelectProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options: SelectOption[];
  onValueChange?: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export default function AppSelect({
  name,
  value,
  defaultValue,
  placeholder = "Select an option",
  options,
  onValueChange,
  className,
  triggerClassName,
  contentClassName,
}: AppSelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;

  const handleValueChange = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <div className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={currentValue} /> : null}
      <Select.Root value={value ?? internalValue} defaultValue={defaultValue} onValueChange={handleValueChange}>
        <Select.Trigger className={cn("app-select-trigger", triggerClassName)} aria-label={placeholder}>
          <Select.Value placeholder={placeholder} />
          <Select.Icon className="text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="popper" sideOffset={8} className={cn("app-select-content", contentClassName)}>
            <Select.Viewport className="p-1.5">
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className="app-select-item">
                  <span className="app-select-item__indicator">
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

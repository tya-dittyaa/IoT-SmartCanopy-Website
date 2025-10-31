import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDevice } from "@/contexts/device-context";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface DeviceSelectorProps {
  onDeviceSelect?: (deviceId: string) => void;
}

export default function DeviceSelector({
  onDeviceSelect,
}: DeviceSelectorProps) {
  const {
    selectedDeviceId,
    setSelectedDeviceId,
    availableDevices,
    selectedDevice,
  } = useDevice();

  const [open, setOpen] = useState(false);

  const isSelectedDeviceConnected = !!selectedDevice?.isConnected;

  useEffect(() => {
    if (isSelectedDeviceConnected) setOpen(false);
  }, [isSelectedDeviceConnected]);

  const handleDeviceSelect = useCallback(
    (currentValue: string) => {
      const newSelectedId =
        currentValue === selectedDeviceId ? "" : currentValue;
      setSelectedDeviceId(newSelectedId);
      setOpen(false);
      onDeviceSelect?.(newSelectedId);
    },
    [selectedDeviceId, setSelectedDeviceId, onDeviceSelect]
  );

  const buttonText = useMemo(() => {
    if (availableDevices.length === 0) return "No device available";
    if (!selectedDeviceId) return "No device selected";
    return selectedDevice ? selectedDevice.name : selectedDeviceId;
  }, [availableDevices.length, selectedDeviceId, selectedDevice]);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm h-10"
            size="default"
            disabled={
              availableDevices.length === 0 || isSelectedDeviceConnected
            }
          >
            {buttonText}
            <ChevronsUpDownIcon className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {availableDevices.length > 0 && (
          <PopoverContent className="w-[300px] p-0" align="start" side="bottom">
            <Command>
              <CommandList>
                <CommandEmpty>No device found.</CommandEmpty>
                <CommandGroup>
                  {availableDevices.map((device) => {
                    return (
                      <CommandItem
                        key={device.deviceId}
                        value={device.deviceId}
                        onSelect={handleDeviceSelect}
                        className="text-sm py-3"
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-3 w-3",
                            selectedDeviceId === device.deviceId
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {device.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {device.deviceId}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

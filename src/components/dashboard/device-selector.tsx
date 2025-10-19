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
import React from "react";

interface DeviceSelectorProps {
  onDeviceSelect?: (deviceId: string) => void;
}

export default function DeviceSelector({
  onDeviceSelect,
}: DeviceSelectorProps) {
  const { selectedDeviceId, setSelectedDeviceId, availableDevices } =
    useDevice();

  const [open, setOpen] = React.useState(false);

  const handleDeviceSelect = (deviceId: string) => {
    const newSelectedId = deviceId === selectedDeviceId ? "" : deviceId;
    setSelectedDeviceId(newSelectedId);
    setOpen(false);
    onDeviceSelect?.(newSelectedId);
  };

  const getSelectedDeviceStatus = (): string => {
    if (!selectedDeviceId) return "No device selected";

    const selectedDevice = availableDevices.find(
      (device) => device.deviceId === selectedDeviceId
    );
    return selectedDevice ? selectedDevice.name : selectedDeviceId;
  };

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
            disabled={availableDevices.length === 0}
          >
            {availableDevices.length === 0
              ? "No device available"
              : getSelectedDeviceStatus()}
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
                        onSelect={() => handleDeviceSelect(device.deviceId)}
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

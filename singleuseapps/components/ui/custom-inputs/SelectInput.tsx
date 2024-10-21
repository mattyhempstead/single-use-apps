import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectItemType<T> = { value: T; label: string } | string;

const SelectInput = <T extends string | number | boolean>({
  value,
  onChange,
  items,
  placeholder = "",
  showPlaceholderAsOption = false,
  className = "",
}: {
  value: T | null;
  onChange: (value: T | null) => void;
  items: SelectItemType<T>[];
  placeholder?: string;
  showPlaceholderAsOption?: boolean;
  className?: string;
}) => {
  const getItemValue = (item: SelectItemType<T>): T =>
    typeof item === "string" ? (item as T) : item.value;
  const getItemLabel = (item: SelectItemType<T>): string =>
    typeof item === "string" ? item : item.label;

  const handleChange = (value: string) => {
    if (value === "__null__") {
      onChange(null);
    } else {
      const selectedItem = items.find(
        (item) => String(getItemValue(item)) === value,
      );
      if (selectedItem !== undefined) {
        onChange(getItemValue(selectedItem));
      } else {
        console.error("Selected item not found in items list?", value, items);
        throw new Error();
      }
    }
  };

  return (
    <Select
      value={value === undefined || value === null ? "" : String(value)}
      onValueChange={handleChange}
    >
      <SelectTrigger className={className}>
        <SelectValue
          placeholder={
            <span className="text-muted-foreground">{placeholder}</span>
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {showPlaceholderAsOption && (
            <SelectItem value="__null__">
              <span className="text-muted-foreground">{placeholder}</span>
            </SelectItem>
          )}
          {items.map((item, index) => (
            <SelectItem key={index} value={String(getItemValue(item))}>
              {getItemLabel(item)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectInput;

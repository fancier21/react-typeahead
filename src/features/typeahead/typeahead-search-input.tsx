import { Input } from "../../shared/ui";

type Props = {
  isOpen: boolean;
  value: string;
  loading?: boolean;
  onChange: (value: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onClear?: (event: React.MouseEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
};

export const SearchInput: React.FC<Props> = ({
  isOpen,
  value,
  loading,
  onChange,
  onFocus,
  onClear,
  inputRef,
}) => {
  return (
    <div className="typeahead-input-wrap">
      <div className="typeahead-icon search-icon">
        <span className="material-symbols-outlined">
          {loading ? "progress_activity" : "search"}
        </span>
      </div>
      <Input
        className="typeahead-input"
        type="search"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder="Search..."
        ref={inputRef}
      />
      {value && isOpen && (
        <button className="typeahead-icon cancel-icon" onClick={onClear}>
          <span className="material-symbols-outlined">cancel</span>
        </button>
      )}
    </div>
  );
};

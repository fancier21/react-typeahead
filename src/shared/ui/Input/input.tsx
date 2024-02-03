import React, { ChangeEvent, FocusEvent, forwardRef, Ref } from "react";

interface InputProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const Input: React.ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { type, value, onChange, onFocus, onBlur, placeholder, className },
  ref: Ref<HTMLInputElement>,
) => {
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.trim());
  };

  return (
    <input
      type={type}
      value={value}
      onChange={onChangeHandler}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      ref={ref}
    />
  );
};

const ForwardedInput = forwardRef<HTMLInputElement, InputProps>(Input);

export default ForwardedInput;

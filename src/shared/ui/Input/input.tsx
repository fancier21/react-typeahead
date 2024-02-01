import React, { FC, ChangeEvent } from "react";

interface InputProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Input: FC<InputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  className,
}) => {
  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type={type}
      value={value}
      onChange={onChangeHandler}
      placeholder={placeholder}
      className={className}
    />
  );
};

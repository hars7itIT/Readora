import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  let styleClass = '';
  if (variant === 'secondary') styleClass = 'secondary-button';
  else if (variant === 'icon') styleClass = 'icon-button';
  else if (variant === 'ghost') styleClass = 'back-button';

  return (
    <button className={`${styleClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};

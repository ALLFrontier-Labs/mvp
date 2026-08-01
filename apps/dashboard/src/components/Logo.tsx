import React from 'react';
import { Link } from 'react-router-dom';
import { DaemonLogo } from './DaemonLogo';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 28, showText = true, className = '' }) => {
  return (
    <Link to="/" className={`group flex items-center focus:outline-none shrink-0 ${className}`}>
      <DaemonLogo size={size} showText={showText} />
    </Link>
  );
};

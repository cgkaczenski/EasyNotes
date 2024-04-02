import { logout } from "@/actions/logout";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const LogoutButton = ({
  children,
  className,
  onClick,
}: LogoutButtonProps) => {
  const handleClick = () => {
    logout();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div onClick={handleClick} className={cn("cursor-pointer", className)}>
      {children}
    </div>
  );
};

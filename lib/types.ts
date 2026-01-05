export interface Prize {
  id: number;
  label: string;
  icon: string;
  description: string;
  color: string;
  image_url?: string | null;
  points_value?: number;
  coins_reward: number;
  xp_reward: number;
}

export interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  route: string;
  disabled?: boolean;
}

export interface BalancePillProps {
  balance: number;
  xp?: number;
}

export interface WheelProps {
  prizes: Prize[];
  rotation: number;
  isSpinning: boolean;
  size?: 'normal' | 'large';
}

export interface SpinButtonProps {
  cost: number;
  balance: number;
  isSpinning: boolean;
  onSpin: () => void;
}

export interface PrizeListProps {
  prizes: Prize[];
  onPrizeClick: (prize: Prize) => void;
}

export interface WinModalProps {
  isOpen: boolean;
  prize: Prize | null;
  onClose: () => void;
}

export interface PrizeModalProps {
  isOpen: boolean;
  prize: Prize | null;
  onClose: () => void;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface GameState {
  balance: number;
  xp: number;
  isSpinning: boolean;
  selectedPrize: Prize | null;
  currentRotation: number;
  isWinModalOpen: boolean;
  isPrizeModalOpen: boolean;
  viewingPrize: Prize | null;
}

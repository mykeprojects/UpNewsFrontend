import asiscoLogo from '@/assets/images/logo-asisco.png';

export interface BrandProps {
  light?: boolean;
}

export function Brand({ light = false }: BrandProps) {
  return (
    <button className="brand" aria-label="Ir al inicio">
      <img src={asiscoLogo} alt="ASISCO" />
      <span className={light ? 'light' : ''}>UPNEWS</span>
    </button>
  );
}

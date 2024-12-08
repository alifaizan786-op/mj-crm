import { helix } from 'ldrs';

export default function Loader({ size, speed, color }) {
  helix.register();

  return (
    <l-helix
      size={size || '45'}
      speed={speed || '2.5'}
      color={color || '#103783'}></l-helix>
  );
}

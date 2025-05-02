import { useEffect } from 'react';
import './App.css';
import { hello } from '../pkg/typer_concierge_web';

export default () => {
  useEffect(() => {
    hello();
  }, []);

  return (
    <></>
  );
}

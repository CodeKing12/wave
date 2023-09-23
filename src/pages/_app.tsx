import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { init } from '@noriginmedia/norigin-spatial-navigation';
import { AlertProvider } from './AlertContext';
import Alerts from '@/components/Alerts';

export default function App({ Component, pageProps }: AppProps) {
  init({
    // options
  });

  return (
    <AlertProvider>
      <Component {...pageProps} />
      <Alerts />
    </AlertProvider>
  )
}

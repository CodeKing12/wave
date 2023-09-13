import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { init } from '@noriginmedia/norigin-spatial-navigation';

export default function App({ Component, pageProps }: AppProps) {
  init({
    // options
  });

  return <Component {...pageProps} />
}

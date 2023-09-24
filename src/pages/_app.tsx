import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { init } from '@noriginmedia/norigin-spatial-navigation';
import AlertProvider from './AlertContext';
import Alerts from '@/components/Alerts';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  init({
    // options
  });

  return (
    <AlertProvider>
      <Head>
        <meta http-equiv="cache-control" content="max-age=0" />
        <meta http-equiv="cache-control" content="no-cache" />
        <meta http-equiv="expires" content="0" />
        <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
        <meta http-equiv="pragma" content="no-cache" />
      </Head>
      <Component {...pageProps} />
      <Alerts />
    </AlertProvider>
  )
}

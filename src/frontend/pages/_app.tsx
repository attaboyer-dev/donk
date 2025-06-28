import { AppProps } from "next/app";
import "../styles/App.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps}></Component>;
}

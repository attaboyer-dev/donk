import { AppProps } from "next/app";
import "../styles/App.css";
import "../styles/index.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps}></Component>;
}

import { AppProps } from "next/app";
import "../styles/App.css";
import "../styles/index.css";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { ApiProvider } from "../contexts/ApiContext";

const theme = createTheme({
  palette: {
    mode: "light", // or 'dark'
  },
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApiProvider>
        <Component {...pageProps}></Component>
      </ApiProvider>
    </ThemeProvider>
  );
}

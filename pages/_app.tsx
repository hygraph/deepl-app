import "../styles/globals.css";
import type { AppProps } from "next/app";
import { BaukastenProvider } from "@hygraph/baukasten";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <BaukastenProvider global>
            <Component {...pageProps} />
        </BaukastenProvider>
    );
}

export default MyApp;

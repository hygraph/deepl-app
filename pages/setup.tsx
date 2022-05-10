import { useApp, Wrapper } from "@graphcms/app-sdk-react";
import { useState } from "react";

function Setup() {
    // @ts-expect-error
    const { installation } = useApp();
    if (installation) {
        const { config } = installation;
        return <Configure config={config} />;
    }
    return <Install />
}

function Install() {
    // @ts-expect-error
    const { updateInstallation } = useApp();
    return (
        <button onClick={() => updateInstallation({ status: 'PENDING', config: {} })}>
            Install App
        </button>
    );
}

function Configure({ config }: any) {
    const [apiKey, setApiKey] = useState(config.API_KEY);
    // @ts-expect-error
    const { updateInstallation } = useApp();

    return (
        <div>
            <h2>Settings</h2>
            <form>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <strong>API Key:</strong>
                    <input type='text' value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                </div>
                <div>
                    <button onClick={async () => await updateInstallation({ status: 'COMPLETED', config: { API_KEY: apiKey } })}>Save</button>
                </div>
            </form>
        </div>
    );
}

export default function Page() {
    return (
        <Wrapper>
            <Setup />
        </Wrapper>
    );
}
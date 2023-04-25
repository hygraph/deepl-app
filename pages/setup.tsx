import { useApp, Wrapper } from "@hygraph/app-sdk-react";
import {
    Box,
    Button,
    Heading,
    Inline,
    Input,
    Stack,
    Text,
} from "@hygraph/baukasten";
import Image from "next/image";
import { useState } from "react";

function Setup() {
    const { installation } = useApp();
    const { config } = installation;
    return <Configure config={config} />;
}

function Configure({ config }: any) {
    const [apiKey, setApiKey] = useState(config.API_KEY);
    const { installation, updateInstallation } = useApp();
    const [loading, setLoading] = useState(false);

    // @ts-ignore
    const appName = installation.app.name;
    // @ts-ignore
    const appDescription = installation.app.description;

    const buttonLabel = installation.status === "PENDING" ? "Install" : "Save";

    return (
        <Stack gap="24px" width="50%">
            <Heading display="flex" alignItems="center">
                <Image
                    src="https://static.deepl.com/img/logo/deepl-logo-blue.svg"
                    width="50"
                    height="50"
                    alt={appName}
                />
                <span style={{ marginLeft: 8 }}>{appName}</span>
            </Heading>
            <Text fontSize="15px">{appDescription}</Text>
            <Box flexDirection="column">
                <label htmlFor="api-key" style={{ fontWeight: 500 }}>
                    API Key:
                </label>
                <Input
                    id="api-key"
                    value={apiKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setApiKey(e.target.value)
                    }
                />
            </Box>
            <Inline>
                <Button
                    size="large"
                    loading={loading}
                    loadingText="Saving..."
                    onClick={async () => {
                        setLoading(true);
                        await updateInstallation({
                            status: "COMPLETED",
                            config: { API_KEY: apiKey },
                        });
                        setLoading(false);
                    }}
                >
                    {buttonLabel}
                </Button>
            </Inline>
        </Stack>
    );
}

export default function Page() {
    return (
        <Wrapper>
            <Setup />
        </Wrapper>
    );
}

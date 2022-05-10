import { useApp, Wrapper } from "@graphcms/app-sdk-react";

export default function FormSidebar() {
    console.log('sidebar:', useApp());
    return (
        <Wrapper>
            <button>Translate</button>
        </Wrapper>
    )
}
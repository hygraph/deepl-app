import { Wrapper } from "@graphcms/app-sdk-react";
import dynamic from "next/dynamic";

const DynamicComponentWithNoSSR = dynamic(
    () => import('../components/SidebarElement'),
    { ssr: false }
)

export default function FormSidebar() {
    return (
        <Wrapper>
            <DynamicComponentWithNoSSR />
        </Wrapper>
    )
}




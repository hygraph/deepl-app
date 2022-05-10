import { useApp, useFormSidebarExtension, Wrapper } from "@graphcms/app-sdk-react";

export default function FormSidebar() {
    return (
        <Wrapper>
            <SidebarElement />
        </Wrapper>
    )
}

const SidebarElement = () => {
    const { extension, form } = useFormSidebarExtension();
    console.log('extension:', extension);
    console.log('form:', form);
    console.log('app:', useApp());

    async function handleTranslate() {
        const titleField = await form.getFieldState('localization_en.title');
        console.log('Title:', titleField?.value);
        
    }

    return (
        <button onClick={handleTranslate}>Translate</button>
    )
}
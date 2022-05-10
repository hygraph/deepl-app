import { useState, useEffect } from "react";

import { useApp, useFormSidebarExtension, Wrapper } from "@graphcms/app-sdk-react";

import { Button, Stack } from "@mui/material";
import TranslateIcon from '@mui/icons-material/Translate';

// import { astToHtmlString } from '@graphcms/rich-text-html-renderer';
// import htmlToSlateAST from '@graphcms/html-to-slate-ast';

import axios from "axios";

export default function FormSidebar() {
    return (
        <Wrapper>
            <SidebarElement />
        </Wrapper>
    )
}

const SidebarElement = () => {
    const { showToast } = useApp();
    const { allLocales, extension, form: { getFieldState, change, subscribeToFormState } } = useFormSidebarExtension();
    const [translatableFields, setTranslatableFields] = useState([]);
    const [buttonLabel, setButtonLabel] = useState('Translate');

    const getDefaultLanguage = allLocales.filter((lang) => lang.isDefault);
    const sourceLanguage = getLanguageCode(getDefaultLanguage[0].apiId);
    const defaultLanguage = 'localization_' + sourceLanguage;

    const apiKey = extension.config.API_KEY;

    useEffect(() => {

        const getTranslatableFields = (formFields: any) => {
            const fields = Object.entries(formFields.modified);
            const translatableFields: any[] = [];
            const defaultFields: any[] = [];

            fields.map((field) => {
                let fieldKey = field[0];
                if (fieldKey.startsWith('localization_')) {
                    if (fieldKey.startsWith(defaultLanguage)) {
                        defaultFields.push(fieldKey);
                    } else {
                        translatableFields.push(fieldKey);
                    }
                }
                return true;
            });

            return {
                defaultFields,
                translatableFields,
            };
        }

        let unsubscribe: any;
        subscribeToFormState(
            (state: any) => {
                const { defaultFields, translatableFields } = getTranslatableFields(state);
                // console.log('translatable:', { defaultFields, translatableFields })
                setTranslatableFields(translatableFields as never);
            },
            {
                modified: true
            }
        ).then((formState: any) => unsubscribe = formState);

        return () => {
            unsubscribe?.();
        }
    }, [subscribeToFormState, defaultLanguage]);

    const translate = () => {

        setButtonLabel('Translating...');

        // console.log('translatableFields:', translatableFields);
        // console.log('defaultLanguageFields:', defaultLanguageFields);

        translatableFields.map((field: any, index: number, arrFields: never[]) => {
            const isLastItem = index + 1 === arrFields.length;
            const [fieldPrefix, fieldApiId] = field.split('.');
            const targetLanguage = getLanguageCode(fieldPrefix);

            const defaultLanguageField = defaultLanguage + '.' + fieldApiId;
            getFieldState(defaultLanguageField).then(({ value }: any) => {

                let textToTranslate: any = value;
                let isRichTextEditor = textToTranslate.hasOwnProperty('raw') ? true : false;

                // Rich Text Editor - Transform AST to HTML
                if(isRichTextEditor) {
                    // textToTranslate = astToHtmlString({content});
                    // console.log('html:', textToTranslate);
                }

                axios.post(
                    '/api/translate',
                    {
                        q: textToTranslate,
                        source: sourceLanguage,
                        target: targetLanguage,
                        apiKey,
                    }
                ).then((response: any) => {
                    if (response?.data?.text) {
                        let newText = response?.data?.text;

                        // @todo: add support to RTE
                        // // RTE - HTML to AST
                        if (isRichTextEditor) {
                            // console.log('html ' + targetLanguage + ':', newText);
                            // htmlToSlateAST(newText).then((astValue) => {
                            //     const content = {
                            //         raw: {
                            //             children: astValue
                            //         }
                            //     };
                            //     // console.log(`ast ${targetLanguage}:`, content);
                            //     change(`${fieldPrefix}.${fieldApiId}`, content);
                            // });
                            change(`${fieldPrefix}.${fieldApiId}`, JSON.parse(newText));
                            // console.log(`Skipping RTE...`);
                        } else {
                            change(`${fieldPrefix}.${fieldApiId}`, newText);
                        }
                    }

                    setButtonLabel('Translate');

                    // Check whether it's the last item
                    // to prevent displaying toast multiple times
                    if (isLastItem) {
                        showToast({
                            variantColor: 'success',
                            title: 'Content has been translated!',
                        })
                    }
                }).catch((error) => {
                    console.log(error);
                    setButtonLabel('Translate');
                    if (isLastItem) {
                        showToast({
                            variantColor: 'error',
                            title: 'Something went wrong! Check console!',
                        })
                    }
                });

            });

            return true;
        });

    }

    return (
        <Stack>
            <Button startIcon={<TranslateIcon />} variant='contained' size='small' onClick={translate} disableElevation>{buttonLabel}</Button>
        </Stack>
    );
}

const getLanguageCode = (languageCode: string): string => {
    if (languageCode.startsWith('localization_')) {
        return languageCode.slice(-2);
    } else {
        return languageCode.substring(0, 2);
    }
}


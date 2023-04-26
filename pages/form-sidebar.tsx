import { useState, useEffect } from "react";

import {
    useApp,
    useFormSidebarExtension,
    Wrapper,
} from "@hygraph/app-sdk-react";

import { Button, Stack } from "@hygraph/baukasten";
import { Locale } from "@hygraph/icons";

// import { astToHtmlString } from '@graphcms/rich-text-html-renderer';
// import htmlToSlateAST from '@graphcms/html-to-slate-ast';

import axios from "axios";

const slugify = require("slugify");

export default function FormSidebar() {
    return (
        <Wrapper>
            <SidebarElement />
        </Wrapper>
    );
}

/**
 * Hygraph localization field names returned by the App SDK are in the format:
 * "localization_xx.field_name" for top level fields and
 * "fieldApiId[0].localization_xx.field_name" for nested fields
 *
 * This function converts the field name to the format:
 * "localizations.xx.field_name" for top level fields and
 * "fieldApiId.0.localizations.xx.field_name" for nested fields
 *
 * @param input field name
 * @returns
 */
function normalizeFieldName(input: string): string {
    // Replace square brackets with dots
    let transformed = input.replace(/\[/g, ".").replace(/\]/g, "");

    // Split the string into an array based on the dots
    let parts = transformed.split(".");

    // Iterate through the parts and convert them to the desired format
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];

        // Check if the part matches the pattern: "localization_xx"
        if (/^localization_[a-z]{2}$/.test(part)) {
            // Replace the underscore with a dot and update the array
            // Also, change "localization" to "localizations"
            parts[i] = "localizations." + part.split("_")[1];
        }
    }

    // Join the parts back into a string with dots
    return parts.join(".");
}

const SidebarElement = () => {
    const { showToast } = useApp();
    const {
        allLocales,
        extension,
        form: { getFieldState, change, subscribeToFormState },
    } = useFormSidebarExtension();
    const [defaultFields, setDefaultFields] = useState<string[]>([]);
    const [translatableFields, setTranslatableFields] = useState<string[]>([]);
    const [buttonLabel, setButtonLabel] = useState("Translate");
    const [loading, setLoading] = useState(false);

    const getDefaultLanguage = allLocales.filter((lang) => lang.isDefault);
    const sourceLanguage = getDefaultLanguage[0].apiId;
    const defaultLanguage = "localizations." + sourceLanguage;

    const apiKey = extension.config.API_KEY;

    useEffect(() => {
        const getTranslatableFields = (formFields: any) => {
            const fields = Object.entries(formFields.modified);
            const defaultFields: string[] = [];
            const translatableFields: string[] = [];
            fields.map((field) => {
                let fieldKey = field[0];
                if (fieldKey.includes("localization_")) {
                    const newFieldKey = normalizeFieldName(fieldKey);
                    if (newFieldKey.includes(defaultLanguage)) {
                        defaultFields.push(newFieldKey);
                    } else {
                        translatableFields.push(newFieldKey);
                    }
                }
                return true;
            });

            setDefaultFields(defaultFields);
            setTranslatableFields(translatableFields);

            console.log("getTranslatableFields:", {
                defaultFields,
                translatableFields,
            });

            return {
                defaultFields,
                translatableFields,
            };
        };

        let unsubscribe: any;
        subscribeToFormState(
            (state: any) => {
                getTranslatableFields(state);
            },
            {
                modified: true,
            }
        ).then((formState: any) => (unsubscribe = formState));

        return () => {
            unsubscribe?.();
        };
    }, [subscribeToFormState, defaultLanguage]);

    const translate = () => {
        if (translatableFields.length === 0) return;

        setLoading(true);
        setButtonLabel("Translating...");

        translatableFields.map(
            (field: any, index: number, arrFields: string[]) => {
                const isLastItem = index + 1 === arrFields.length;
                const targetLanguage = getLanguageCode(field);
                const targetField = field;
                const fieldToTranslate = defaultFields[index];

                console.log("targetLanguage:", targetLanguage);
                console.log("fieldToTranslate:", fieldToTranslate);

                getFieldState(fieldToTranslate).then(({ value }: any) => {
                    let textToTranslate: any = value;
                    // let isRichTextEditor = textToTranslate.hasOwnProperty("raw")
                    //     ? true
                    //     : false;

                    // // Rich Text Editor - Transform AST to HTML
                    // if (isRichTextEditor) {
                    //     textToTranslate = astToHtmlString({content});
                    //     console.log('html:', textToTranslate);
                    // }

                    if (!textToTranslate) return;

                    axios
                        .post("/api/translate", {
                            q: textToTranslate,
                            source: sourceLanguage,
                            target: targetLanguage,
                            apiKey,
                        })
                        .then((response: any) => {
                            if (response?.data?.text) {
                                let newText = response?.data?.text;

                                // // @todo: add support to RTE
                                // // RTE - HTML to AST
                                // if (isRichTextEditor) {
                                //     // console.log('html ' + targetLanguage + ':', newText);
                                //     // htmlToSlateAST(newText).then((astValue) => {
                                //     //     const content = {
                                //     //         raw: {
                                //     //             children: astValue
                                //     //         }
                                //     //     };
                                //     //     // console.log(`ast ${targetLanguage}:`, content);
                                //     //     change(`${fieldPrefix}.${fieldApiId}`, content);
                                //     // });
                                //     change(
                                //         `${fieldPrefix}.${fieldApiId}`,
                                //         JSON.parse(newText)
                                //     );
                                //     // console.log(`Skipping RTE...`);
                                // } else {
                                // TODO: Add support for slug fields
                                // This is a temporary solution
                                change(
                                    targetField,
                                    targetField.includes("slug")
                                        ? slugify(newText, { lower: true })
                                        : newText
                                );
                                // }
                            }

                            // Check whether it's the last item
                            // to prevent displaying toast multiple times
                            if (isLastItem) {
                                showToast({
                                    variantColor: "success",
                                    title: "Content has been translated!",
                                });
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            if (isLastItem) {
                                showToast({
                                    variantColor: "error",
                                    title: "Something went wrong! Check console!",
                                });
                            }
                        })
                        .finally(() => {
                            setLoading(false);
                            setButtonLabel("Translate");
                        });
                });

                return true;
            }
        );
    };

    return (
        <Stack>
            <Button
                // @ts-ignore
                iconBefore={Locale}
                size="large"
                onClick={translate}
                width="100%"
                loading={loading}
                loadingText={buttonLabel}
                disabled={translatableFields.length === 0}
            >
                {buttonLabel}
            </Button>
        </Stack>
    );
};

const getLanguageCode = (fieldKey: string): string => {
    const fieldParts = fieldKey.split(".");
    const fieldLanguage = fieldParts.slice(-2, -1).toString();
    return fieldLanguage;
};

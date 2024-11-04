import { useTranslation } from 'react-i18next';
import EditorQuill from '../EditorQuill';
import React from 'react';
import { formData } from '../types';

interface EditTextProps {
    setFormData: React.Dispatch<React.SetStateAction<formData>>;
    handleEditText : () => void;
    formData : formData;
}

const EditText: React.FC<EditTextProps> = ({ setFormData, handleEditText, formData }) => {

    const { t } = useTranslation(['Editor', 'Description', 'Patterns']);

    return (
        <>
            <div className="p-4 w-80 min-h-full bg-base-200 text-base-content">
                <p className="menu-title">{t("edit_text")}</p>

                <EditorQuill
                    Text={formData.text}
                    SetText={(html: string) => setFormData(prevState => ({
                        ...prevState,
                        text: html,
                    }))}
                />

                <button
                    className='btn btn-primary w-full my-6'
                    onClick={handleEditText}>
                    {t("send")}
                </button>
            </div>
        </>)

                }
export default EditText;
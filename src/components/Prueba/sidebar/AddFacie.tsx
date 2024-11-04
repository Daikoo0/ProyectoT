import { Facies } from '../types';
import { useTranslation } from 'react-i18next';

interface AddFacieProps {
    changeformFacie: (e: any) => void;
    handleAddFacie: () => void;
    facies: Record<string, Facies[]>;
}

const AddFacie: React.FC<AddFacieProps> = ({ changeformFacie, handleAddFacie, facies }) => {

    const { t } = useTranslation(['Editor', 'Description', 'Patterns']);

    return (
        <>
            <div className="p-4 w-80 min-h-full bg-base-200 text-base-content shadow-xl rounded-lg">
                <p className="menu-title text-lg font-bold mb-4">{t("add_facie")}</p>
                <p className="mb-1 font-medium text-sm">{t("e_facies")}</p>
                <ul className="list-disc list-inside">
                    {Object.keys(facies).map((key, index) => (
                        <li key={index}>{key} - {index}</li>
                    ))}
                </ul>

                <div className="mb-4 ">
                    <label htmlFor="nombre" className="block text-sm font-medium">{t("facie_name")}</label>
                    <input type='text' name='facie' onChange={changeformFacie} className="input input-bordered w-full mt-1" />
                </div>
                <button className="btn btn-primary w-full" onClick={handleAddFacie}>
                    <p>{t("new_facie_confirm")}</p>
                </button>
            </div>
        </>
    )
}

export default AddFacie;
import { useTranslation } from 'react-i18next';
import { formMuestra } from '../types';

interface EditMuestraProps {
    formMuestra : formMuestra,
    changeFormMuestra : (e: any) => void;
    handleMuestraEdit : () => void;
    alturaTd : number;
    handleDeleteMuestra : () => void
}

const EditMuestra: React.FC<EditMuestraProps> = ({ formMuestra, changeFormMuestra, handleMuestraEdit, alturaTd, handleDeleteMuestra }) => {

    const { t } = useTranslation(['Editor']);

    return (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li className="menu-title">Editar muestra</li>

            <li>
                <label>{t("lim_sup")}</label>
                <input
                    type="number"
                    name='upper'
                    value={formMuestra.upper}
                    onChange={changeFormMuestra}
                />
            </li>
            <li>
                <label>{t("lim_inf")}</label>
                <input
                    type="number"
                    name='lower'
                    value={formMuestra.lower}
                    onChange={changeFormMuestra}
                />
            </li>
            <li>
                <button className="btn btn-primary" onClick={handleMuestraEdit}
                    disabled={formMuestra.lower > alturaTd || formMuestra.upper > alturaTd}>
                    <p>{t("confirm_edit")}</p>
                </button>
            </li>
            <li><button className="btn btn-error" onClick={handleDeleteMuestra}><p>Eliminar muestra</p></button></li>
        </ul>
    );
}

export default EditMuestra;
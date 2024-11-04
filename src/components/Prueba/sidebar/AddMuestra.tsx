import { useTranslation } from 'react-i18next';
import { formMuestra } from '../types';

interface AddMuestraProps {
    handleAddMuestra : (event: any) => void;
    formMuestra : formMuestra;
    alturaTd : number;
    changeFormMuestra : (e: any) => void;
}

const AddMuestra: React.FC<AddMuestraProps> = ({ handleAddMuestra, formMuestra, alturaTd, changeFormMuestra }) => {

    const { t } = useTranslation(['Editor']);
    
    return (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li className="menu-title">{t("muestras")}</li>
            <div className="grid h-100 card bg-base-300 rounded-box place-items-center">
                <li>Añadir muestra</li>
                <form onSubmit={handleAddMuestra}>
                    <li>
                        <input type='text' required className="input input-bordered w-full max-w-xs" name='muestraText' value={formMuestra.muestraText} onChange={changeFormMuestra} />
                    </li>

                    <li>
                        <label>{t("lim_inf")}</label>
                        <input
                            type="number"
                            name='upper'
                            value={Number(formMuestra.upper)}
                            min={0}
                            max={formMuestra.lower}
                            required
                            onChange={changeFormMuestra}
                        />
                    </li>
                    <li>
                        <label>{t("lim_sup")}</label>
                        <input
                            type="number"
                            name='lower'
                            value={Number(formMuestra.lower)}
                            min={0}
                            max={alturaTd}
                            required
                            onChange={changeFormMuestra}
                        />
                    </li>

                    <button type='submit' className="btn btn-primary"
                        disabled={Number(formMuestra.lower) > alturaTd || Number(formMuestra.upper) > alturaTd}>
                        <p>{t("confirm")}</p>
                    </button>
                </form>
            </div>
        </ul>
    );
}

export default AddMuestra;
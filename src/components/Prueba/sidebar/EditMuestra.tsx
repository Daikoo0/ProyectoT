import { useTranslation } from 'react-i18next';
import { formMuestra } from '../types';
import { useRecoilValue } from 'recoil';
import { atSocket } from '../../../state/atomEditor';

interface EditMuestraProps {
    formMuestra: formMuestra,
    changeFormMuestra: (e: any) => void;
    // handleMuestraEdit: () => void;
    alturaTd: number;
    // handleDeleteMuestra: () => void
}

const EditMuestra: React.FC<EditMuestraProps> = ({ formMuestra, changeFormMuestra, alturaTd }) => {

    const { t } = useTranslation(['Editor']);

    const socket = useRecoilValue(atSocket);

    const handleMuestraEdit = () => {

        socket.send(JSON.stringify({
            action: 'editMuestra',
            data: {
                "idMuestra": formMuestra.id,
                "upper": Number(formMuestra.upper),
                "lower": Number(formMuestra.lower),
                "muestraText": formMuestra.muestraText,
                "x": formMuestra.x
            }
        }));
    }

    const handleDeleteMuestra = () => {
        if (socket) {
            socket.send(JSON.stringify({
                action: 'deleteMuestra',
                data: {
                    "idMuestra": formMuestra.id,
                    "upper": Number(formMuestra.upper),
                    "lower": Number(formMuestra.lower),
                    "muestraText": formMuestra.muestraText,
                    "x": formMuestra.x
                }
            }));
        }

    }

    return (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li className="menu-title">Editar muestra</li>
            <li>
                <input type='text' className="input input-bordered w-full max-w-xs" name='muestraText' value={formMuestra.muestraText} placeholder={formMuestra.muestraTextCopy} onChange={changeFormMuestra} />
            </li>
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
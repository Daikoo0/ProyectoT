import fosilJson from '../../../fossil.json';
import IconSvg from '../../Web/IconSVG';
import { useTranslation } from 'react-i18next';
import { formFosil } from '../types';

interface EditFossilProps {
    formFosil: formFosil;
    sortedOptions: {
        key: string;
        value: string;
    }[];
    changeformFosil: (e: any) => void;
    handleFosilEdit: () => void;
    handleDeleteFosil: () => void;
    alturaTd: number;
}

const EditFossil: React.FC<EditFossilProps> = ({ formFosil, sortedOptions, changeformFosil, handleFosilEdit, handleDeleteFosil, alturaTd }) => {

    const { t } = useTranslation(['Editor', 'Description', 'Patterns']);

    return (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li className="menu-title">{t("fossil_edit")}</li>
            <li>

                <div className="flex w-full">
                    <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">

                        <IconSvg
                            iconName={fosilJson[formFosil.fosilImgCopy]}
                            folder='fosiles'
                            svgProp={{ width: 50, height: 50, className: "stroke-base-content" }}
                        />
                    </div>
                    <div className="divider divider-horizontal">
                        <svg className="w-10 h-10 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </div>
                    <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">
                        <IconSvg
                            iconName={formFosil.fosilImg ? fosilJson[formFosil.fosilImg] : fosilJson[1]}
                            folder='fosiles'
                            svgProp={{ width: 50, height: 50, className: "stroke-base-content" }}
                        />

                    </div>
                </div>


            </li>
            <li>
                <select required className="select select-bordered w-full max-w-xs" name='fosilImg' value={formFosil.fosilImg} onChange={changeformFosil}>
                    <option className="bg-base-100 text-base-content" value={""} disabled><p>{t("fossils_type")}</p></option>
                    {sortedOptions.map(option => (
                        <option className="bg-base-100 text-base-content" key={option.key} value={option.key}>
                            {option.value}
                        </option>
                    ))}
                </select>
            </li>
            <li>
                <label>{t("lim_sup")}</label>
                <input
                    type="number"
                    name='upper'
                    value={formFosil.upper}
                    onChange={changeformFosil}
                />
            </li>
            <li>
                <label>{t("lim_inf")}</label>
                <input
                    type="number"
                    name='lower'
                    value={formFosil.lower}
                    onChange={changeformFosil}
                />
            </li>
            <li>
                <button className="btn btn-primary" onClick={handleFosilEdit}
                    disabled={formFosil.lower > alturaTd || formFosil.upper > alturaTd}>
                    <p>{t("confirm_edit")}</p>
                </button>
            </li>
            <li><button className="btn btn-error" onClick={handleDeleteFosil}><p>{t("delete_fossil")}</p></button></li>
        </ul>
    );
}

export default EditFossil;
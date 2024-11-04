import fosilJson from '../../../fossil.json';
import IconSvg from '../../Web/IconSVG';
import { useTranslation } from 'react-i18next';

interface AddFossilProps {
    handleAddFosil : (event: any) => void;
    formFosil : {
        id: string;
        upper: number;
        lower: number;
        fosilImg: string;
        x: number;
        fosilImgCopy: string;
    };
    sortedOptions : {
        key: string;
        value: string;
    }[];
    changeformFosil : (e: any) => void;
    alturaTd : number;
}

const AddFossil : React.FC<AddFossilProps> = ({ handleAddFosil, formFosil,sortedOptions, changeformFosil, alturaTd }) => {

    const { t } = useTranslation(['Editor', 'Description', 'Patterns']);
    return (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li className="menu-title">{t("fossils")}</li>

            <div className="grid h-100 card bg-base-300 rounded-box place-items-center">
                <li>{t("add_fossils")}</li>
                <form onSubmit={handleAddFosil}>
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

                        {formFosil.fosilImg === "" ? null :
                            <IconSvg
                                iconName={fosilJson[formFosil.fosilImg]}
                                folder='fosiles'
                                svgProp={{ width: 50, height: 50, className: "stroke-base-content" }}
                            />
                        }

                    </li>
                    <li>
                        <label>{t("lim_inf")}</label>
                        <input
                            type="number"
                            name='upper'
                            value={Number(formFosil.upper)}
                            min={0}
                            max={formFosil.lower}
                            required
                            onChange={changeformFosil}
                        />
                    </li>
                    <li>
                        <label>{t("lim_sup")}</label>
                        <input
                            type="number"
                            name='lower'
                            value={Number(formFosil.lower)}
                            min={0}
                            max={alturaTd}
                            required
                            onChange={changeformFosil}
                        />
                    </li>

                    <button type='submit' className="btn btn-primary"
                        disabled={Number(formFosil.lower) > alturaTd || Number(formFosil.upper) > alturaTd}>
                        <p>{t("confirm")}</p>
                    </button>
                </form>
            </div>
        </ul>)
}

export default AddFossil;
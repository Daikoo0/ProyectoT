import React from "react";
import { useRecoilValue } from "recoil";
import { atSocket } from '../../../state/atomEditor';
import fosilJson from '../../../fossil.json';
import IconSvg from '../../Web/IconSVG';
import { formFosil } from "../types";

interface AddFossilProps {
    t:any;
    formFosil: formFosil;
    changeformFosil : (e: any) => void;
    alturaTd: number;
    sortedOptions: {
        key: string;
        value: string;
    }[];
}

const AddFossil : React.FC<AddFossilProps> = ({t, formFosil, changeformFosil, alturaTd, sortedOptions  }) => {
    
    const socket = useRecoilValue(atSocket);

    const handleAddFosil = (event) => {
        if (socket) {
            event.preventDefault();
            socket.send(JSON.stringify({
                action: 'addFosil',
                data: {
                    "upper": Number(formFosil.upper),
                    "lower": Number(formFosil.lower),
                    "fosilImg": formFosil.fosilImg,
                    "x": formFosil.x
                }
            }));
        }
    };

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
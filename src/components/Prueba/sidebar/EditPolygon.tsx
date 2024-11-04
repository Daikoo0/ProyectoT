
import { useTranslation } from 'react-i18next';
import lithoJson from '../../../lithologic.json';
import contacts from '../../../contacts.json';
import { formData } from '../types';
import IconSvg from '../../Web/IconSVG';

interface EditPolygonProps {
    handleDeletePolygon: () => void;
    handleChange: (e: any) => void;
    formData: formData;
    handleChangeLocal: (e: any) => void;
}

const EditPolygon: React.FC<EditPolygonProps> = ({ handleChangeLocal, formData, handleChange, handleDeletePolygon }) => {

    const { t } = useTranslation(['Editor', 'Description', 'Patterns']);

    return (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li className="menu-title">{t("editing_p")}</li>
            <li>
                <details open={false}>
                    <summary>{t("c_inf")}</summary>
                    <ul>
                        {Object.keys(contacts).map((contact, index) => {
                            return (
                                <li key={`contact-${index}`} className='bg-neutral-content' style={{ padding: '10px', marginBottom: '10px' }}>

                                    <label style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            value={contact}
                                            name='Contact'
                                            checked={formData.Contact == contact ? true : false}
                                            onChange={handleChange}
                                            style={{ marginRight: '8px' }}
                                        />

                                        <IconSvg
                                            iconName={contact}
                                            folder='contacts'
                                            svgProp={{ width: 150, height: 50 }}
                                        />

                                        <div className="dropdown dropdown-hover dropdown-left dropdown-end">
                                            {/* <div tabIndex={0} role="button" className="btn m-1"> */}
                                            <svg tabIndex={0} role="button" className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            {/* </div> */}
                                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                                <li><a>{t(contact, { ns: 'Description' })}</a></li>
                                            </ul>
                                        </div>
                                    </label>


                                </li>
                            )
                        }

                        )}
                    </ul>

                </details>
            </li>

            <li className='flex flex-row'>
                <p>{t("tam_cap")}</p>
                <input type="number" name="Height" value={formData.Height} onChange={handleChangeLocal} />
                <button className="btn" name="Height" value={formData.Height} disabled={formData.Height === formData.initialHeight || formData.Height < 5 || formData.Height > 2000}
                    onClick={handleChange}>{t("change")}</button>
            </li>

            <li>
                <p>{t("op_pattern")}</p>
                <select name={"File"} value={formData.File} onChange={handleChange} className='select select-bordered w-full max-w-xs'>
                    {Object.keys(lithoJson).map(option => (
                        <option className="bg-base-100 text-base-content" key={option} value={option}>
                            {t(option, { ns: "Patterns" })}
                        </option>

                    ))}
                </select>
            </li>

            <li>
                <p>{t("color_cap")}<input type="color" name={"ColorFill"} value={formData.ColorFill} onChange={handleChangeLocal} onBlur={handleChange} /></p>
            </li>
            <li>
                <p>{t("color_pattern")}<input type="color" name={"ColorStroke"} value={formData.ColorStroke} onChange={handleChangeLocal} onBlur={handleChange} /> </p>
            </li>

            <li>
                <p>{t("zoom")}</p>
                <input
                    type="range"
                    name='Zoom'
                    min={100}
                    max={400}
                    defaultValue={formData.Zoom}
                    onMouseUp={handleChange}
                />
            </li>

            <li>
                <p>{t("tension")} </p>
                <input
                    type="range"
                    name='Tension'
                    min={0}
                    max={2.5}
                    step={0.1}
                    defaultValue={formData.Tension}
                    onMouseUp={handleChange}
                />
            </li>

            <li>
                <p>{t("rotation")}</p>
                <input
                    type="range"
                    name='Rotation'
                    min={0}
                    max={180}
                    defaultValue={formData.Rotation}
                    onMouseUp={handleChange}
                />
            </li>

            <li>
                <button className="btn btn-error" onClick={handleDeletePolygon}
                ><p>{t("delete_layer")}</p></button>
            </li>
        </ul>
    );
}

export default EditPolygon;
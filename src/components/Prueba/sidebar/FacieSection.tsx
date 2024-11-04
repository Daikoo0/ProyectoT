import { useTranslation } from 'react-i18next';

interface FacieSectionProps {
    facies, 
    formFacies, 
    handleDeleteFacieSection, 
    changeformFacie,
    handleAddFacieSection,
    handleDeleteFacie,
    messageFacie
}

const FacieSection: React.FC<FacieSectionProps> = ({messageFacie, facies, formFacies, handleDeleteFacieSection, changeformFacie, handleAddFacieSection, handleDeleteFacie }) => 
    {

        const { t } = useTranslation(['Editor', 'Description', 'Patterns']);

        return (
            <>
                <div className="p-4 w-80 min-h-full bg-base-200 text-base-content">
                    <p className="menu-title">{t("editing_facie")} {formFacies.facie}</p>
                    <div className="p-4">
                        <p className="text-lg font-semibold mb-2">{t("tramos_facie")}</p>
                        <ul className="list-disc list-inside space-y-2">
                            {Object.values(facies[formFacies.facie]).map((value, index) => {
                                return (
                                    <>
                                        <li key={index} className="flex items-center justify-between">
                                            <span>{value["y1"]}cm - {value["y2"]}cm</span>

                                            <button className="btn btn-error" onClick={() => {
                                                handleDeleteFacieSection(index)
                                            }}>
                                                <p>{t("delete_facie_sec")}</p>
                                            </button>
                                        </li>

                                    </>
                                )
                            })}
                        </ul>

                        <p className="text-lg font-semibold mt-4 mb-2">{t("add_tramo_facie")}</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li className="flex items-center">
                                <span>{t("lim_inf")}</span>
                                <input
                                    type="number"
                                    name="y1"
                                    value={Number(formFacies.y1)}
                                    onChange={changeformFacie}
                                    className="form-input ml-2"
                                />
                            </li>
                            <li className="flex items-center">
                                <span>{t("lim_sup")}</span>
                                <input
                                    type="number"
                                    name="y2"
                                    value={Number(formFacies.y2)}
                                    onChange={changeformFacie}
                                    className="form-input ml-2"
                                />
                            </li>
                        </ul>

                        <button className="btn btn-primary mt-4 w-full" onClick={handleAddFacieSection}>
                            <p>{t("confirm_new_t")}</p>
                        </button>

                        {messageFacie !== '' && (<>
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mt-3 rounded relative" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{messageFacie}</span>
                            </div></>)}

                    </div>

                    <button className="btn btn-error mt-4 w-full" onClick={handleDeleteFacie}>
                        <p>{t("delete_facie")}</p>
                    </button>
                </div>
            </>
        );
    }
export default FacieSection;
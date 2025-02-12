import { useState, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { atSideBarState, atformFossil } from '../../../state/atomEditor';
import { useTranslation } from 'react-i18next';
import EditFossil from './EditFossil';
import AddFossil from './AddFossil';
import fosilJson from '../../../fossil.json';
import { formFosil } from "../../../components/Prueba/types";


interface FossilsProps {
    alturaTd: number;
}

const Fossils: React.FC<FossilsProps> = ({ alturaTd }) => {

    const { t } = useTranslation(['Editor', 'Description', 'Patterns']);
    const SideBar = useRecoilValue(atSideBarState);
    const formfossil = useRecoilValue(atformFossil);

    const [formFossil, setFormFosil] = useState<formFosil>(formfossil);

    const sortedOptions = useMemo(() => {
        return Object.keys(fosilJson)
            .map(option => ({
                key: option,
                value: t(option, { ns: "Fossils" })
            }))
            .sort((a, b) => a.value.localeCompare(b.value));
    }, [fosilJson, t]);

    const changeformFosil = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormFosil(prevState => ({
            ...prevState,
            [name]: value,
        }));
    }

    return (
        <>
            {SideBar.actionType === 'edit' ? (
                <EditFossil t={t} formFosil={formFossil} changeformFosil={changeformFosil} alturaTd={alturaTd} sortedOptions={sortedOptions} />
            ) : (
                <AddFossil t={t} formFosil={formFossil} changeformFosil={changeformFosil} alturaTd={alturaTd} sortedOptions={sortedOptions} />
            )}
        </>
    )
}

export default Fossils;
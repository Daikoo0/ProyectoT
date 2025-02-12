import React, { useState } from "react";
import { atformSamples, atSideBarState } from "../../../state/atomEditor";
import { useRecoilValue } from "recoil";
import AddMuestra from "./AddMuestra";
import EditMuestra from "./EditMuestra";

interface SamplesProps {
    alturaTd: number;
}

const Samples: React.FC<SamplesProps> = ({ alturaTd }) => {

    const SideBar = useRecoilValue(atSideBarState);

    const Muestra = useRecoilValue(atformSamples);

    const [formMuestra, setFormMuestra] = useState(Muestra);

    const changeFormMuestra = (e) => {
        const { name, value } = e.target;
        setFormMuestra(prevState => ({
            ...prevState,
            [name]: value,
        }));
    }


    return (
        <>
            {SideBar.actionType === 'edit' ? (
                <EditMuestra alturaTd={alturaTd} formMuestra={formMuestra} changeFormMuestra={changeFormMuestra} />
            ) : (
                <AddMuestra alturaTd={alturaTd} formMuestra={formMuestra} changeFormMuestra={changeFormMuestra} />
            )}
        </>
    )
}

export default Samples;
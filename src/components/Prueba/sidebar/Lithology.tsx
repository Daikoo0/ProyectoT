import React, { useState } from "react";
import { atSideBarState, atformLithology } from "../../../state/atomEditor";
import { useRecoilValue, useResetRecoilState } from "recoil";
import AddLithology from "./AddLithology";
import EditLithology from "./EditLithology";
interface LithologyProps {

}

const Lithology: React.FC<LithologyProps> = ({ }) => {

    const SideBar = useRecoilValue(atSideBarState);

    const formlithology = useRecoilValue(atformLithology);
    const resetFormLithology = useResetRecoilState(atformLithology);

    const [formLithology, setFormLithology] = useState(formlithology);

    const changeformLithology = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormLithology(prevState => ({
            ...prevState,
            [name]: value,
        }));
    }



    return (
        <>
            {
                SideBar.actionType === 'edit' ? (
                    <EditLithology
                        resetFormLithology={resetFormLithology}
                        formLithology={formLithology}
                        changeformLithology={changeformLithology}

                    />
                ) : (
                    <AddLithology
                        formLithology={formLithology}
                        changeformLithology={changeformLithology}

                    />
                )

            }

        </>

    );

}

export default Lithology;
import React from "react";
import { useRecoilValue } from "recoil";
import { atSocket, atSideBarState, atSettings } from "../../../state/atomEditor";
import Fossils from "./Fossils";
import Lithology from "./Lithology";
import { formLithology, EditingUser } from "../types";


interface SideBarProps {
  formData: formLithology;
  editingUsers: { [key: string]: EditingUser };
  alturaTd: number;
};

const SideBar: React.FC<SideBarProps> = ({ formData, editingUsers, alturaTd }) => {

  const settings = useRecoilValue(atSettings)
  const socket = useRecoilValue(atSocket);
  const sideBarState = useRecoilValue(atSideBarState);

  return (
    <div className="drawer-side z-[1003]">
      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"
        onClick={() => {
          if (socket && formData.index !== null) {
            socket.send(JSON.stringify({
              action: 'deleteEditingUser',
              data: {
                section: `[${formData.index},${settings.header.indexOf(formData.column) + 1}]`,
                name: editingUsers[`[${formData.index},${settings.header.indexOf(formData.column)}]`]?.name,
              }
            }));
          }
        }}>

      </label>
      {
        (() => {
          switch (sideBarState.entityType) {
            case 'fossil':
              return (
                <Fossils alturaTd={alturaTd} />
              );
            case 'lithology':
              return (
                <Lithology />
              );
            // case "config":
            //   return (
            //     <Config infoProject={infoProject} handleInfoProject={handleInfoProject} socket={socket} settings={settings} isInverted={isInverted} scale={scale} setScale={setScale}/>
            //   );
            // case "añadirCapa":
            //   return (
            //     <AddCapa handleChangeLocal={handleChangeLocal} formData={formData} lengthData={data.length} handleAddColumn={handleAddColumn} addShape={addShape} />
            //   );
            // case "fosil":
            //   return (
            //     <AddFossil handleAddFosil={handleAddFosil} formFosil={formFosil} sortedOptions={sortedOptions} changeformFosil={changeformFosil} alturaTd={alturaTd} />
            //   );
            // case "editFosil":
            //   return (
            //     <EditFossil sortedOptions={sortedOptions} handleDeleteFosil={handleDeleteFosil} alturaTd={alturaTd} />
            //   );
            // case "muestra":
            //   return (
            //     <AddMuestra handleAddMuestra={handleAddMuestra} formMuestra={formMuestra} alturaTd={alturaTd} changeFormMuestra={changeFormMuestra} />
            //   );
            // case "editMuestra":
            //   return (
            //     <EditMuestra formMuestra={formMuestra} changeFormMuestra={changeFormMuestra} handleMuestraEdit={handleMuestraEdit} alturaTd={alturaTd} handleDeleteMuestra={handleDeleteMuestra} />
            //   )
            // case "polygon":
            //   return (
            //     <EditPolygon handleDeletePolygon={handleDeletePolygon} handleChangeLocal={handleChangeLocal} formData={formData} handleChange={handleChange} />
            //   );
            // case "text":
            //   return (
            //     <EditText setFormData={setFormData} handleEditText={handleEditText} formData={formData} />
            //   );
            // case "addFacie":
            //   return (
            //     <AddFacie changeformFacie={changeformFacie} handleAddFacie={handleAddFacie} facies={facies} />
            //   );
            // case "facieSection":
            //   return (
            //     <FacieSection messageFacie={messageFacie} facies={facies} formFacies={formFacies} handleDeleteFacieSection={handleDeleteFacieSection} changeformFacie={changeformFacie} handleAddFacieSection={handleAddFacieSection} handleDeleteFacie={handleDeleteFacie} />
            //   );
            default:
              return (
                <div >
                  a
                </div>)
          }
        })()
      }

    </div >
  );

}

export default SideBar;
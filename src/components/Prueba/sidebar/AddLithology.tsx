import { useTranslation } from 'react-i18next';
import { formLithology } from '../types';
import { atLithologyTableLength, atSocket } from '../../../state/atomEditor';
import { useRecoilValue } from 'recoil';

interface AddLithologyProps {
    changeformLithology: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    formLithology: formLithology;
}

const AddLithology: React.FC<AddLithologyProps> = ({ changeformLithology, formLithology }) => {

    const { t } = useTranslation(['Editor']);

    const socket = useRecoilValue(atSocket);
    const lengthLithology = useRecoilValue(atLithologyTableLength);


    const handleAddColumn = (columnName) => {
        if (socket) {
            socket.send(JSON.stringify({
                action: 'addColumn',
                data: { name: columnName }
            }))
        }
    }

    const addShape = (row, height) => {
        socket.send(JSON.stringify({
          action: 'añadir',
          data: {
            "height": Number(height),
            "rowIndex": Number(row)
          }
        }));
      }

    return (
        <>
            <div className="p-4 w-80 min-h-full bg-base-200 text-base-content shadow-xl rounded-lg">
                <p className="menu-title text-lg font-bold mb-4">{t("add")}</p>
                <ul className="menu w-80 min-h-full bg-base-200 text-base-content">
                    <li className='mb-2'>
                        <p>
                            <input type="number" name='Height' onChange={changeformLithology} value={Number(formLithology.Height)} />
                            cm
                        </p>
                    </li>
                    <li className='mb-2'>
                        <button className='btn btn-primary' disabled={formLithology.Height < 5 || formLithology.Height > 2000} onClick={() => addShape(0, Number(formLithology.Height))}>
                            <p>{t("add_t")}</p>
                        </button>
                    </li>
                    <li className="flex flex-row">
                        <button className='btn btn-primary  w-3/5' disabled={formLithology.Height < 5 || formLithology.Height > 2000} onClick={() => addShape(Number(formLithology.initialHeight), Number(formLithology.Height))}>
                            <p>{t("add_index")}</p>
                        </button>
                        <input type="number" className='w-2/5' name="initialHeight" min="0" max={lengthLithology - 1} onChange={changeformLithology} value={Number(formLithology.initialHeight)} />
                    </li>
                    <li className='mt-2'>
                        <button className='btn btn-primary ' disabled={formLithology.Height < 5 || formLithology.Height > 2000} onClick={() => addShape(-1, Number(formLithology.Height))}>
                            <p>{t("add_b")}</p>
                        </button>
                    </li>
                </ul>
                <p className="menu-title text-lg font-bold mb-4">Añadir Columna</p>
                <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium">Nombre de la Columna</label>
                    <input type='text' name='column' onChange={changeformLithology} className="input input-bordered w-full mt-1" />
                </div>
                <button className="btn btn-primary w-full" onClick={() => { handleAddColumn(formLithology.column) }}>
                    <p>Confirmar nueva Columna</p>
                </button>
            </div>
        </>
    )
}

export default AddLithology;
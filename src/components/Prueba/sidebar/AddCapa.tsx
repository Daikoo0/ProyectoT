import { useTranslation } from 'react-i18next';
import { formData } from '../types';

interface CapaProps {
    handleChangeLocal: (e: any) => void;
    formData: formData;
    lengthData: number;
    handleAddColumn: (columnName: any) => void;
    addShape: (row: any, height: any) => void;
}

const AddCapa: React.FC<CapaProps> = ({ handleChangeLocal, formData, lengthData, handleAddColumn, addShape }) => {
    const { t } = useTranslation(['Editor']);
    return (
        <>
            <div className="p-4 w-80 min-h-full bg-base-200 text-base-content shadow-xl rounded-lg">
                <p className="menu-title text-lg font-bold mb-4">{t("add")}</p>
                <ul className="menu w-80 min-h-full bg-base-200 text-base-content">
                    <li className='mb-2'>
                        <p>
                            <input type="number" name='Height' onChange={handleChangeLocal} value={Number(formData.Height)} />
                            cm
                        </p>
                    </li>
                    <li className='mb-2'>
                        <button className='btn btn-primary' disabled={formData.Height < 5 || formData.Height > 2000} onClick={() => addShape(0, Number(formData.Height))}>
                            <p>{t("add_t")}</p>
                        </button>
                    </li>
                    <li className="flex flex-row">
                        <button className='btn btn-primary  w-3/5' disabled={formData.Height < 5 || formData.Height > 2000} onClick={() => addShape(Number(formData.initialHeight), Number(formData.Height))}>
                            <p>{t("add_index")}</p>
                        </button>
                        <input type="number" className='w-2/5' name="initialHeight" min="0" max={lengthData - 1} onChange={handleChangeLocal} value={Number(formData.initialHeight)} />
                    </li>
                    <li className='mt-2'>
                        <button className='btn btn-primary ' disabled={formData.Height < 5 || formData.Height > 2000} onClick={() => addShape(-1, Number(formData.Height))}>
                            <p>{t("add_b")}</p>
                        </button>
                    </li>
                </ul>
                <p className="menu-title text-lg font-bold mb-4">Añadir Columna</p>
                <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium">Nombre de la Columna</label>
                    <input type='text' name='column' onChange={handleChangeLocal} className="input input-bordered w-full mt-1" />
                </div>
                <button className="btn btn-primary w-full" onClick={() => { handleAddColumn(formData.column) }}>
                    <p>Confirmar nueva Columna</p>
                </button>
            </div>
        </>
    )
}

export default AddCapa;
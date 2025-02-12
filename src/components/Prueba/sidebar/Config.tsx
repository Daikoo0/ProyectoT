import React, { useEffect, useState } from 'react';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import SelectTheme from '../../Web/SelectTheme';
import LangSelector from '../../Web/LanguageComponent';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ProjectInfo } from '../types';
import { atSocket, atSettings } from '../../../state/atomEditor';
import { useRecoilValue } from 'recoil';

interface ConfigProps {
    isInverted: boolean;
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    handleInfoProject: (formData: FormData) => void;
    infoProject: ProjectInfo;
}

const Config: React.FC<ConfigProps> = ({ infoProject, setScale, handleInfoProject }) => {

    const { t } = useTranslation(['Editor']);

    const socket = useRecoilValue(atSocket);
    const settings = useRecoilValue(atSettings);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            socket?.send(JSON.stringify({
                action: 'MoveColumn',
                data: {
                    "activeId": settings.header.findIndex((item) => item.Name === active.id),
                    "overId": settings.header.findIndex((item) => item.Name === over.id)
                }
            }));
        }
    };

    const toggleVisibility = (name: string) => {
        if (socket) {
            socket.send(JSON.stringify({
                action: 'toggleColumn',
                data: {
                    "column": name
                }
            }));
        }
    };

    const deleteColumn = (name: string) => {
        if (socket) {
            socket.send(JSON.stringify({
                action: 'deleteColumn',
                data: {
                    "name": name
                }
            }));
        }
    };

    const inverted = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (socket) {
            socket.send(JSON.stringify({
                action: 'isInverted',
                data: {
                    "isInverted": e.target.checked
                }
            }));
        }
    }

    const scales = [
        { value: 10, label: '1:10' },
        { value: 5, label: '1:20' },
        { value: 4, label: '1:25' },
        { value: 2, label: '1:50' },
        { value: 1, label: '1:100' },
        { value: 0.5, label: '1:200' },
    ];

    return (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li className='pb-6 hidden lg:block'>{t("config")}</li>

            <li>

                <details >
                    <summary>{t("info_column")}</summary>

                    <EditInfoProject infoProject={infoProject} handleInfoProject={handleInfoProject} />

                </details>
            </li>

            <li>
                <details>
                    <summary>{t("config_t")}</summary>
                    <ul>
                        <li>
                            <details open={false}>
                                <summary>{t("scale")}</summary>
                                <ul>
                                    {scales.map(({ value, label }) => (
                                        <li key={value}>
                                            <label className="inline-flex items-center">
                                                <input type="radio" value={value} checked={settings.scale === value}
                                                    onChange={(e) => setScale(Number(e.target.value))}
                                                    className="form-radio h-5 w-5 text-indigo-600" />
                                                <span className="ml-2">{label}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details open={false}>
                                <summary>{t("position_r")}</summary>
                                <ul>
                                    <li>
                                        <input type="checkbox" className="toggle toggle-success"
                                            checked={settings.isInverted}
                                            onChange={inverted} />
                                        {settings.isInverted ? <p>{t("inverted")}</p> : <p>{t("notinverted")}</p>}

                                    </li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details>
                                <summary>{t("visibility")}</summary>
                                <ul>
                                    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                                        <SortableContext items={settings.header.map((col) => col.Name)} strategy={verticalListSortingStrategy}>
                                            <div>
                                                {settings.header.map((col) =>
                                                    <SortableItem key={col.Name} col={col} toggleVisibility={toggleVisibility} deleteColumn={deleteColumn} />
                                                )}
                                            </div>
                                        </SortableContext>
                                    </DndContext>

                                </ul>
                            </details>
                        </li>
                    </ul>
                </details>
            </li>

            <li>
                <details>
                    <summary>{t("sala")}</summary>
                    <ul>
                        <li><SelectTheme /></li>
                        <li><LangSelector /></li>
                    </ul>
                </details>
            </li>
        </ul>
    )
}

interface FormData {
    Name: string;
    Location: string;
    Visible: boolean;
    Description: string;
}

interface EditInfoProjectProps {
    infoProject: FormData;
    handleInfoProject: (formData: FormData) => void;
}


const EditInfoProject: React.FC<EditInfoProjectProps> = React.memo(({ infoProject, handleInfoProject }) => {

    const { t } = useTranslation(['Editor']);

    const [formData, setFormData] = useState<FormData>({
        Name: infoProject.Name,
        Location: infoProject.Location,
        Visible: infoProject.Visible,
        Description: infoProject.Description
    });

    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        const isFormModified =
            formData.Name !== infoProject.Name ||
            formData.Location !== infoProject.Location ||
            formData.Visible !== infoProject.Visible ||
            formData.Description !== infoProject.Description;

        setIsModified(isFormModified);
    }, [formData, infoProject]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleInfoProject(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <ul className="form-control">
                <label className="label">
                    <span className="label-text">{t("info_column_name")}</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    className="input input-bordered w-full"
                />

                <label className="label">
                    <span className="label-text">{t("info_column_location")}</span>
                </label>
                <input
                    type="text"
                    name="location"
                    value={formData.Location}
                    onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                    className="input input-bordered w-full"
                />

                <label className="label cursor-pointer">
                    <span className="label-text">{t("info_column_visible")}</span>
                    <input
                        type="checkbox"
                        name="visible"
                        checked={formData.Visible}
                        onChange={(e) => setFormData({ ...formData, Visible: e.target.checked })}
                        className="toggle toggle-primary"
                    />
                </label>

                <label className="label">
                    <span className="label-text">{t("info_column_description")}</span>
                </label>
                <textarea
                    name="description"
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                    className="textarea textarea-bordered w-full"
                />

                <button type="submit" className="btn btn-primary" disabled={!isModified}>{t("info_column_buttom")}</button>
            </ul>
        </form>
    )
});


const SortableItem = ({ col, toggleVisibility, deleteColumn }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: col.Name });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: '8px',
        border: '1px solid #ddd',
        marginBottom: '4px',
        // backgroundColor: 'purple',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    return (
        <div ref={setNodeRef} className="menu-dropdown bg-100" style={style} {...attributes} {...listeners}>
            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 10 4-6 4 6H8Zm8 4-4 6-4-6h8Z" />
            </svg>

            {col.Removable ? <>

                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => deleteColumn(col.Name)}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={`Toggle visibility of ${col.Name}`}

                >

                    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button></> : null}

            <span>{col.Name}</span>

            <input
                type="checkbox"
                checked={col.Visible}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={() => toggleVisibility(col.Name)}
                aria-label={`Toggle visibility of ${col.Name}`}
            />
        </div>
    );
};
export default Config;
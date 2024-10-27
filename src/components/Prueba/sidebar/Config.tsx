import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import SelectTheme from '../../Web/SelectTheme';
import LangSelector from '../../Web/LanguageComponent';
import { Col } from '../types';

interface ConfigProps {
    socket: WebSocket | null;
    header: Col[];
    isInverted: boolean;
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    setHeader: React.Dispatch<React.SetStateAction<Col[]>>;
}

const Config: React.FC<ConfigProps> = ({ socket, header, isInverted, scale, setScale, setHeader }) => {

    const { t } = useTranslation(['Editor']);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setHeader((items) => {
                const oldIndex = items.findIndex((item) => item.Name === active.id);
                const newIndex = items.findIndex((item) => item.Name === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const toggleVisibility = (name: string) => {
        setHeader((items) =>
            items.map((item) =>
                item.Name === name ? { ...item, Visible: !item.Visible } : item
            )
        );
    };

    return (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li className='pb-6 hidden lg:block'>{t("config")}</li>

            <li>
                <details open>
                    <summary>{t("config_t")}</summary>
                    <ul>
                        <li>
                            <details open={false}>
                                <summary>{t("scale")}</summary>
                                <ul>
                                    <li>
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" value="10" checked={scale === 10}
                                                onChange={(e) => setScale(Number(e.target.value))}
                                                className="form-checkbox h-5 w-5 text-indigo-600" />
                                            <span className="ml-2">1:10</span>
                                        </label>
                                    </li>
                                    <li>
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" value="5" checked={scale === 5}
                                                onChange={(e) => setScale(Number(e.target.value))}
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                            />
                                            <span className="ml-2">1:20</span>
                                        </label>
                                    </li>
                                    <li>
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" value="4" checked={scale === 4}
                                                onChange={(e) => setScale(Number(e.target.value))}
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                            />
                                            <span className="ml-2">1:25</span>
                                        </label>
                                    </li>
                                    <li>
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" value="2" checked={scale === 2}
                                                onChange={(e) => setScale(Number(e.target.value))}
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                            />
                                            <span className="ml-2">1:50</span>
                                        </label>
                                    </li>
                                    <li>
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" value="1" checked={scale === 1}
                                                onChange={(e) => setScale(Number(e.target.value))}
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                            />
                                            <span className="ml-2">1:100</span>
                                        </label>
                                    </li>
                                    <li>
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" value="0.5" checked={scale === 0.5}
                                                onChange={(e) => setScale(Number(e.target.value))}
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                            />
                                            <span className="ml-2">1:200</span>
                                        </label>
                                    </li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details open={false}>
                                <summary>{t("position_r")}</summary>
                                <ul>
                                    <li>

                                        <input type="checkbox" className="toggle toggle-success"
                                            checked={isInverted}
                                            onChange={(e) => {
                                                if (socket) {
                                                    //  setIsInverted(!isInverted)
                                                    socket.send(JSON.stringify({
                                                        action: 'isInverted',
                                                        data: {
                                                            "isInverted": e.target.checked
                                                        }
                                                    }));
                                                }
                                            }} />{isInverted ? <p>{t("inverted")}</p> : <p>{t("notinverted")}</p>}

                                    </li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details open={false}>
                                <summary>{t("visibility")}</summary>
                                <ul>
                                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={header.map((col) => col.Name)} strategy={verticalListSortingStrategy}>
                                            <div>
                                                {header.map((col) => (
                                                    <SortableItem key={col.Name} col={col} toggleVisibility={toggleVisibility} />
                                                ))}
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
                <details open>
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

interface SortableItemProps {
    col: Col;
    toggleVisibility: (name: string) => void;
}

const SortableItem = ({ col, toggleVisibility }: SortableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: col.Name });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: '8px',
        border: '1px solid #ddd',
        marginBottom: '4px',
        backgroundColor: 'purple',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };


    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <span>{col.Name}</span>
            <input
                type="checkbox"
                checked={col.Visible}
                onChange={() => toggleVisibility(col.Name)}
                aria-label={`Toggle visibility of ${col.Name}`}
            />
        </div>
    );
};

export default Config;
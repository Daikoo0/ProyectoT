import React, { memo } from 'react';
import fosiles from '../../fossil.json';
import lithoJson from '../../lithologic.json';
import { Fosil } from './types';
import ItemSymbology from './ItemSym';
import { useTranslation } from 'react-i18next';

interface SymbologyProps {
    data: any;
    fossils: Fosil[];
}

const Symbology: React.FC<SymbologyProps> = memo(({ data, fossils }) => {

    var patterns = []
    var contacts = []
    var fossilsName = []

    data.forEach(row => {
        if (!patterns.includes(row["Litologia"].File) && lithoJson[row["Litologia"].File] > 1) {
            patterns.push(row["Litologia"].File);
        }
        if (!contacts.includes(row["Litologia"].Contact)) {
            contacts.push(row["Litologia"].Contact)
        }
    });

    const name = Object.values(fossils).map(fossil => Object.values(fossil)[2]);
    fossilsName.push(name[0])
    fossilsName = fossilsName.filter(item => item !== undefined)

    
    const { t } = useTranslation(['Patterns','Description','Fossils']);

    return (
        <div className=" mt-20">
            <h1 className="text-2xl font-bold">Simbología</h1>

            {patterns.length > 0 && (
                <>
                    <h2 className="text-xl font-semibold">{t('patrones', { ns: 'Patterns' })}</h2>
                    {patterns.map((pattern, index) => (
                        <ItemSymbology
                            key={`pattern-${index}`}
                            item={lithoJson[pattern]}
                            type={'patrones'}
                            name={t(pattern,{ns:'Patterns'})}
                        />
                    ))}
                </>
            )}

            {contacts.length > 0 && (
                <>
                    <h2 className="text-xl font-semibold">{t('contacts',{ns:'Description'})}</h2>
                    {contacts.map((contact, index) => (
                        <ItemSymbology
                            key={`contact-${index}`}
                            item={contact}
                            type={'contacts'}
                            name={t(contact,{ns: 'Description'})}
                        />
                    ))}
                </>
            )}

            {fossilsName.length > 0 && (
                <>
                    <h2 className="text-xl font-semibold">{t('fosiles')}</h2>
                    {fossilsName.map((fossil, index) => (
                        <ItemSymbology
                            key={`fossil-${index}`}
                            item={fosiles[fossil]}
                            type={'fosiles'}
                            name={t(fossil,{ns:'Fossils'})}
                        />
                    ))}
                </>
            )}

        </div>)
});

export default Symbology;
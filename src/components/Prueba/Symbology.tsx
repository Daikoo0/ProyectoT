import React from 'react';
import { atFossil, lithologyPatternsAndContacts } from '../../state/atomEditor';
import { useRecoilValue } from 'recoil';
import fosiles from '../../fossil.json';
import lithoJson from '../../lithologic.json';
import ItemSymbology from './ItemSym';
import { useTranslation } from 'react-i18next';

interface SymbologyProps {}

const Symbology: React.FC<SymbologyProps> = () => {

    const { patterns, contacts } = useRecoilValue(lithologyPatternsAndContacts);
    const fossils = useRecoilValue(atFossil);

    const name = Object.values(fossils).map(fossil => Object.values(fossil)[2]);
    const fossilsName = [...new Set(name.filter(item => item !== undefined))];

    const { t } = useTranslation(['Patterns', 'Description', 'Fossils']);

    return (
        <div className=" mt-20">
            <h1 className="text-2xl font-bold">{t('symbology', { ns: 'Description' })}</h1>

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
};

export default Symbology;
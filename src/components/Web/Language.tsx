import { useEffect } from 'react';

const SwitchLanguage: React.FC = () => {
    useEffect(() => {

        const flagsElement = document.querySelector("#flags") as HTMLDivElement | null;
        const textsToChange = document.querySelectorAll("[data-section]") as NodeListOf<HTMLElement>;

        const changeLanguage = async (language: string) => {
            const requestJson = await fetch(`src/${language}.json`);
            const texts = await requestJson.json();

            for (const textToChange of textsToChange) {
                const section = textToChange.dataset.section as string;
                const value = textToChange.dataset.value as string;
                textToChange.innerHTML = texts[section][value];
                
            console.log(value,textToChange.innerHTML)
            }

            
        };

        flagsElement?.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            changeLanguage(target.parentElement?.dataset.language || 'ES');
            console.log(target.parentElement?.dataset.language , target.parentElement?.parentElement?.dataset.language )
        });
    }, []);


    return (
        <div>
            <div id="flags" className="flags">
                <div className="flags_item" data-language="ES">
                     <img src="src/assets/language/es.svg" alt="" /> 
                </div>
                <div className="flags_item" data-language="EN">
                    <img src="src/assets/language/en.svg" alt="" />
                </div>
            </div>
        </div>
    )
}

export default SwitchLanguage;
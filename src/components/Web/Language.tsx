import { useLanguage } from '../../Context/language-context';

const SwitchLanguage: React.FC = () => {
  const { changeLanguage } = useLanguage();

  return (
    <div id="flags" className="flags">
      <div className="flags_item" onClick={() => changeLanguage('es')} data-language="es">
        <img src="../../src/assets/language/es.svg" alt="Español" />
      </div>
      <div className="flags_item" onClick={() => changeLanguage('en')} data-language="en">
        <img src="../../src/assets/language/en.svg" alt="Inglés" />
      </div>
    </div>
  );
};

export default SwitchLanguage;

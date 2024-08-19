import { useTheme } from '../../Context/theme-context';

const SelectTheme = () => {
    const { currentTheme, setTheme, availableThemes } = useTheme();

    const handleThemeChange = (event) => {
        setTheme(event.target.value);
    };

    return (
        <select value={currentTheme} className="select select-primary w-full max-w-xs" onChange={handleThemeChange}>
            {availableThemes.map(theme => (
                <option className="bg-base-100 text-base-content" key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </option>
            ))}
        </select>
    );
};

export default SelectTheme;
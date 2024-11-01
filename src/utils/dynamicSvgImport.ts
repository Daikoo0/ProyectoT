import React from 'react';
import { useEffect, useRef, useState } from 'react';

export function useDynamicSvgImport(iconName: string, folder: string) {
  const importedIconRef = useRef<React.FC<React.SVGProps<SVGElement>>>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    setLoading(true);
    const importSvgIcon = async (): Promise<void> => {
      try {
        importedIconRef.current = (
          await import(`../assets/${folder}/${iconName}.svg`)
        ).ReactComponent; // svgr provides ReactComponent for given svg path

      } catch (err) {
        setError(err);
        console.error(err);
      } finally {
        // timeout 
        //setTimeout(() => setLoading(false), 3000);
        setLoading(false);

      }
    };

    importSvgIcon();
  }, [iconName]);

  return { error, loading, SvgIcon: importedIconRef.current };
}

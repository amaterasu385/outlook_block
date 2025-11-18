'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HelpModeContextType {
    isHelpModeEnabled: boolean;
    toggleHelpMode: () => void;
}

const HelpModeContext = createContext<HelpModeContextType | undefined>(undefined);

export function HelpModeProvider({ children }: { children: ReactNode }) {
    const [isHelpModeEnabled, setIsHelpModeEnabled] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Beim ersten Laden: Prüfen ob Benutzer schon mal da war
        const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');

        if (!hasVisitedBefore) {
            // Erster Besuch: Hilfe-Modus aktivieren
            setIsHelpModeEnabled(true);
            localStorage.setItem('hasVisitedBefore', 'true');
        } else {
            // Gespeicherte Präferenz laden
            const savedPreference = localStorage.getItem('helpModeEnabled');
            setIsHelpModeEnabled(savedPreference === 'true');
        }

        setIsInitialized(true);
    }, []);

    const toggleHelpMode = () => {
        const newValue = !isHelpModeEnabled;
        setIsHelpModeEnabled(newValue);
        localStorage.setItem('helpModeEnabled', String(newValue));
    };

    // Warten bis initialisiert, um Flackern zu vermeiden
    if (!isInitialized) {
        return null;
    }

    return (
        <HelpModeContext.Provider value={{ isHelpModeEnabled, toggleHelpMode }}>
            {children}
        </HelpModeContext.Provider>
    );
}

export function useHelpMode() {
    const context = useContext(HelpModeContext);
    if (context === undefined) {
        throw new Error('useHelpMode must be used within a HelpModeProvider');
    }
    return context;
}


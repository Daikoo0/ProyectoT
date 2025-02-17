import { atom, selector } from 'recoil';
import lithoJson from '../lithologic.json'
import {
    User,
    Fosil,
    formFosil, 
    sideBar, 
    LithologyTable, 
    formLithology, 
    settings,
    ProjectInfo,
    formMuestra,
    Muestra,
} from '../components/Prueba/types';


//---------Socket---------//
export const atSocket = atom<WebSocket | null>({
    key: "atSocket",
    default: null,
});

//---------Settings---------//
export const atSettings = atom<settings>({
    key: "atSettings",
    default: {
        scale: 1,
        isInverted: false,
        header: [],
    },
});

export const atSettingsHeader = selector({
    key: "atSettingsHeader",
    get: ({ get }) => {
        return get(atSettings).header;
    },
});

//---------Sidebar---------//
export const atSideBarState = atom<sideBar>({
    key: "atSideBarState",
    default: {
        isOpen: false,
        entityType: "",
        actionType: "",
    },
});

export const atSettingsScaleIsInverted = selector({
    key: "atSettingsScaleIsInverted",
    get: ({ get }) => {
        return [get(atSettings).scale, get(atSettings).isInverted];
    },
});

//---------Info Room---------//
export const atProjectInfo = atom<ProjectInfo>({
    key: "atProjectInfo",
    default: {
        Name: "untitled",
        Owner: "",
        Members: {
            Owner: "",
            Editors: [],
            Readers: [],
        },
        CreationDate: "",
        Description: "",
        Location: "",
        Lat: 0,
        Long: 0,
        Visible: false,
    },
});
    


//---------Lithology---------//
// Lithology array [index] -> Lithology
export const atLithologyTable = atom<Record<string, LithologyTable>>({
    key: 'atLithologyTable',
    default: {},
});

export const atLithologyTableOrder = atom<string[]>({
    key: 'atLithologyTableOrder',
    default: [],
});


export const atLithologyTableLength = selector({
    key: 'atLithologyTableLength',
    get: ({ get }) => {
        const Lithology = get(atLithologyTableOrder);
        return Lithology.length;
    },
});

export const lithologyPatternsAndContacts = selector({
    key: 'lithologyPatternsAndContacts',
    get: ({ get }) => {
        const Lithology = get(atLithologyTable);
        const patterns: string[] = [];
        const contacts: string[] = [];

        const order = get(atLithologyTableOrder);
        order.forEach((id: string) => {
            const row = Lithology[id];
            if (!patterns.includes(row["Litologia"].File) && lithoJson[row["Litologia"].File] > 1) {
                patterns.push(row["Litologia"].File);
            }
            if (!contacts.includes(row["Litologia"].Contact)) {
                contacts.push(row["Litologia"].Contact);
            }
        });

        return { patterns, contacts };
    },
});

export const atformLithology = atom<formLithology>({
    key: 'atformLithology',
    default: {
        index: null,
        column: null,
        File: 'Sin Pattern',
        ColorFill: '#ffffff',
        ColorStroke: '#000000',
        Zoom: 100,
        Tension: 0.5,
        initialHeight: 0,
        Height: 0,
        Rotation: 0,
        text: '',
        Contact: '111',
    },
});


//---------Fossils---------//   
// Fossils list [id] -> fossil 
export const atFossil = atom<Record<string, Fosil>>({
    key: 'atFossil',
    default: {},
});

// Define the atom to store the formFosil
export const atformFossil = atom<formFosil>({
    key: 'formFosil',
    default: {
        id: '',
        upper: 0,
        lower: 0,
        fosilImg: '',
        x: 0,
        fosilImgCopy: '',
    },
});

//---------Samples---------//   

export const atSamples = atom<Record<string, Muestra>>({
    key: 'formFosil',
    default: {},
});

export const atformSamples = atom<formMuestra>({
    key: 'atSamples',
    default: {
        id: '',
        upper: 0,
        lower: 0,
        muestraText: '',
        x: 0,
        muestraTextCopy: '',
    },
});


//---------Users---------// 
// Users list [id] -> User 
export const atomUsers = atom<Record<string, User>>({
    key: 'atomUsers',
    default: {},
});

// Selector to show visible users and remaining users
export const usersSelector = selector({
    key: 'usersSelector',
    get: ({ get }) => {
        const users = get(atomUsers);
        const usersArray = Object.values(users);
        const maxVisibleUsers = 3;
        const visibleUsers = usersArray.slice(0, maxVisibleUsers);
        const remainingUsers = usersArray.slice(maxVisibleUsers);

        return {
            visibleUsers,
            remainingUsers,
            remainingUsersCount: remainingUsers.length,
        };
    },
});





export interface UserEditing {
    name: string;
    lastName: string;
    age: number
    gender: string;
    nationality: string;
}

export interface UserPassword {
    password : string;
    newPassword : string;
    newPwConfirm : string;
}
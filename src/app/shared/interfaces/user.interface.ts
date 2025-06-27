// export interface User {
//     Id: string;
//     AccessToken: string;
//     Username: string;
//     FullName: string;
//     Email: string;
//     Avatar: string;
//     permissions: any;
//     roles: any;
//     RefreshToken: string;
// }

export interface User {
    Id: number;
    Username: string;
    Full_Name: string;
    Email: string;
    // Avatar: string;
    // permissions: any;
    // roles: any;
    RefreshToken: string;
    AccessToken: string;
    Is_Admin: boolean;
    Is_Active: boolean;
}

export interface UserLoginPayload {
    Username: string;
    Password: string;
}

// Thêm interface mới cho API Google Login
export interface ReturnBaseInfo<T = any> {
    ReturnStatus: StatusBaseInfo;
    ReturnData: T;
}

export interface StatusBaseInfo {
    Message: string;
    Code: number;
}

export interface AuthResponseInfo {
    AccessToken: string;
    RefreshToken: string;
    Id: number;
    Username: string;
    Full_Name: string;
    Is_Admin: boolean;
}

export interface GoogleLoginRequest {
    IdToken: string;
}

// public int Id { get; set; }
// public string Username { get; set; }
// public string Full_Name { get; set; }
// public string AccessToken { get; set; }
// public string RefreshToken { get; set; }
// public bool Is_Admin { get; set; }

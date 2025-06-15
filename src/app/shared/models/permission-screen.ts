export class PermissionScreen {
    Id: string;
    Name: string;
    ParentId: string;
    HasCreate: boolean;
    ValueCreate: boolean = false;
    HasUpdate: boolean;
    ValueUpdate: boolean = false;
    HasDelete: boolean;
    ValueDelete: boolean = false;
    HasView: boolean;
    ValueView: boolean = false;
    HasDownload: boolean;
    ValueDownload: boolean = false;
    HasUpload: boolean
    ValueUpload: boolean = false;
    // HasUnApprove: boolean;
    // ValueUnApprove: boolean = false;
    HasApprove: boolean;
    ValueApprove: boolean = false;
}
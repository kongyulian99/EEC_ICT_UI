export class ResponseData<T = any> {
    ReturnData: T;
    ReturnStatus!: Status;
}
export class Status {
    Code!: number;
    Message!: string
}
export class Pagination {
    PageSize!: number;
    PageIndex!: number;
    TotalRows!: number
}

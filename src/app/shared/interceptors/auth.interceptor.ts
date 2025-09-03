import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { AuthenService } from '../services/auth.service';
import { catchError, switchMap, filter, take, map } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';
import { SystemConstants } from '../constants/systems.constant';
import { ResponseData } from '../models';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthResponseInterceptor implements HttpInterceptor {
    private RefreshTokenInProgress = false;
    private RefreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private authService: AuthenService,
        private router: Router

    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // if (request.url.includes('pmdoanhtrai'))
        // {

        //     let thongtinDoanhTrai = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_THONGTIN_DOANHTRAI));
        //     let KEY_SECRET: string = 'ghrhgrhjrf';

        //     if (!thongtinDoanhTrai) {
        //        return next.handle(request);
        //     }

        //     return next.handle(request.clone({
        //         setHeaders: {
        //            Authorization:  `${thongtinDoanhTrai.token_type} ${thongtinDoanhTrai.access_token}${KEY_SECRET}`
        //         }
        //     }));
        // }

        return next.handle(request.clone({
                setHeaders: {
                    Authorization: `${this.authService.authorizationHeaderValue}`
                }
            }))
            .pipe(
                // map(
                //     (event: HttpResponse<any>) => {
                //         console.log(event.body)
                //         return event
                //     },
                // ),
                catchError((error: any) => {
                    // error authorization
                    if (error instanceof HttpErrorResponse && (error.status === 401)) {
                        // get user token and RefreshToken
                        const currentUserInfo = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) as string);
                        if (currentUserInfo.AccessToken && currentUserInfo.RefreshToken) {
                            // send RefreshToken to get new access token

                            if (this.RefreshTokenInProgress) {
                                // in process refresh token, subrequest will wait until refreshtokensubject return not null value
                                return this.RefreshTokenSubject.pipe(
                                    filter(result => result !== null),
                                    take(1),
                                    switchMap(() => next.handle(this.addAuthHeaderAccessToken(request)))
                                );
                            } else {
                                // in process refresh token
                                this.RefreshTokenInProgress = true;
                                this.RefreshTokenSubject.next(null);
                                return this.authService.refreshToken(currentUserInfo.RefreshToken)
                                .pipe(
                                    switchMap((response: any) => {
                                        if (response.ReturnStatus.Code === 1) {
                                            currentUserInfo.AccessToken = response.ReturnData.AccessToken;
                                            currentUserInfo.RefreshToken = response.ReturnData.RefreshToken;

                                            // save new tokens
                                            localStorage.setItem(SystemConstants.CURRENT_USER, JSON.stringify(currentUserInfo));

                                            // end process refresh token
                                            this.RefreshTokenInProgress = false;
                                            this.RefreshTokenSubject.next(currentUserInfo.RefreshToken);
                                            // resend previous request
                                            return next.handle(this.addAuthHeaderAccessToken(request));
                                        } else {
                                            // refresh token fail
                                            this.RefreshTokenInProgress = false;
                                            // delete user data
                                            localStorage.removeItem(SystemConstants.CURRENT_USER);
                                            this.router.navigate(['/login']).then(()=>{
                                                // response.Status.Code = 401;
                                                response.ReturnStatus.Message = 'Login session expired';
                                                // console.log('dkfjd');
                                                return throwError(()=>response);

                                            });
                                        }
                                        // console.log('dfjdkf');
                                        return throwError(()=>response);
                                    })
                                );
                            }
                        } else {
                            // console.log('navigate To Login');
                            this.router.navigate(['/login']);
                        }
                    }
                    return throwError(()=>error);
                })
            );
    }

    addAuthHeaderAccessToken(request: HttpRequest<any>) {
        return request.clone({
            setHeaders: {
                Authorization: `${this.authService.authorizationHeaderValue}`
            }
        });
    }
}

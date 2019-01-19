import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthData } from "./auth-data.model";
import { Subject } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private token: string;
  private isAuthenticated = false;
  private expiresInDuration: number;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: any;
  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }
  getAuth() {
    return this.isAuthenticated;
  }
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }
  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.router.navigate(["/"]);
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    };
    this.http
      .post("http://localhost:3000/api/user/signup", authData)
      .subscribe(result => {
        console.log(result);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    };
    this.http
      .post<{ token: string; expiresIn: number }>(
        "http://localhost:3000/api/user/login",
        authData
      )
      .subscribe(result => {
        const token = result.token;
        this.token = token;
        if (this.token) {
          this.expiresInDuration = result.expiresIn;
          this.tokenTimer = setTimeout(() => {
            this.logout();
          }, this.expiresInDuration * 1000);
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + this.expiresInDuration * 1000
          );
          this.saveAuthData(token, expirationDate);
          this.router.navigate(["/"]);
        }
      });
  }
  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
  }

  getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate)
    };
  }
  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.tokenTimer = setTimeout(() => {
        this.logout();
      }, expiresIn);
      this.authStatusListener.next(true);
    }
  }
}

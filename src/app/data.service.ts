import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DataService {
  private dataUrl =
    "https://run.mocky.io/v3/301ed72d-b98f-4a7e-a26f-99c1c206a200";

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get(this.dataUrl).pipe(
      tap((_) => console.log("fetched data")),
      catchError(this.handleError<any>("getData", []))
    );
  }

  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console
      return of(result as T);
    };
  }
}

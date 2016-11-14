import { Injectable } from "@angular/core";
import { Response } from "@angular/http";

import { Interceptor } from "../interceptor.handler";

declare var UIkit: any;

/**
 * Default implementation use UIKit Notifications and Dialog
 * If you use the default you must add UIKit as dependency of your project, 
 * and setup it
 */
@Injectable()
export class DialogService {
    showMessage(message: string, status: string) {
        UIkit.notify(message, status);
    }

    showError(message: string, status: string) {
        UIkit.modal.alert(message);
    }
}

@Injectable()
export class DialogInterceptor implements Interceptor {
    constructor(private dialog: DialogService) {
    }
    requestCreated(request: any) {

    }
    requestEnded(response: any) {
        if (response.status >= 200 && response.status < 300
            && (response.text() != null && (this.isHeaderStartsWithValue(response, 'Content-Type', 'text/plain')
                || this.isHeaderStartsWithValue(response, 'Content-Type', 'text/html')))) {
            this.dialog.showMessage(response.text(), 'info');
        }

        if (response.status >= 500 && response.status < 600) {
            this.dialog.showError(response.text(), response.status);
        } else if (response.status >= 400 && response.status < 500) {
            this.dialog.showError(response.text(), response.status);

        }

    }
    requestError(err: any) {
        this.dialog.showError(err, 'error');
    }

    isHeaderStartsWithValue(response: Response, header: string, value: string): boolean {
        return response.headers.has(header) && response.headers.get(header).startsWith(value);
    }

}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ParsedDocumentData, DocumentType } from '../models/document-upload.models';

@Injectable({
  providedIn: 'root'
})
export class DocumentUploadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  uploadDocument(
    companyId: string,
    file: File,
    documentType: DocumentType
  ): Observable<ParsedDocumentData> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    return this.http.post<ParsedDocumentData>(
      `${this.apiUrl}/companies/${companyId}/documents/upload`,
      formData
    );
  }
}

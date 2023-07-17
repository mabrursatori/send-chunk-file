import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('fileInput') fileInputs: ElementRef | undefined;
  constructor(private http: HttpClient) {}

  uploadFile() {
    console.log("TEST")
    const fileInput = this.fileInputs?.nativeElement;
    console.log(fileInput)
    if(fileInput && fileInput.files) {
      const file = fileInput.files[0];
      const fileName = file.name;
  
      const reader = new FileReader();
      reader.onload = (event: any) => {
        console.log(event.target)
        const binaryData = event.target.result;
        const splitData = this.splitBinaryData(binaryData);
        console.log(splitData);
        this.sendSplitData(splitData, fileName);
      };
      reader.readAsArrayBuffer(file);
    }
    
  }

  splitBinaryData(binaryData: ArrayBuffer): ArrayBuffer[] {
    const chunkSize = 1024; // Ukuran chunk dalam byte
    const chunks = Math.ceil(binaryData.byteLength / chunkSize);
    const splitData: ArrayBuffer[] = [];

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, binaryData.byteLength);
      const chunk = binaryData.slice(start, end);
      splitData.push(chunk);
    }

    return splitData;
  }

  sendSplitData(splitData: ArrayBuffer[], fileName: string) {
    let currentIndex = 0;
    const token = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4OCIsInVzZXJSb2xlVHlwZSI6IlJPTEVfVkNfVVNFUiIsInVzZXJUeXBlIjoiY2FsbGVyIiwibG9naW5Vc2VySUQiOjg4LCJsb2dpblVzZXJOYW1lIjoiQ1MzIiwibG9naW5Vc2VyIjoiQ1MzIiwibG9naW5UZXJtaW5hbElEIjoyNTQsImxvZ2luVGVybWluYWxOYW1lIjoiQ1MgMyIsImRlZmF1bHRMYW5ndWFnZSI6ImlkIiwiYnJhbmNoQ29kZSI6IkJESU1ETiIsImJyYW5jaE5hbWUiOiJLQyBQdXRyaSBIaWphdSBNZWRhbiIsInVzZXJMb2dpbklEIjoyMTAzNiwiY2xpZW50SVBBZGRyZXNzIjoiMTgwLjI0Mi4xMjguMTcwIiwibG9naW5Vc2VySW5mbyI6IlFrUkpUVVJPT0RoYlEwRk1URVZTWDBGTVRFOVhYME5CVEV3c0lFTkJURXhGVWw5QlRFeFBWMTlFU1ZKRlExUmZVMFZTVmtVc0lFTkJURXhGVWw5QlRFeFBWMTlRVlZSZlNFOU1SQ3dnUTBGTVRFVlNYMEZNVEU5WFgwTlNSVUZVUlY5VVNVTkxSVlFzSUVOQlRFeEZVbDlCVEV4UFYxOVVVa0ZPVTBaRlVpd2dRMEZNVEVWU1gxVlRSVjlVVWtGT1UwRkRWRWxQVGw5RFQwUkZMQ0JEUVV4TVJWSmZWVk5GWDFKRlEwOVNSRjlWVTBWU1gwRkRWRWxXU1ZSWlhRPT0iLCJpYXQiOjE2ODk1Njg3NzMsImV4cCI6MTY4OTYwNDc3M30.-26kIYLU8ysWiLB5Z1Pn-3JBrFzwyuY9rtVjLYtpj7npI10TFpKhu4PAIDJ3ybRCYB5fsLI2arH_vt_kaB1Wzg";
    const url = 'http://localhost:8080/api/v1/caller/uploadRecordedVoice';
    

    const sendNextChunk = () => {
      const chunk = splitData[currentIndex];
      const headers = new HttpHeaders()
      .set('Content-Type', 'application/octet-stream')
      .set('Authorization', token)
      .set('fileName', fileName)
      .set('index', currentIndex.toString())
      .set('IsLast', (currentIndex + 1 == splitData.length) ? 'T' : 'F')
      console.log(headers)
      this.http.post(url, chunk, { headers }).subscribe(
        (res) => {
          console.log(res);
          if (currentIndex < splitData.length - 1) {
            currentIndex++;
            sendNextChunk();
          } else {
            console.log('File berhasil dikirim.');
          }
        },
        (error) => {
          console.error('Gagal mengirim file.', error);
        }
      );
    };

    sendNextChunk();
  }
}
